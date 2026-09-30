import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';
import { RelationshipService } from '../services/relationship.service';
import { EmotionService } from '../services/emotion.service';

const personalitySchema = z.object({
  type: z.string(),
  communicationStyle: z.string(),
  humorLevel: z.enum(['none', 'subtle', 'moderate', 'high']),
  emotionalOpenness: z.enum(['closed', 'reserved', 'moderate', 'open', 'very_open']),
  confidence: z.enum(['low', 'moderate', 'high', 'very_high']),
  interests: z.array(z.string()),
  likes: z.array(z.string()),
  dislikes: z.array(z.string()),
  values: z.array(z.string()),
  quirks: z.array(z.string()),
  backstory: z.string(),
  responseGuidelines: z.string(),
  speechPatterns: z.string(),
  colorTheme: z.string().optional().default('blue'),
});

const createCharacterSchema = z.object({
  name: z.string().min(1).max(50),
  avatarUrl: z.string().url('Avatar must be a valid URL'),
  tagline: z.string().min(1).max(120),
  description: z.string().min(10).max(1000),
  personalityJson: personalitySchema,
  isPublic: z.boolean().optional().default(false),
});

async function getCharacterWithUserData(characterId: string, userId: string) {
  const [character, relationship, emotionalState] = await Promise.all([
    prisma.character.findUnique({ where: { id: characterId } }),
    prisma.relationship.findUnique({
      where: { userId_characterId: { userId, characterId } },
    }),
    prisma.emotionalState.findUnique({
      where: { userId_characterId: { userId, characterId } },
    }),
  ]);
  return { character, relationship, emotionalState };
}

export async function listCharacters(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;

  const characters = await prisma.character.findMany({
    where: {
      OR: [
        { isSystemCharacter: true },
        { createdByUserId: userId },
        { isPublic: true, isSystemCharacter: false },
      ],
    },
    orderBy: [{ isSystemCharacter: 'desc' }, { createdAt: 'asc' }],
  });

  // Attach relationship + emotional state for each character
  const charIds = characters.map((c) => c.id);

  const [relationships, emotionalStates] = await Promise.all([
    prisma.relationship.findMany({
      where: { userId, characterId: { in: charIds } },
    }),
    prisma.emotionalState.findMany({
      where: { userId, characterId: { in: charIds } },
    }),
  ]);

  const relMap = Object.fromEntries(relationships.map((r) => [r.characterId, r]));
  const emoMap = Object.fromEntries(emotionalStates.map((e) => [e.characterId, e]));

  const result = characters.map((char) => ({
    ...char,
    relationship: relMap[char.id] || null,
    emotionalState: emoMap[char.id] || { currentEmotion: 'calm', intensity: 0.5 },
  }));

  res.json({ characters: result });
}

export async function getCharacter(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { id } = req.params;

  const { character, relationship, emotionalState } = await getCharacterWithUserData(id, userId);

  if (!character) {
    res.status(404).json({ error: 'Character not found' });
    return;
  }

  // Check access: system characters or own or public
  const hasAccess =
    character.isSystemCharacter ||
    character.createdByUserId === userId ||
    character.isPublic;

  if (!hasAccess) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  // Ensure relationship/emotion records exist for non-system characters the user hasn't met yet
  if (!relationship) {
    await RelationshipService.ensureExists(userId, id);
    await EmotionService.ensureExists(userId, id);
  }

  // Get top memories
  const memories = await prisma.memory.findMany({
    where: { userId, characterId: id },
    orderBy: [{ importance: 'desc' }, { createdAt: 'desc' }],
    take: 10,
  });

  res.json({
    character,
    relationship: relationship || { stage: 'STRANGER', familiarity: 0, trust: 0, friendship: 0, affection: 0, curiosity: 5, emotionalCloseness: 0 },
    emotionalState: emotionalState || { currentEmotion: 'calm', intensity: 0.5 },
    memories,
  });
}

export async function createCharacter(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;

  const result = createCharacterSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.errors[0].message });
    return;
  }

  const { name, avatarUrl, tagline, description, personalityJson, isPublic } = result.data;

  const character = await prisma.character.create({
    data: {
      name,
      avatarUrl,
      tagline,
      description,
      personalityJson: personalityJson as unknown as Prisma.InputJsonValue,
      isSystemCharacter: false,
      isPublic: isPublic || false,
      createdByUserId: userId,
    },
  });

  // Seed relationship + emotion for creator
  await Promise.all([
    RelationshipService.ensureExists(userId, character.id),
    EmotionService.ensureExists(userId, character.id),
  ]);

  res.status(201).json({ character });
}

export async function updateCharacter(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { id } = req.params;

  const character = await prisma.character.findUnique({ where: { id } });
  if (!character) {
    res.status(404).json({ error: 'Character not found' });
    return;
  }
  if (character.isSystemCharacter || character.createdByUserId !== userId) {
    res.status(403).json({ error: 'Cannot modify this character' });
    return;
  }

  const result = createCharacterSchema.partial().safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.errors[0].message });
    return;
  }

  const updated = await prisma.character.update({
    where: { id },
    data: result.data as Record<string, unknown>,
  });

  res.json({ character: updated });
}

export async function deleteCharacter(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { id } = req.params;

  const character = await prisma.character.findUnique({ where: { id } });
  if (!character) {
    res.status(404).json({ error: 'Character not found' });
    return;
  }
  if (character.isSystemCharacter || character.createdByUserId !== userId) {
    res.status(403).json({ error: 'Cannot delete this character' });
    return;
  }

  await prisma.character.delete({ where: { id } });
  res.json({ message: 'Character deleted' });
}

export async function togglePublish(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { id } = req.params;

  const character = await prisma.character.findUnique({ where: { id } });
  if (!character) {
    res.status(404).json({ error: 'Character not found' });
    return;
  }
  if (character.isSystemCharacter || character.createdByUserId !== userId) {
    res.status(403).json({ error: 'Cannot modify this character' });
    return;
  }

  const updated = await prisma.character.update({
    where: { id },
    data: { isPublic: !character.isPublic },
  });

  res.json({ character: updated });
}

export async function getGallery(_req: Request, res: Response): Promise<void> {
  const characters = await prisma.character.findMany({
    where: { isPublic: true, isSystemCharacter: false },
    include: {
      createdBy: { select: { id: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ characters });
}
