export type RelationshipStage =
  | 'STRANGER'
  | 'ACQUAINTANCE'
  | 'FRIEND'
  | 'CLOSE_FRIEND'
  | 'ROMANTIC_INTEREST'
  | 'DEEP_CONNECTION';

export type EmotionType =
  | 'happy'
  | 'excited'
  | 'curious'
  | 'sad'
  | 'nervous'
  | 'annoyed'
  | 'jealous'
  | 'affectionate'
  | 'calm'
  | 'lonely';

export type MemoryType = 'FACT' | 'EVENT' | 'PREFERENCE' | 'MILESTONE';

export interface PersonalityTraits {
  introversion: number;
  intuition: number;
  thinking: number;
  judging: number;
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  emotionalStability: number;
  confidence: number;
  curiosity: number;
  humor: number;
  assertiveness: number;
  patience: number;
  spontaneity: number;
  emotionalExpressiveness: number;
  independence: number;
  sociability: number;
  riskTolerance: number;
}

export interface CommunicationStyle {
  directness: number;
  formality: number;
  seriousness: number;
  verbosity: number;
  sarcasm: number;
  expressiveness: number;
  primaryStyle: string;
  tone: string;
  humor: string;
}

export interface RelationshipStyle {
  trustSpeed: number;
  affectionStyle: number;
  independence: number;
  protectiveness: number;
  emotionalReactivity: number;
}

export interface PersonalityJson {
  // Core (always present)
  type: string;
  communicationStyle: string;
  humorLevel: 'none' | 'subtle' | 'moderate' | 'high';
  emotionalOpenness: 'closed' | 'reserved' | 'moderate' | 'open' | 'very_open';
  confidence: 'low' | 'moderate' | 'high' | 'very_high';
  interests: string[];
  likes: string[];
  dislikes: string[];
  values: string[];
  quirks: string[];
  backstory: string;
  responseGuidelines: string;
  speechPatterns: string;
  colorTheme: string;

  // Rich (from personality test)
  mbtiType?: string;
  mbtiTitle?: string;
  mbtiDescription?: string;
  traits?: PersonalityTraits;
  communication?: CommunicationStyle;
  relationshipStyle?: RelationshipStyle;
  personalityTags?: string[];
  behaviourNotes?: string[];
}

export interface User {
  id: string;
  email: string;
  isGuest: boolean;
  createdAt: string;
}

export interface RelationshipData {
  id?: string;
  stage: RelationshipStage;
  familiarity: number;
  trust: number;
  friendship: number;
  affection: number;
  curiosity: number;
  emotionalCloseness: number;
  updatedAt?: string;
}

export interface EmotionalState {
  currentEmotion: EmotionType;
  intensity: number;
}

export interface Memory {
  id: string;
  type: MemoryType;
  content: string;
  importance: number;
  createdAt: string;
}

export interface Character {
  id: string;
  name: string;
  avatarUrl: string;
  tagline: string;
  description: string;
  personalityJson: PersonalityJson;
  isSystemCharacter: boolean;
  isPublic: boolean;
  createdByUserId: string | null;
  createdAt: string;
  relationship?: RelationshipData;
  emotionalState?: EmotionalState;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  characterId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  character?: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  messages?: Message[];
}

// Personality test types
export interface TestOption {
  id: string;
  text: string;
}

export interface TestQuestion {
  id: number;
  category: string;
  question: string;
  options: TestOption[];
}

export interface PersonalityTestResult {
  mbtiType: string;
  mbtiTitle: string;
  mbtiDescription: string;
  traits: PersonalityTraits;
  communication: CommunicationStyle;
  relationshipStyle: RelationshipStyle;
  personalityTags: string[];
  behaviourNotes: string[];
  colorTheme: string;
  humorLevel: PersonalityJson['humorLevel'];
  emotionalOpenness: PersonalityJson['emotionalOpenness'];
  confidence: PersonalityJson['confidence'];
  // Additional fields filled in by creator
  interests: string[];
  likes: string[];
  dislikes: string[];
  values: string[];
  quirks: string[];
  backstory: string;
  speechPatterns: string;
  responseGuidelines: string;
  communicationStyle: string;
  type: string;
}
