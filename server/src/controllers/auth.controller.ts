import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import prisma from '../utils/prisma';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

function generateTokens(userId: string, email: string) {
  const accessToken = jwt.sign(
    { userId, email },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { userId, email },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
}

function setRefreshCookie(res: Response, refreshToken: string) {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth',
  });
}

export async function register(req: Request, res: Response): Promise<void> {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.errors[0].message });
    return;
  }

  const { email, password } = result.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, passwordHash },
    select: { id: true, email: true, isGuest: true, createdAt: true },
  });

  // Seed relationship + emotion records for all system characters
  const systemCharacters = await prisma.character.findMany({
    where: { isSystemCharacter: true },
    select: { id: true },
  });

  for (const char of systemCharacters) {
    await prisma.relationship.create({
      data: { userId: user.id, characterId: char.id },
    });
    await prisma.emotionalState.create({
      data: { userId: user.id, characterId: char.id, currentEmotion: 'calm', intensity: 0.5 },
    });
  }

  const { accessToken, refreshToken } = generateTokens(user.id, user.email);
  setRefreshCookie(res, refreshToken);

  res.status(201).json({ user, accessToken });
}

export async function login(req: Request, res: Response): Promise<void> {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.errors[0].message });
    return;
  }

  const { email, password } = result.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const { accessToken, refreshToken } = generateTokens(user.id, user.email);
  setRefreshCookie(res, refreshToken);

  res.json({
    user: { id: user.id, email: user.email, isGuest: user.isGuest, createdAt: user.createdAt },
    accessToken,
  });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.refreshToken;
  if (!token) {
    res.status(401).json({ error: 'No refresh token' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { userId: string; email: string };
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId, decoded.email);
    setRefreshCookie(res, newRefreshToken);
    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.json({ message: 'Logged out successfully' });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, email: true, isGuest: true, createdAt: true },
  });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ user });
}

export async function guestLogin(_req: Request, res: Response): Promise<void> {
  // Create a throwaway account with a unique guest email and random password
  const guestSuffix = crypto.randomBytes(8).toString('hex');
  const email = `guest_${guestSuffix}@persona.guest`;
  const passwordHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);

  const user = await prisma.user.create({
    data: { email, passwordHash, isGuest: true },
    select: { id: true, email: true, isGuest: true, createdAt: true },
  });

  // Seed relationship + emotion records for all system characters (same as regular register)
  const systemCharacters = await prisma.character.findMany({
    where: { isSystemCharacter: true },
    select: { id: true },
  });

  for (const char of systemCharacters) {
    await prisma.relationship.create({
      data: { userId: user.id, characterId: char.id },
    });
    await prisma.emotionalState.create({
      data: { userId: user.id, characterId: char.id, currentEmotion: 'calm', intensity: 0.5 },
    });
  }

  const { accessToken, refreshToken } = generateTokens(user.id, user.email);
  setRefreshCookie(res, refreshToken);

  res.status(201).json({ user, accessToken });
}

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const RESET_TOKEN_TTL_MINUTES = 60;

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const result = forgotPasswordSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.errors[0].message });
    return;
  }

  const { email } = result.data;

  // Always return the same response to prevent email enumeration
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    // Invalidate any existing unused tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    // In production: send email with reset link containing token
    // e.g. `${process.env.CLIENT_URL}/reset-password?token=${token}`
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n[DEV] Password reset token for ${email}:\n  Token: ${token}\n  Expires: ${expiresAt.toISOString()}\n`);
    }
  }

  // Return the same response regardless of whether the user exists
  res.json({
    message: 'If that email is registered, a password reset link has been sent.',
    // In development, expose the token directly so the flow can be tested without email
    ...(process.env.NODE_ENV !== 'production' && user
      ? { devToken: await prisma.passwordResetToken.findFirst({
            where: { userId: user.id, used: false },
            orderBy: { createdAt: 'desc' },
            select: { token: true },
          }).then((r) => r?.token) }
      : {}),
  });
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const result = resetPasswordSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.errors[0].message });
    return;
  }

  const { token, password } = result.data;

  const resetRecord = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetRecord) {
    res.status(400).json({ error: 'Invalid or expired reset token' });
    return;
  }

  if (resetRecord.used) {
    res.status(400).json({ error: 'This reset link has already been used' });
    return;
  }

  if (new Date() > resetRecord.expiresAt) {
    res.status(400).json({ error: 'Reset link has expired. Please request a new one.' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // Update password and mark token as used in a transaction
  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { used: true },
    }),
  ]);

  res.json({ message: 'Password reset successfully. You can now sign in.' });
}
