// Personality test questions
// Each answer maps to trait score adjustments

export interface TestOption {
  id: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
  scores: Partial<TraitScores>;
}

export interface TestQuestion {
  id: number;
  category: 'social' | 'decision' | 'emotional' | 'conflict' | 'preference' | 'relationship' | 'problem' | 'situational';
  question: string;
  options: TestOption[];
}

export interface TraitScores {
  // MBTI axes (positive = first letter, e.g. I, N, T, J)
  introversion: number;
  intuition: number;
  thinking: number;
  judging: number;
  // Big Five
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  emotionalStability: number;
  // Behavioral
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
  // Communication
  directness: number;
  formality: number;
  seriousness: number;
  verbosity: number;
  sarcasm: number;
  comExpressiveness: number;
  // Relationship
  trustSpeed: number;
  affectionStyle: number;
  relIndependence: number;
  protectiveness: number;
  emotionalReactivity: number;
}

export const QUESTIONS: TestQuestion[] = [
  // --- SOCIAL ---
  {
    id: 1,
    category: 'social',
    question: "You arrive at a party where you don't know anyone. What do you most naturally do?",
    options: [
      { id: 'A', text: 'Walk up to someone and introduce yourself immediately.', scores: { extraversion: 3, sociability: 3, introversion: -2 } },
      { id: 'B', text: 'Look for someone who seems equally uncertain and approach them.', scores: { agreeableness: 2, introversion: 1, sociability: 1 } },
      { id: 'C', text: 'Observe the room for a while and decide who seems most interesting.', scores: { introversion: 2, intuition: 2, curiosity: 2 } },
      { id: 'D', text: 'Find something interesting to do on your own until you feel ready.', scores: { introversion: 3, independence: 3, sociability: -2 } },
    ],
  },
  {
    id: 2,
    category: 'social',
    question: "After a long day of socializing, what do you most need?",
    options: [
      { id: 'A', text: 'To plan the next social event — you feel energized.', scores: { extraversion: 4, introversion: -3, sociability: 3 } },
      { id: 'B', text: 'A quiet evening at home to decompress.', scores: { introversion: 4, extraversion: -2 } },
      { id: 'C', text: 'Time with one or two close people rather than a crowd.', scores: { introversion: 2, agreeableness: 2 } },
      { id: 'D', text: 'Complete solitude — people drain you significantly.', scores: { introversion: 5, independence: 3, sociability: -3 } },
    ],
  },
  {
    id: 3,
    category: 'social',
    question: "A friend introduces you to a group of their other friends. How do you behave?",
    options: [
      { id: 'A', text: 'Jump right in — you immediately become part of the group conversation.', scores: { extraversion: 3, sociability: 3, confidence: 2 } },
      { id: 'B', text: 'Listen first, then carefully contribute when the moment feels right.', scores: { introversion: 2, judging: 1, patience: 2 } },
      { id: 'C', text: 'Stay mostly close to the friend you know and observe the new people.', scores: { introversion: 3, trustSpeed: -2 } },
      { id: 'D', text: 'Feel a bit awkward and mostly wait for people to approach you.', scores: { introversion: 3, confidence: -2, sociability: -2 } },
    ],
  },
  // --- DECISION MAKING ---
  {
    id: 4,
    category: 'decision',
    question: "You need to make an important life decision. How do you approach it?",
    options: [
      { id: 'A', text: 'Research extensively, make a pros/cons list, and decide logically.', scores: { thinking: 3, judging: 2, conscientiousness: 3, intuition: -1 } },
      { id: 'B', text: 'Think about how each option feels and which aligns with your values.', scores: { thinking: -2, agreeableness: 2, openness: 1 } },
      { id: 'C', text: 'Trust your gut — you have good instincts about these things.', scores: { intuition: 4, spontaneity: 2, riskTolerance: 2 } },
      { id: 'D', text: 'Talk it through with people you trust before deciding.', scores: { agreeableness: 3, trustSpeed: 2, independence: -1 } },
    ],
  },
  {
    id: 5,
    category: 'decision',
    question: "Plans you were excited about just fell through at the last minute. Your reaction?",
    options: [
      { id: 'A', text: 'Frustrated for a moment, then quickly pivot to a new plan.', scores: { spontaneity: 3, judging: -1, emotionalStability: 2 } },
      { id: 'B', text: 'Genuinely disappointed — you had everything organized.', scores: { judging: 3, conscientiousness: 2, emotionalStability: -1 } },
      { id: 'C', text: 'Fine with it — you prefer flexibility anyway.', scores: { judging: -3, spontaneity: 4, riskTolerance: 2 } },
      { id: 'D', text: 'Annoyed but try not to show it too much.', scores: { emotionalStability: 1, seriousness: 2, judging: 1 } },
    ],
  },
  {
    id: 6,
    category: 'decision',
    question: "When choosing between two good options, what matters most to you?",
    options: [
      { id: 'A', text: 'Which option makes more logical sense based on the facts.', scores: { thinking: 4, judging: 1 } },
      { id: 'B', text: 'Which option feels right for the people involved.', scores: { thinking: -3, agreeableness: 3, emotionalExpressiveness: 2 } },
      { id: 'C', text: 'Which option leads to something new or exciting.', scores: { openness: 3, intuition: 2, riskTolerance: 2 } },
      { id: 'D', text: 'Which option is safer and more predictable.', scores: { judging: 3, conscientiousness: 2, riskTolerance: -2 } },
    ],
  },
  // --- EMOTIONAL ---
  {
    id: 7,
    category: 'emotional',
    question: "Someone you care about is visibly upset. What do you do?",
    options: [
      { id: 'A', text: 'Immediately offer emotional support and ask what they need.', scores: { agreeableness: 4, emotionalExpressiveness: 3, thinking: -2 } },
      { id: 'B', text: 'Try to understand the problem and suggest a practical solution.', scores: { thinking: 3, agreeableness: 1 } },
      { id: 'C', text: 'Stay close and let them come to you when ready — you don\'t want to intrude.', scores: { introversion: 2, patience: 3, independence: 2 } },
      { id: 'D', text: 'Ask what\'s wrong directly and address it head-on.', scores: { assertiveness: 3, directness: 3, thinking: 1 } },
    ],
  },
  {
    id: 8,
    category: 'emotional',
    question: "When you\'re dealing with strong personal emotions, you tend to:",
    options: [
      { id: 'A', text: 'Talk to someone close — sharing helps you process things.', scores: { emotionalExpressiveness: 4, introversion: -2, agreeableness: 2 } },
      { id: 'B', text: 'Write it down, journal, or process it through creative outlets.', scores: { introversion: 2, openness: 3, emotionalExpressiveness: 2 } },
      { id: 'C', text: 'Think through it rationally and try to find a solution.', scores: { thinking: 3, emotionalExpressiveness: -2 } },
      { id: 'D', text: 'Keep it mostly to yourself — emotions are private.', scores: { introversion: 3, emotionalExpressiveness: -3, independence: 3 } },
    ],
  },
  {
    id: 9,
    category: 'emotional',
    question: "How easily do your emotions affect your outward behavior?",
    options: [
      { id: 'A', text: 'Very easily — people can always tell how you\'re feeling.', scores: { emotionalExpressiveness: 5, emotionalStability: -2, emotionalReactivity: 4 } },
      { id: 'B', text: 'Somewhat — you show emotions but maintain composure.', scores: { emotionalExpressiveness: 2, emotionalStability: 2 } },
      { id: 'C', text: 'Rarely — you keep a calm exterior regardless of what\'s inside.', scores: { emotionalExpressiveness: -3, emotionalStability: 4, seriousness: 2 } },
      { id: 'D', text: 'Depends on the situation and who you\'re with.', scores: { emotionalStability: 1, agreeableness: 1 } },
    ],
  },
  // --- CONFLICT ---
  {
    id: 10,
    category: 'conflict',
    question: "Someone publicly criticizes your work in front of others. Your response?",
    options: [
      { id: 'A', text: 'Defend your work calmly and directly with supporting reasoning.', scores: { assertiveness: 3, confidence: 3, directness: 3 } },
      { id: 'B', text: 'Acknowledge their point publicly but address it privately later.', scores: { patience: 2, judging: 1, agreeableness: 2 } },
      { id: 'C', text: 'Feel stung but say little — you process it internally.', scores: { introversion: 2, emotionalStability: -2, confidence: -2 } },
      { id: 'D', text: 'Respond sharply — you don\'t appreciate public callouts.', scores: { assertiveness: 4, sarcasm: 2, emotionalReactivity: 3 } },
    ],
  },
  {
    id: 11,
    category: 'conflict',
    question: "A close friend says something that genuinely hurts you. What do you do?",
    options: [
      { id: 'A', text: 'Tell them right away — you believe in honest communication.', scores: { directness: 4, assertiveness: 3, emotionalExpressiveness: 2 } },
      { id: 'B', text: 'Wait until you\'ve calmed down, then bring it up gently.', scores: { patience: 3, agreeableness: 2, judging: 1 } },
      { id: 'C', text: 'Quietly withdraw and wait to see if they notice.', scores: { introversion: 2, confidence: -2, emotionalReactivity: 2 } },
      { id: 'D', text: 'Internally note it but say nothing — you pick your battles.', scores: { independence: 2, emotionalStability: 2, patience: 2 } },
    ],
  },
  {
    id: 12,
    category: 'conflict',
    question: "Two friends are arguing and ask for your opinion. You:",
    options: [
      { id: 'A', text: 'Give your honest opinion even if it sides with one person.', scores: { directness: 4, confidence: 3, assertiveness: 2 } },
      { id: 'B', text: 'Find a middle ground that acknowledges both perspectives.', scores: { agreeableness: 4, thinking: 1, judging: 1 } },
      { id: 'C', text: 'Decline — it\'s not your place to get involved.', scores: { independence: 3, introversion: 2 } },
      { id: 'D', text: 'Ask clarifying questions to understand the situation better.', scores: { intuition: 2, curiosity: 3, patience: 2 } },
    ],
  },
  // --- PREFERENCE ---
  {
    id: 13,
    category: 'preference',
    question: "Your ideal weekend looks like:",
    options: [
      { id: 'A', text: 'Going out with a large group — the more people the better.', scores: { extraversion: 4, sociability: 4, introversion: -3 } },
      { id: 'B', text: 'A small gathering with close friends.', scores: { introversion: 1, agreeableness: 2 } },
      { id: 'C', text: 'A quiet day doing something you love, mostly alone.', scores: { introversion: 4, independence: 3, sociability: -2 } },
      { id: 'D', text: 'An adventure or spontaneous road trip.', scores: { spontaneity: 4, riskTolerance: 3, openness: 3 } },
    ],
  },
  {
    id: 14,
    category: 'preference',
    question: "When you read, watch films, or consume media, you tend to prefer:",
    options: [
      { id: 'A', text: 'Things that challenge your thinking and introduce new ideas.', scores: { openness: 4, intuition: 3, curiosity: 3 } },
      { id: 'B', text: 'Stories with rich characters and emotional depth.', scores: { openness: 2, agreeableness: 2, emotionalExpressiveness: 2 } },
      { id: 'C', text: 'Practical content — how-to guides, true stories, real information.', scores: { intuition: -2, conscientiousness: 2 } },
      { id: 'D', text: 'Entertaining, lighthearted content to unwind.', scores: { humor: 2, spontaneity: 2 } },
    ],
  },
  {
    id: 15,
    category: 'preference',
    question: "You have a free day with no obligations. You most likely:",
    options: [
      { id: 'A', text: 'Have a plan — you don\'t love unstructured time.', scores: { judging: 4, conscientiousness: 3 } },
      { id: 'B', text: 'Drift between things spontaneously as your mood dictates.', scores: { judging: -3, spontaneity: 4, openness: 2 } },
      { id: 'C', text: 'Spend time on a personal project or creative pursuit.', scores: { openness: 3, introversion: 2, curiosity: 2 } },
      { id: 'D', text: 'Reach out to people and make something happen.', scores: { extraversion: 3, sociability: 3 } },
    ],
  },
  // --- RELATIONSHIP ---
  {
    id: 16,
    category: 'relationship',
    question: "How quickly do you typically trust new people?",
    options: [
      { id: 'A', text: 'Slowly — trust is earned through consistent behavior over time.', scores: { trustSpeed: -4, introversion: 2, independence: 2 } },
      { id: 'B', text: 'Moderately — you give initial trust and adjust based on experience.', scores: { trustSpeed: 1, agreeableness: 2 } },
      { id: 'C', text: 'Fairly quickly — you lead with openness and adjust if betrayed.', scores: { trustSpeed: 3, extraversion: 2, agreeableness: 2 } },
      { id: 'D', text: 'You\'re still uncertain — it depends entirely on the person.', scores: { intuition: 2 } },
    ],
  },
  {
    id: 17,
    category: 'relationship',
    question: "In a close relationship, how do you tend to show affection?",
    options: [
      { id: 'A', text: 'Openly — you tell people how you feel and show it physically.', scores: { affectionStyle: 4, emotionalExpressiveness: 3, extraversion: 2 } },
      { id: 'B', text: 'Through actions — doing things for them without necessarily saying it.', scores: { affectionStyle: -2, introversion: 2, conscientiousness: 2 } },
      { id: 'C', text: 'Subtly — small gestures, inside jokes, remembering things they said.', scores: { affectionStyle: -1, introversion: 2, curiosity: 2 } },
      { id: 'D', text: 'Thoughtfully and selectively — you don\'t give affection freely.', scores: { affectionStyle: -3, introversion: 3, trustSpeed: -2 } },
    ],
  },
  {
    id: 18,
    category: 'relationship',
    question: "When someone you care about is going through something hard, you:",
    options: [
      { id: 'A', text: 'Drop everything to be there for them.', scores: { agreeableness: 4, protectiveness: 4, independence: -1 } },
      { id: 'B', text: 'Check in regularly without overwhelming them.', scores: { patience: 3, agreeableness: 2 } },
      { id: 'C', text: 'Offer help if asked — you don\'t want to impose.', scores: { introversion: 2, independence: 2 } },
      { id: 'D', text: 'Try to solve the problem for them.', scores: { thinking: 2, protectiveness: 2, assertiveness: 2 } },
    ],
  },
  {
    id: 19,
    category: 'relationship',
    question: "What does loyalty mean to you?",
    options: [
      { id: 'A', text: 'Being there no matter what — unconditionally.', scores: { agreeableness: 4, protectiveness: 3, affectionStyle: 2 } },
      { id: 'B', text: 'Being honest even when it\'s uncomfortable.', scores: { directness: 4, thinking: 2, confidence: 2 } },
      { id: 'C', text: 'Respecting boundaries and not overstepping.', scores: { independence: 3, patience: 2 } },
      { id: 'D', text: 'Showing up consistently over a long time.', scores: { conscientiousness: 3, judging: 2, trustSpeed: -1 } },
    ],
  },
  // --- PROBLEM SOLVING ---
  {
    id: 20,
    category: 'problem',
    question: "You encounter a complex problem. How do you approach it?",
    options: [
      { id: 'A', text: 'Break it into parts and tackle them methodically.', scores: { thinking: 3, judging: 3, conscientiousness: 3 } },
      { id: 'B', text: 'Look for the underlying pattern or root cause first.', scores: { intuition: 4, thinking: 2, curiosity: 3 } },
      { id: 'C', text: 'Brainstorm many different approaches before committing.', scores: { openness: 3, intuition: 2, judging: -2 } },
      { id: 'D', text: 'Try something and adjust based on what happens.', scores: { spontaneity: 3, riskTolerance: 3, judging: -2 } },
    ],
  },
  {
    id: 21,
    category: 'problem',
    question: "You realize you made a mistake that affected other people. You:",
    options: [
      { id: 'A', text: 'Admit it immediately and apologize without making excuses.', scores: { directness: 3, agreeableness: 3, confidence: 2 } },
      { id: 'B', text: 'Acknowledge it but also explain why it happened.', scores: { directness: 1, thinking: 2 } },
      { id: 'C', text: 'Feel deeply upset about it before being able to address it.', scores: { emotionalReactivity: 3, agreeableness: 2, emotionalStability: -2 } },
      { id: 'D', text: 'Focus on fixing the problem first, then address the people side.', scores: { thinking: 3, judging: 2, agreeableness: -1 } },
    ],
  },
  // --- SITUATIONAL ---
  {
    id: 22,
    category: 'situational',
    question: "You're asked to give a speech in front of a hundred people. You feel:",
    options: [
      { id: 'A', text: 'Energized — this is your kind of challenge.', scores: { extraversion: 4, confidence: 4, introversion: -3 } },
      { id: 'B', text: 'Nervous, but you prepare thoroughly and pull it off.', scores: { conscientiousness: 3, judging: 2, introversion: 1 } },
      { id: 'C', text: 'Quite uncomfortable — public speaking is not your strength.', scores: { introversion: 4, confidence: -2 } },
      { id: 'D', text: 'Fine — you\'ve learned to manage it even if you don\'t love it.', scores: { emotionalStability: 3, patience: 2 } },
    ],
  },
  {
    id: 23,
    category: 'situational',
    question: "You\'re working on a group project where everyone keeps changing the plan. You:",
    options: [
      { id: 'A', text: 'Push to establish a clear structure and stick to it.', scores: { judging: 4, assertiveness: 3, conscientiousness: 3 } },
      { id: 'B', text: 'Adapt and go with the flow — flexibility is good.', scores: { judging: -3, spontaneity: 3, agreeableness: 2 } },
      { id: 'C', text: 'Feel frustrated internally but don\'t say anything.', scores: { judging: 2, introversion: 2, assertiveness: -2 } },
      { id: 'D', text: 'Quietly take charge and organize things without making a big deal of it.', scores: { judging: 3, confidence: 3, introversion: 1 } },
    ],
  },
  {
    id: 24,
    category: 'situational',
    question: "Someone asks for your opinion on something you find genuinely bad. You:",
    options: [
      { id: 'A', text: 'Tell them honestly — sugarcoating would be dishonest.', scores: { directness: 5, assertiveness: 3, agreeableness: -1 } },
      { id: 'B', text: 'Find something positive to say before being honest.', scores: { agreeableness: 3, directness: 1 } },
      { id: 'C', text: 'Deflect or redirect — honest feedback isn\'t always helpful.', scores: { agreeableness: 2, directness: -3 } },
      { id: 'D', text: 'Give a measured, balanced critique.', scores: { thinking: 3, directness: 2, patience: 2 } },
    ],
  },
  {
    id: 25,
    category: 'situational',
    question: "When starting something completely new, you:",
    options: [
      { id: 'A', text: 'Research everything before you begin.', scores: { conscientiousness: 4, judging: 3, intuition: 1 } },
      { id: 'B', text: 'Jump in and learn as you go.', scores: { spontaneity: 4, riskTolerance: 4, judging: -2 } },
      { id: 'C', text: 'Find someone who already knows and ask them.', scores: { agreeableness: 3, sociability: 2, independence: -1 } },
      { id: 'D', text: 'Think about the big picture before planning the details.', scores: { intuition: 3, openness: 2 } },
    ],
  },
  {
    id: 26,
    category: 'social',
    question: "Your idea of a perfect conversation is:",
    options: [
      { id: 'A', text: 'Light, funny, effortlessly flowing small talk.', scores: { extraversion: 3, humor: 3, seriousness: -3 } },
      { id: 'B', text: 'A deep dive into ideas, philosophy, or something that really matters.', scores: { introversion: 2, openness: 4, curiosity: 4, seriousness: 2 } },
      { id: 'C', text: 'Playful banter and mutual teasing.', scores: { humor: 4, sarcasm: 3, extraversion: 2 } },
      { id: 'D', text: 'Sharing personal stories and connecting emotionally.', scores: { emotionalExpressiveness: 4, agreeableness: 3, introversion: 1 } },
    ],
  },
  {
    id: 27,
    category: 'emotional',
    question: "Someone gives you a very unexpected gift or compliment. You:",
    options: [
      { id: 'A', text: 'Are visibly delighted and express it openly.', scores: { emotionalExpressiveness: 4, extraversion: 2 } },
      { id: 'B', text: 'Are genuinely touched but feel a bit awkward showing it.', scores: { introversion: 2, emotionalExpressiveness: -1 } },
      { id: 'C', text: 'Deflect with humor — compliments make you uncomfortable.', scores: { humor: 3, sarcasm: 2, emotionalExpressiveness: -2, confidence: -1 } },
      { id: 'D', text: 'Accept it graciously but don\'t make a big deal of it.', scores: { emotionalStability: 2, confidence: 2 } },
    ],
  },
  {
    id: 28,
    category: 'preference',
    question: "Your workspace is most likely:",
    options: [
      { id: 'A', text: 'Spotlessly organized — you can\'t function in mess.', scores: { judging: 4, conscientiousness: 4 } },
      { id: 'B', text: 'Organized chaos — you know where everything is, even if it looks messy.', scores: { judging: -1, openness: 2, independence: 2 } },
      { id: 'C', text: 'Comfortable and personalized — reflects your personality.', scores: { openness: 3, emotionalExpressiveness: 2 } },
      { id: 'D', text: 'Bare minimum — you just need what\'s functional.', scores: { judging: 2, seriousness: 2, introversion: 1 } },
    ],
  },
  {
    id: 29,
    category: 'relationship',
    question: "How important is having space and alone time within a close relationship?",
    options: [
      { id: 'A', text: 'Essential — you need your own space regardless of how close you are.', scores: { independence: 5, relIndependence: 5, introversion: 3 } },
      { id: 'B', text: 'Important, but you don\'t need as much as some people.', scores: { relIndependence: 2, independence: 2 } },
      { id: 'C', text: 'You prefer to be together as much as possible.', scores: { relIndependence: -3, affectionStyle: 3, extraversion: 2 } },
      { id: 'D', text: 'It varies — depends on your mood and the relationship.', scores: { spontaneity: 1, openness: 1 } },
    ],
  },
  {
    id: 30,
    category: 'problem',
    question: "You have an important task due tomorrow that you haven\'t started. You:",
    options: [
      { id: 'A', text: 'Panic a little, but buckle down and grind through it.', scores: { conscientiousness: 3, judging: -1, emotionalReactivity: 2 } },
      { id: 'B', text: 'Feel weirdly calm — pressure actually helps you focus.', scores: { emotionalStability: 3, riskTolerance: 3, spontaneity: 2 } },
      { id: 'C', text: 'This wouldn\'t happen — you never leave things this late.', scores: { judging: 5, conscientiousness: 5 } },
      { id: 'D', text: 'Start, hit a flow state, and actually do your best work under pressure.', scores: { spontaneity: 2, confidence: 3, riskTolerance: 2 } },
    ],
  },
  {
    id: 31,
    category: 'situational',
    question: "A new opportunity appears that requires you to take a significant risk. You:",
    options: [
      { id: 'A', text: 'Go for it — regret from not trying is worse.', scores: { riskTolerance: 5, spontaneity: 3, judging: -1 } },
      { id: 'B', text: 'Assess it carefully and take it if the odds look good.', scores: { thinking: 3, judging: 2, riskTolerance: 1 } },
      { id: 'C', text: 'Need more information before even considering it.', scores: { judging: 3, conscientiousness: 3, riskTolerance: -2 } },
      { id: 'D', text: 'Avoid it — stability matters more to you than potential upside.', scores: { riskTolerance: -4, judging: 3, conscientiousness: 3 } },
    ],
  },
  {
    id: 32,
    category: 'social',
    question: "You meet someone who is immediately very warm and intense. Your gut reaction?",
    options: [
      { id: 'A', text: 'Refreshing — you match their energy and enjoy it.', scores: { extraversion: 3, trustSpeed: 3, sociability: 3 } },
      { id: 'B', text: 'Charming, but you hold back a little internally.', scores: { introversion: 2, trustSpeed: -1 } },
      { id: 'C', text: 'Slightly suspicious — intensity this soon makes you cautious.', scores: { introversion: 3, trustSpeed: -3, thinking: 2 } },
      { id: 'D', text: 'Enjoy it in the moment but don\'t read too much into it.', scores: { emotionalStability: 2, spontaneity: 2 } },
    ],
  },
  {
    id: 33,
    category: 'emotional',
    question: "How do you handle personal failure?",
    options: [
      { id: 'A', text: 'Analyze what went wrong and adjust — you don\'t dwell.', scores: { thinking: 3, emotionalStability: 4, judging: 2 } },
      { id: 'B', text: 'Feel it deeply, take time to process, then move on.', scores: { emotionalExpressiveness: 3, emotionalReactivity: 3, agreeableness: 1 } },
      { id: 'C', text: 'Push forward immediately — processing can wait.', scores: { emotionalExpressiveness: -2, conscientiousness: 3, riskTolerance: 2 } },
      { id: 'D', text: 'Be hard on yourself but eventually find perspective.', scores: { conscientiousness: 2, emotionalReactivity: 2, agreeableness: 1 } },
    ],
  },
  {
    id: 34,
    category: 'preference',
    question: "What type of humor feels most natural to you?",
    options: [
      { id: 'A', text: 'Dry, deadpan — the less obvious, the funnier.', scores: { humor: 3, sarcasm: 4, seriousness: 2, introversion: 1 } },
      { id: 'B', text: 'Warm, inclusive humor that brings people together.', scores: { humor: 3, agreeableness: 3, extraversion: 2 } },
      { id: 'C', text: 'Absurdist or random — unexpected non-sequiturs.', scores: { humor: 4, openness: 3, spontaneity: 2 } },
      { id: 'D', text: 'Playful teasing and banter with people you like.', scores: { humor: 3, sarcasm: 3, assertiveness: 2 } },
    ],
  },
  {
    id: 35,
    category: 'situational',
    question: "How do you typically communicate your needs to other people?",
    options: [
      { id: 'A', text: 'Directly and clearly — you say what you need without hedging.', scores: { directness: 5, assertiveness: 4, confidence: 3 } },
      { id: 'B', text: 'Hint at it and hope they pick up on it.', scores: { directness: -3, introversion: 2 } },
      { id: 'C', text: 'Only when the need becomes urgent — otherwise you manage alone.', scores: { independence: 4, introversion: 2, directness: 1 } },
      { id: 'D', text: 'Thoughtfully, after thinking about how to phrase it.', scores: { directness: 2, patience: 3, judging: 1 } },
    ],
  },
  {
    id: 36,
    category: 'relationship',
    question: "What is the most important quality in a close friend?",
    options: [
      { id: 'A', text: 'Absolute honesty, even when it\'s hard to hear.', scores: { directness: 3, thinking: 2, trustSpeed: -1 } },
      { id: 'B', text: 'Unconditional emotional support and empathy.', scores: { agreeableness: 4, emotionalExpressiveness: 2 } },
      { id: 'C', text: 'Reliability and consistency over a long time.', scores: { trustSpeed: -2, judging: 3, conscientiousness: 2 } },
      { id: 'D', text: 'Intellectual stimulation and genuine curiosity.', scores: { openness: 3, curiosity: 4, intuition: 2 } },
    ],
  },
  {
    id: 37,
    category: 'problem',
    question: "When you disagree with a group decision, you:",
    options: [
      { id: 'A', text: 'Voice your disagreement clearly and explain why.', scores: { assertiveness: 4, directness: 4, confidence: 3 } },
      { id: 'B', text: 'Raise a concern gently, but ultimately defer to the group.', scores: { agreeableness: 3, assertiveness: -1 } },
      { id: 'C', text: 'Stay quiet publicly but find a way to act on your own assessment.', scores: { independence: 4, introversion: 2, thinking: 2 } },
      { id: 'D', text: 'Accept it — you trust the collective more than your own judgment.', scores: { agreeableness: 3, confidence: -2 } },
    ],
  },
  {
    id: 38,
    category: 'situational',
    question: "When you\'re bored in a conversation, you:",
    options: [
      { id: 'A', text: 'Find a way to steer it somewhere more interesting.', scores: { assertiveness: 3, curiosity: 3, extraversion: 2 } },
      { id: 'B', text: 'Zone out internally while appearing present.', scores: { introversion: 3, seriousness: 1 } },
      { id: 'C', text: 'Politely wrap it up and exit.', scores: { directness: 2, independence: 2, judging: 2 } },
      { id: 'D', text: 'Push through — politeness matters more than your boredom.', scores: { agreeableness: 3, patience: 3 } },
    ],
  },
  {
    id: 39,
    category: 'emotional',
    question: "How important is it to you that other people understand your feelings?",
    options: [
      { id: 'A', text: 'Very — being understood is a core need for you.', scores: { emotionalExpressiveness: 4, agreeableness: 3, sociability: 2 } },
      { id: 'B', text: 'Somewhat — you value it but don\'t depend on it.', scores: { emotionalExpressiveness: 2, independence: 2 } },
      { id: 'C', text: 'Rarely — you don\'t need people to understand you to feel okay.', scores: { independence: 4, introversion: 3, emotionalExpressiveness: -2 } },
      { id: 'D', text: 'Only with people you are very close to.', scores: { trustSpeed: -2, introversion: 2, emotionalExpressiveness: 1 } },
    ],
  },
  {
    id: 40,
    category: 'preference',
    question: "Looking back at your life, you tend to be most proud of:",
    options: [
      { id: 'A', text: 'The relationships and connections you\'ve built.', scores: { agreeableness: 4, emotionalExpressiveness: 3, sociability: 3 } },
      { id: 'B', text: 'Things you\'ve achieved through hard work and discipline.', scores: { conscientiousness: 4, judging: 3, confidence: 2 } },
      { id: 'C', text: 'The times you were brave enough to take the unconventional path.', scores: { openness: 4, riskTolerance: 3, independence: 3 } },
      { id: 'D', text: 'Moments when you helped someone in a meaningful way.', scores: { agreeableness: 4, protectiveness: 3, emotionalExpressiveness: 2 } },
    ],
  },
];
