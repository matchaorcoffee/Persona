import prisma from '../utils/prisma';
import { getAIService } from './ai';
import { EmotionType } from '../types';

const VALID_EMOTIONS: EmotionType[] = [
  'happy', 'excited', 'curious', 'sad', 'nervous',
  'annoyed', 'jealous', 'affectionate', 'calm', 'lonely',
];

interface EmotionResult {
  emotion: EmotionType;
  intensity: number;
}

export class EmotionService {
  static async update(
    userId: string,
    characterId: string,
    characterName: string,
    userMessage: string,
    assistantReply: string
  ): Promise<{ currentEmotion: EmotionType; intensity: number }> {
    const current = await prisma.emotionalState.findUnique({
      where: { userId_characterId: { userId, characterId } },
    });

    try {
      const ai = getAIService();

      const prompt = `You are determining the current emotional state of an AI character named ${characterName} after this conversation exchange.

User message: "${userMessage}"
${characterName}'s reply: "${assistantReply}"

Based on the exchange, what emotion should ${characterName} be feeling right now?
Choose EXACTLY one emotion from this list: happy, excited, curious, sad, nervous, annoyed, jealous, affectionate, calm, lonely

Also rate the intensity from 0.1 (barely feeling it) to 1.0 (strongly feeling it).

Return JSON:
{
  "emotion": "one of the emotions listed above",
  "intensity": 0.0 to 1.0
}`;

      const result = await ai.extractJSON<EmotionResult>(prompt);

      const emotion = VALID_EMOTIONS.includes(result.emotion) ? result.emotion : 'calm';
      const intensity = Math.min(1, Math.max(0.1, result.intensity || 0.5));

      await prisma.emotionalState.upsert({
        where: { userId_characterId: { userId, characterId } },
        update: { currentEmotion: emotion, intensity },
        create: { userId, characterId, currentEmotion: emotion, intensity },
      });

      return { currentEmotion: emotion, intensity };
    } catch (error) {
      console.error('Emotion update error:', error);
      // Return current state on error
      return {
        currentEmotion: (current?.currentEmotion as EmotionType) || 'calm',
        intensity: current?.intensity || 0.5,
      };
    }
  }

  static async get(userId: string, characterId: string) {
    const state = await prisma.emotionalState.findUnique({
      where: { userId_characterId: { userId, characterId } },
    });
    return state || { currentEmotion: 'calm' as EmotionType, intensity: 0.5 };
  }

  static async ensureExists(userId: string, characterId: string): Promise<void> {
    const existing = await prisma.emotionalState.findUnique({
      where: { userId_characterId: { userId, characterId } },
    });
    if (!existing) {
      await prisma.emotionalState.create({
        data: { userId, characterId, currentEmotion: 'calm', intensity: 0.5 },
      });
    }
  }
}
