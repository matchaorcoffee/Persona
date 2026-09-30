import { Request, Response } from 'express';
import { QUESTIONS } from '../services/personality/questions';
import { calculatePersonalityProfile, buildCommunicationStyleText } from '../services/personality/scoring';

// Return all questions (without revealing score weights)
export async function getQuestions(_req: Request, res: Response): Promise<void> {
  const sanitized = QUESTIONS.map(({ id, category, question, options }) => ({
    id,
    category,
    question,
    options: options.map(({ id: oid, text }) => ({ id: oid, text })),
  }));
  res.json({ questions: sanitized, total: sanitized.length });
}

// Score answers and return full personality profile
export async function scoreTest(req: Request, res: Response): Promise<void> {
  const { answers } = req.body as { answers: Record<number, string> };

  if (!answers || typeof answers !== 'object') {
    res.status(400).json({ error: 'answers object required' });
    return;
  }

  const answeredCount = Object.keys(answers).length;
  if (answeredCount < 20) {
    res.status(400).json({ error: `At least 20 answers required, got ${answeredCount}` });
    return;
  }

  const profile = calculatePersonalityProfile(answers);

  // Build the full PersonalityJson scaffold from the test result
  // The creator will still fill in name, backstory, etc. separately
  const personalityJsonDraft = {
    type: profile.mbtiType,
    mbtiType: profile.mbtiType,
    mbtiTitle: profile.mbtiTitle,
    mbtiDescription: profile.mbtiDescription,
    communicationStyle: buildCommunicationStyleText(profile),
    humorLevel: profile.humorLevel,
    emotionalOpenness: profile.emotionalOpenness,
    confidence: profile.confidence,
    colorTheme: profile.colorTheme,
    traits: profile.traits,
    communication: profile.communication,
    relationshipStyle: profile.relationshipStyle,
    personalityTags: profile.personalityTags,
    behaviourNotes: profile.behaviourNotes,
    // These will be filled in by creator
    interests: [],
    likes: [],
    dislikes: [],
    values: [],
    quirks: [],
    backstory: '',
    speechPatterns: '',
    responseGuidelines: '',
  };

  res.json({ profile: personalityJsonDraft });
}
