export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIService {
  chat(systemPrompt: string, messages: ChatMessage[]): Promise<string>;
  extractJSON<T>(prompt: string): Promise<T>;
}
