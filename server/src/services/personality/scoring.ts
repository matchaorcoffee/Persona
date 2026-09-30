import { TraitScores, QUESTIONS, TestQuestion } from './questions';
import { PersonalityJson, PersonalityTraits, CommunicationStyle, RelationshipStyle } from '../../types';

type Answers = Record<number, string>; // questionId -> optionId

function emptyScores(): TraitScores {
  return {
    introversion: 0, intuition: 0, thinking: 0, judging: 0,
    openness: 0, conscientiousness: 0, extraversion: 0, agreeableness: 0, emotionalStability: 0,
    confidence: 0, curiosity: 0, humor: 0, assertiveness: 0, patience: 0,
    spontaneity: 0, emotionalExpressiveness: 0, independence: 0, sociability: 0, riskTolerance: 0,
    directness: 0, formality: 0, seriousness: 0, verbosity: 0, sarcasm: 0, comExpressiveness: 0,
    trustSpeed: 0, affectionStyle: 0, relIndependence: 0, protectiveness: 0, emotionalReactivity: 0,
  };
}

function normalize(raw: number, min: number, max: number): number {
  if (max === min) return 50;
  return Math.round(Math.min(100, Math.max(0, ((raw - min) / (max - min)) * 100)));
}

function scoreAnswers(answers: Answers): TraitScores {
  const totals = emptyScores();
  const counts: Record<string, number> = {};

  for (const [qIdStr, optId] of Object.entries(answers)) {
    const qId = parseInt(qIdStr, 10);
    const question: TestQuestion | undefined = QUESTIONS.find((q) => q.id === qId);
    if (!question) continue;
    const option = question.options.find((o) => o.id === optId);
    if (!option) continue;

    for (const [key, val] of Object.entries(option.scores)) {
      const k = key as keyof TraitScores;
      totals[k] = (totals[k] || 0) + (val as number);
      counts[k] = (counts[k] || 0) + 1;
    }
  }

  return totals;
}

function computeMBTI(scores: TraitScores): string {
  // introversion axis: positive = I, negative = E
  const I = scores.introversion - scores.extraversion;
  const N = scores.intuition;
  const T = scores.thinking;
  const J = scores.judging;

  return (
    (I >= 0 ? 'I' : 'E') +
    (N >= 0 ? 'N' : 'S') +
    (T >= 0 ? 'T' : 'F') +
    (J >= 0 ? 'J' : 'P')
  );
}

