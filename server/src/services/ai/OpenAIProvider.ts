import OpenAI from 'openai';
import { AIService, ChatMessage } from './AIService.interface';

export class OpenAIProvider implements AIService {
  private client: OpenAI;
  private model: string;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.model = process.env.AI_MODEL || 'gpt-4o';
  }

  async chat(systemPrompt: string, messages: ChatMessage[]): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ],
      max_tokens: 1024,
      temperature: 0.85,
    });

    return response.choices[0]?.message?.content || '';
  }

  async extractJSON<T>(prompt: string): Promise<T> {
    const lightModel = 'gpt-4o-mini';
    const response = await this.client.chat.completions.create({
      model: lightModel,
      messages: [
        {
          role: 'system',
          content: 'You are a JSON extraction assistant. Always respond with valid JSON only. No markdown, no explanation.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 512,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const text = response.choices[0]?.message?.content || '{}';
    try {
      return JSON.parse(text) as T;
    } catch {
      console.error('Failed to parse JSON from AI:', text);
      throw new Error('AI returned invalid JSON');
    }
  }
}
