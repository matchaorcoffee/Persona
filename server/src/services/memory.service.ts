import prisma from '../utils/prisma';
import { getAIService } from './ai';
import { MemoryType } from '../types';

interface ExtractedMemory {
  type: MemoryType;
  content: string;
  importance: number;
}

export class MemoryService {
  static async extract(
    userId: string,
    characterId: string,
    userMessage: string,
    assistantReply: string
  ): Promise<void> {
    try {
      const ai = getAIService();

      const prompt = `Analyze this conversation exchange and extract any important, memorable information about the user.
Only extract genuinely meaningful information — facts, preferences, important events, emotional milestones.
Do NOT extract trivial pleasantries or information that will be obvious or irrelevant later.

User message: "${userMessage}"
Assistant reply: "${assistantReply}"

Return a JSON object with a single key "memories" containing an array of objects.
Each object must have:
- "type": one of "FACT", "EVENT", "PREFERENCE", "MILESTONE"
- "content": a concise description of what to remember (max 100 chars)
- "importance": integer 1-10 (10 = most important)

Examples of high-importance memories:
- User said their name or nickname (FACT, importance 9)
- User mentioned a significant life event like a birthday, job change, loss (EVENT, importance 8)
- User revealed a strong preference or dislike (PREFERENCE, importance 7)
- First time user expressed deep trust or vulnerability (MILESTONE, importance 9)

Return empty array if nothing worth remembering occurred.
Return ONLY the JSON object.`;

      const result = await ai.extractJSON<{ memories: ExtractedMemory[] }>(prompt);
      const memories = result.memories || [];

      // Filter low-importance
      const significant = memories.filter((m) => m.importance >= 4);

      for (const mem of significant) {
        // Check for near-duplicate
        const existing = await prisma.memory.findFirst({
          where: {
            userId,
            characterId,
            content: {
              contains: mem.content.substring(0, 30),
              mode: 'insensitive',
            },
          },
        });

        if (!existing) {
          await prisma.memory.create({
            data: {
              userId,
              characterId,
              type: mem.type as MemoryType,
              content: mem.content,
              importance: Math.min(10, Math.max(1, Math.round(mem.importance))),
            },
          });
        }
      }
    } catch (error) {
      // Memory extraction is non-critical — log and continue
      console.error('Memory extraction error:', error);
    }
  }

  static async getRelevant(userId: string, characterId: string, limit = 8) {
    return prisma.memory.findMany({
      where: { userId, characterId },
      orderBy: [{ importance: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });
  }

  static async getAll(userId: string, characterId: string, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const [memories, total] = await Promise.all([
      prisma.memory.findMany({
        where: { userId, characterId },
        orderBy: [{ importance: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: pageSize,
      }),
      prisma.memory.count({ where: { userId, characterId } }),
    ]);
    return { memories, total, page, pageSize };
  }
}