const MBTI_META: Record<string, { title: string; description: string; tags: string[]; colorTheme: string }> = {
  INTJ: { title: 'The Strategist', description: 'Independent, analytical, and intensely focused. Rarely reveals inner depth — but their quiet loyalty is absolute.', tags: ['Reserved', 'Analytical', 'Strategic', 'Independent'], colorTheme: 'blue' },
  INTP: { title: 'The Thinker', description: 'A relentless mind that lives in ideas, patterns, and theories. Endearingly absent-minded with a razor-sharp intellect.', tags: ['Intellectual', 'Curious', 'Reserved', 'Logical'], colorTheme: 'blue' },
  ENTJ: { title: 'The Commander', description: 'Natural leader who sees the world as a problem to solve and has the will to actually do it.', tags: ['Assertive', 'Decisive', 'Confident', 'Strategic'], colorTheme: 'red' },
  ENTP: { title: 'The Debater', description: 'Loves sparring with ideas, challenging assumptions, and finding unexpected angles. Genuinely energized by sharp minds.', tags: ['Witty', 'Curious', 'Confident', 'Direct'], colorTheme: 'warm' },
  INFJ: { title: 'The Counselor', description: 'Deeply empathetic and quietly perceptive. Understands people in ways they don\'t understand themselves.', tags: ['Empathetic', 'Perceptive', 'Reserved', 'Thoughtful'], colorTheme: 'purple' },
  INFP: { title: 'The Idealist', description: 'Sees the world through the lens of meaning and emotion. Fiercely loyal to their values and the people they love.', tags: ['Sensitive', 'Creative', 'Gentle', 'Idealistic'], colorTheme: 'purple' },
  ENFJ: { title: 'The Protagonist', description: 'Radiates warmth and draws people in effortlessly. Deeply invested in others\' growth and happiness.', tags: ['Warm', 'Empathetic', 'Inspiring', 'Social'], colorTheme: 'warm' },
  ENFP: { title: 'The Campaigner', description: 'Irrepressibly enthusiastic, endlessly curious, and genuinely thrilled by human connection.', tags: ['Enthusiastic', 'Creative', 'Warm', 'Spontaneous'], colorTheme: 'warm' },
  ISTJ: { title: 'The Inspector', description: 'Steadfast, reliable, and detail-oriented. Their word is their bond.', tags: ['Reliable', 'Practical', 'Organized', 'Loyal'], colorTheme: 'blue' },
  ISFJ: { title: 'The Protector', description: 'Quiet, devoted, and endlessly supportive. Their care shows through consistent action, not grand gestures.', tags: ['Caring', 'Reliable', 'Patient', 'Humble'], colorTheme: 'green' },
  ESTJ: { title: 'The Director', description: 'Direct, organized, and built for getting things done. Respects those who show up and deliver.', tags: ['Organized', 'Direct', 'Confident', 'Reliable'], colorTheme: 'red' },
  ESFJ: { title: 'The Consul', description: 'Social, warm, and genuinely invested in the wellbeing of the people around them.', tags: ['Warm', 'Social', 'Caring', 'Organized'], colorTheme: 'warm' },
  ISTP: { title: 'The Craftsman', description: 'Cool, practical, and quietly capable. They don\'t need praise — results speak for themselves.', tags: ['Practical', 'Independent', 'Calm', 'Resourceful'], colorTheme: 'blue' },
  ISFP: { title: 'The Artist', description: 'Quiet and intensely present. Lives fully in the moment and expresses themselves through what they create.', tags: ['Creative', 'Gentle', 'Sensitive', 'Independent'], colorTheme: 'green' },
  ESTP: { title: 'The Entrepreneur', description: 'Bold, sharp, and always moving. Thives on action, challenge, and the rush of the moment.', tags: ['Bold', 'Assertive', 'Spontaneous', 'Practical'], colorTheme: 'red' },
  ESFP: { title: 'The Entertainer', description: 'Joyful, playful, and magnetic. Turns ordinary moments into something to remember.', tags: ['Fun', 'Warm', 'Spontaneous', 'Social'], colorTheme: 'warm' },
};

function behaviourNotesFromMBTI(mbti: string, traits: PersonalityTraits): string[] {
  const notes: string[] = [];
  if (traits.introversion > 60) notes.push('Takes time before opening up to new people');
  if (traits.introversion < 40) notes.push('Energized by social interaction and conversation');
  if (traits.curiosity > 70) notes.push('Asks thoughtful follow-up questions');
  if (traits.humor > 70 && traits.assertiveness > 55) notes.push('Uses dry humor and sarcasm as a form of warmth');
  else if (traits.humor > 70) notes.push('Lightens the mood with humor naturally');
  if (traits.emotionalExpressiveness < 35) notes.push('Shows care through actions rather than words');
  if (traits.emotionalExpressiveness > 70) notes.push('Expresses feelings openly and directly');
  if (traits.assertiveness > 70) notes.push('Says exactly what they think without much hedging');
  if (traits.patience > 70) notes.push('Thinks carefully before responding');
  if (traits.independence > 75) notes.push('Values personal space and solitude');
  if (['INTJ', 'INTP', 'INFJ', 'ISTP'].includes(mbti)) notes.push('Prefers deep conversation over small talk');
  if (['ENFP', 'ESFP', 'ENFJ', 'ESFJ'].includes(mbti)) notes.push('Remembers personal details and brings them up later');
  if (traits.spontaneity > 70) notes.push('Adapts quickly and enjoys surprising changes of plan');
  if (traits.conscientiousness > 70) notes.push('Highly organized and reliable');
  return notes.slice(0, 6);
}

function scaleToHundred(raw: number, maxExpected: number): number {
  return Math.min(100, Math.max(0, Math.round(50 + (raw / maxExpected) * 50)));
}

