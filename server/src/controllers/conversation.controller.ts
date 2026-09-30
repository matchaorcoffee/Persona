import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import prisma from '../utils/prisma';
import { getAIService } from '../services/ai';
import { PromptBuilder } from '../services/ai/PromptBuilder';
import { MemoryService } from '../services/memory.service';
import { RelationshipService } from '../services/relationship.service';
import { EmotionService } from '../services/emotion.service';
import { PersonalityJson, RelationshipData, EmotionType, MemoryData } from '../types';

// Rate limiter for message endpoint
export const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { error: 'Too many messages, please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export async function createConversation(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { characterId, title } = req.body;

  if (!characterId) {
    res.status(400).json({ error: 'characterId is required' });
    return;
  }

  const character = await prisma.character.findUnique({ where: { id: characterId } });
  if (!character) {
    res.status(404).json({ error: 'Character not found' });
    return;
  }

  const conversation = await prisma.conversation.create({
    data: {
      userId,
      characterId,
      title: title || `Chat with ${character.name}`,
    },
    include: { character: { select: { id: true, name: true, avatarUrl: true } } },
  });

  res.status(201).json({ conversation });
}

export async function listConversations(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { characterId } = req.query;

  const where: Record<string, unknown> = { userId };
  if (characterId) where.characterId = characterId as string;

  const conversations = await prisma.conversation.findMany({
    where,
    include: {
      character: { select: { id: true, name: true, avatarUrl: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { content: true, role: true, createdAt: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  res.json({ conversations });
}

export async function getMessages(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { id } = req.params;
  const { cursor, limit = '30' } = req.query;

  const conversation = await prisma.conversation.findFirst({
    where: { id, userId },
  });

  if (!conversation) {
    res.status(404).json({ error: 'Conversation not found' });
    return;
  }

  const take = Math.min(parseInt(limit as string, 10) || 30, 100);

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: 'desc' },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor as string }, skip: 1 } : {}),
  });

  const hasMore = messages.length > take;
  const page = hasMore ? messages.slice(0, take) : messages;
  const nextCursor = hasMore ? page[page.length - 1].id : null;

  res.json({
    messages: page.reverse(), // Return in chronological order
    nextCursor,
    hasMore,
  });
}

export async function sendMessage(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { id: conversationId } = req.params;
  const { content } = req.body;

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    res.status(400).json({ error: 'Message content is required' });
    return;
  }

  // Validate conversation ownership
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
    include: { character: true },
  });

  if (!conversation) {
    res.status(404).json({ error: 'Conversation not found' });
    return;
  }

  const character = conversation.character;
  const characterId = character.id;

  // Save user message
  await prisma.message.create({
    data: { conversationId, role: 'USER', content: content.trim() },
  });

  // Load context in parallel
  const [recentMessages, relationship, emotionalState, memories] = await Promise.all([
    prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    RelationshipService.get(userId, characterId),
    EmotionService.get(userId, characterId),
    MemoryService.getRelevant(userId, characterId, 8),
  ]);

  const defaultRelationship: RelationshipData = {
    id: '',
    stage: 'STRANGER',
    familiarity: 0,
    trust: 0,
    friendship: 0,
    affection: 0,
    curiosity: 5,
    emotionalCloseness: 0,
    updatedAt: new Date(),
  };

  const currentRelationship = relationship || defaultRelationship;
  const currentEmotion = emotionalState || { currentEmotion: 'calm' as EmotionType, intensity: 0.5 };

  // Build AI prompt
  const systemPrompt = PromptBuilder.build({
    character: {
      name: character.name,
      personalityJson: character.personalityJson as unknown as PersonalityJson,
    },
    relationship: currentRelationship,
    emotionalState: currentEmotion as { currentEmotion: EmotionType; intensity: number },
    memories: memories as unknown as MemoryData[],
  });

  // Prepare conversation history (chronological order)
  const historyMessages = recentMessages
    .reverse()
    .slice(0, -1) // Exclude the message we just saved
    .map((m) => ({
      role: m.role === 'USER' ? ('user' as const) : ('assistant' as const),
      content: m.content,
    }));

  // Add current user message
  historyMessages.push({ role: 'user', content: content.trim() });

  // Generate AI response
  let aiReply: string;
  try {
    const ai = getAIService();
    aiReply = await ai.chat(systemPrompt, historyMessages);
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(503).json({ error: 'AI service temporarily unavailable' });
    return;
  }

  // Save assistant message
  const assistantMessage = await prisma.message.create({
    data: { conversationId, role: 'ASSISTANT', content: aiReply },
  });

  // Update conversation timestamp
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  // Fire-and-forget: update memory, relationship, emotion asynchronously
  Promise.all([
    MemoryService.extract(userId, characterId, content.trim(), aiReply),
    RelationshipService.update(userId, characterId, content.trim(), aiReply, character.name),
    EmotionService.update(userId, characterId, character.name, content.trim(), aiReply),
  ]).catch((err) => console.error('Post-message update error:', err));

  res.json({
    message: assistantMessage,
    relationship: currentRelationship,
    emotionalState: currentEmotion,
  });
}

export async function deleteConversation(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { id } = req.params;

  const conversation = await prisma.conversation.findFirst({ where: { id, userId } });
  if (!conversation) {
    res.status(404).json({ error: 'Conversation not found' });
    return;
  }

  await prisma.conversation.delete({ where: { id } });
  res.json({ message: 'Conversation deleted' });
}
