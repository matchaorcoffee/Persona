import prisma from '../utils/prisma';
import { getAIService } from './ai';
import { RelationshipData, RelationshipStage } from '../types';

interface RelationshipDeltas {
  familiarity: number;
  trust: number;
  friendship: number;
  affection: number;
  curiosity: number;
  emotionalCloseness: number;
}

// Stage thresholds based on weighted sum of all 6 dimensions (each 0-100)
function calculateStage(rel: RelationshipData): RelationshipStage {
  const sum =
    rel.familiarity * 0.15 +
    rel.trust * 0.2 +
    rel.friendship * 0.2 +
    rel.affection * 0.2 +
    rel.curiosity * 0.1 +
    rel.emotionalCloseness * 0.15;

  if (sum >= 88) return 'DEEP_CONNECTION';
  if (sum >= 75) return 'ROMANTIC_INTEREST';
  if (sum >= 60) return 'CLOSE_FRIEND';
  if (sum >= 40) return 'FRIEND';
  if (sum >= 20) return 'ACQUAINTANCE';
  return 'STRANGER';
}

function clamp(val: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, val));
}

export class RelationshipService {
  static async update(
    userId: string,
    characterId: string,
    userMessage: string,
    assistantReply: string,
    characterName: string
  ): Promise<RelationshipData> {
    const current = await prisma.relationship.findUnique({
      where: { userId_characterId: { userId, characterId } },
    });

    if (!current) {
      throw new Error('Relationship record not found');
    }

    try {
      const ai = getAIService();

      const prompt = `You are analyzing a conversation to determine how it affects a relationship between a user and an AI character named ${characterName}.

User message: "${userMessage}"
Character reply: "${assistantReply}"

Based on the content and emotional tone of this exchange, how should each relationship dimension change?
Return values between -1.0 (very negative impact) and +1.0 (very positive impact). Use 0 for no change.
Small values (0.1-0.3) are normal. Large values (0.7-1.0) should only be for major emotional moments.

Return a JSON object with exactly these keys:
{
  "familiarity": number,
  "trust": number,
  "friendship": number,
  "affection": number,
  "curiosity": number,
  "emotionalCloseness": number
}`;

      const deltas = await ai.extractJSON<RelationshipDeltas>(prompt);

      // Apply deltas with scaling factor to prevent large jumps
      const SCALE = 4.0; // max delta per exchange on a 0-100 scale
      const updated = {
        familiarity: clamp(current.familiarity + (deltas.familiarity || 0) * SCALE),
        trust: clamp(current.trust + (deltas.trust || 0) * SCALE),
        friendship: clamp(current.friendship + (deltas.friendship || 0) * SCALE),
        affection: clamp(current.affection + (deltas.affection || 0) * SCALE),
        curiosity: clamp(current.curiosity + (deltas.curiosity || 0) * SCALE),
        emotionalCloseness: clamp(current.emotionalCloseness + (deltas.emotionalCloseness || 0) * SCALE),
      };

      // Build a temporary relationship object for stage calculation
      const tempRel = { ...current, ...updated } as RelationshipData;
      const newStage = calculateStage(tempRel);

      const result = await prisma.relationship.update({
        where: { userId_characterId: { userId, characterId } },
        data: { ...updated, stage: newStage },
      });

      return result as unknown as RelationshipData;
    } catch (error) {
      console.error('Relationship update error:', error);
      // Return unchanged on error
      return current as unknown as RelationshipData;
    }
  }

  static async get(userId: string, characterId: string): Promise<RelationshipData | null> {
    const rel = await prisma.relationship.findUnique({
      where: { userId_characterId: { userId, characterId } },
    });
    return rel as unknown as RelationshipData | null;
  }

  static async ensureExists(userId: string, characterId: string): Promise<void> {
    const existing = await prisma.relationship.findUnique({
      where: { userId_characterId: { userId, characterId } },
    });
    if (!existing) {
      await prisma.relationship.create({ data: { userId, characterId } });
    }
  }
}