export function calculatePersonalityProfile(answers: Answers): {
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
} {
  const raw = scoreAnswers(answers);
  const mbti = computeMBTI(raw);
  const meta = MBTI_META[mbti] || MBTI_META['INFJ'];

  // Scale raw trait scores to 0-100
  // Raw scores range roughly -15 to +15 for each axis — normalize to 0-100
  const S = (v: number) => scaleToHundred(v, 12);

  const traits: PersonalityTraits = {
    introversion: S(raw.introversion - raw.extraversion),
    intuition: S(raw.intuition),
    thinking: S(raw.thinking),
    judging: S(raw.judging),
    openness: S(raw.openness),
    conscientiousness: S(raw.conscientiousness),
    extraversion: S(raw.extraversion - raw.introversion),
    agreeableness: S(raw.agreeableness),
    emotionalStability: S(raw.emotionalStability),
    confidence: S(raw.confidence),
    curiosity: S(raw.curiosity),
    humor: S(raw.humor),
    assertiveness: S(raw.assertiveness),
    patience: S(raw.patience),
    spontaneity: S(raw.spontaneity),
    emotionalExpressiveness: S(raw.emotionalExpressiveness),
    independence: S(raw.independence),
    sociability: S(raw.sociability),
    riskTolerance: S(raw.riskTolerance),
  };

  const communication: CommunicationStyle = {
    directness: S(raw.directness),
    formality: S(raw.formality),
    seriousness: S(raw.seriousness),
    verbosity: S(raw.verbosity),
    sarcasm: S(raw.sarcasm),
    expressiveness: S(raw.comExpressiveness + raw.emotionalExpressiveness),
    primaryStyle: S(raw.directness) > 60 ? 'direct' : 'thoughtful',
    tone: traits.emotionalStability > 60 ? 'calm' : 'expressive',
    humor: S(raw.sarcasm) > 60 ? 'dry wit' : traits.humor > 60 ? 'warm humor' : 'light',
  };

  const relationshipStyle: RelationshipStyle = {
    trustSpeed: S(raw.trustSpeed),
    affectionStyle: S(raw.affectionStyle),
    independence: S(raw.relIndependence + raw.independence),
    protectiveness: S(raw.protectiveness),
    emotionalReactivity: S(raw.emotionalReactivity),
  };

  // Derive legacy enum fields
  const humorLevel: PersonalityJson['humorLevel'] =
    traits.humor > 75 ? 'high' : traits.humor > 55 ? 'moderate' : traits.humor > 35 ? 'subtle' : 'none';

  const emotionalOpenness: PersonalityJson['emotionalOpenness'] =
    traits.emotionalExpressiveness > 80 ? 'very_open'
    : traits.emotionalExpressiveness > 65 ? 'open'
    : traits.emotionalExpressiveness > 45 ? 'moderate'
    : traits.emotionalExpressiveness > 30 ? 'reserved'
    : 'closed';

  const confidenceLevel: PersonalityJson['confidence'] =
    traits.confidence > 75 ? 'very_high'
    : traits.confidence > 55 ? 'high'
    : traits.confidence > 35 ? 'moderate'
    : 'low';

  const behaviourNotes = behaviourNotesFromMBTI(mbti, traits);

  return {
    mbtiType: mbti,
    mbtiTitle: meta.title,
    mbtiDescription: meta.description,
    traits,
    communication,
    relationshipStyle,
    personalityTags: meta.tags,
    behaviourNotes,
    colorTheme: meta.colorTheme,
    humorLevel,
    emotionalOpenness,
    confidence: confidenceLevel,
  };
}

// Build a rich communication style description from scored traits
export function buildCommunicationStyleText(profile: ReturnType<typeof calculatePersonalityProfile>): string {
  const c = profile.communication;
  const parts: string[] = [];
  if (c.directness > 65) parts.push('direct');
  else if (c.directness < 35) parts.push('indirect and diplomatic');
  if (c.sarcasm > 60) parts.push('often sarcastic');
  if (profile.traits.humor > 70) parts.push('naturally humorous');
  if (profile.traits.sociability > 70) parts.push('talkative');
  else if (profile.traits.introversion > 70) parts.push('concise');
  if (profile.traits.emotionalExpressiveness > 70) parts.push('emotionally expressive');
  else if (profile.traits.emotionalExpressiveness < 35) parts.push('emotionally reserved');
  return parts.join(', ');
}
