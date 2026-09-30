export interface PersonalityTraits {
  // MBTI dimensions (0-100, higher = first letter of pair)
  introversion: number;      // 0=extrovert, 100=introvert
  intuition: number;         // 0=sensing, 100=intuition
  thinking: number;          // 0=feeling, 100=thinking
  judging: number;           // 0=perceiving, 100=judging

  // Big Five (0-100)
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  emotionalStability: number;

  // Behavioral traits (0-100)
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
  directness: number;        // 0=indirect, 100=direct
  formality: number;         // 0=casual, 100=formal
  seriousness: number;       // 0=playful, 100=serious
  verbosity: number;         // 0=concise, 100=talkative
  sarcasm: number;           // 0=sincere, 100=sarcastic
  expressiveness: number;    // 0=reserved, 100=expressive
  primaryStyle: string;      // e.g. "direct and dry"
  tone: string;              // e.g. "calm"
  humor: string;             // e.g. "dry wit"
}

export interface RelationshipStyle {
  trustSpeed: number;        // 0=slow, 100=quick
  affectionStyle: number;    // 0=subtle, 100=demonstrative
  independence: number;      // 0=dependent, 100=independent
  protectiveness: number;    // 0=carefree, 100=protective
  emotionalReactivity: number; // 0=stable, 100=reactive
}

export interface PersonalityJson {
  // Legacy fields (kept for backward compat with manual creation + seed)
  type: string; // MBTI type e.g. "INTJ"
  communicationStyle: string; // text description
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

  // Rich personality profile (from test)
  mbtiType?: string;         // e.g. "INTJ"
  mbtiTitle?: string;        // e.g. "The Strategist"
  mbtiDescription?: string;  // short personality summary
  traits?: PersonalityTraits;
  communication?: CommunicationStyle;
  relationshipStyle?: RelationshipStyle;
  personalityTags?: string[]; // e.g. ["Reserved", "Analytical", "Strategic"]
  behaviourNotes?: string[];  // e.g. ["Thinks before responding"]
}

export interface RelationshipData {
  id: string;
  stage: RelationshipStage;
  familiarity: number;
  trust: number;
  friendship: number;
  affection: number;
  curiosity: number;
  emotionalCloseness: number;
  updatedAt: Date;
}

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

export interface MemoryData {
  id: string;
  type: MemoryType;
  content: string;
  importance: number;
  createdAt: Date;
}

export interface CharacterWithRelationship {
  id: string;
  name: string;
  avatarUrl: string;
  tagline: string;
  description: string;
  personalityJson: PersonalityJson;
  isSystemCharacter: boolean;
  isPublic: boolean;
  createdByUserId: string | null;
  createdAt: Date;
  relationship?: RelationshipData;
  emotionalState?: {
    currentEmotion: EmotionType;
    intensity: number;
  };
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}
