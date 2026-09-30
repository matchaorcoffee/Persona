import { AIService } from './AIService.interface';
import { OpenAIProvider } from './OpenAIProvider';

let _aiService: AIService | null = null;

export function getAIService(): AIService {
  if (_aiService) return _aiService;

  const provider = process.env.AI_PROVIDER || 'openai';

  switch (provider) {
    case 'openai':
      _aiService = new OpenAIProvider();
      break;
    default:
      console.warn(`Unknown AI_PROVIDER "${provider}", falling back to OpenAI`);
      _aiService = new OpenAIProvider();
  }

  return _aiService;
}

export type { AIService, ChatMessage } from './AIService.interface';
