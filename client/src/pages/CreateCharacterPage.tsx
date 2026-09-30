import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, X, ChevronLeft, ChevronRight, Sparkles, Brain } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import { PersonalityTestResult, PersonalityJson, PersonalityTraits, CommunicationStyle, RelationshipStyle } from '../types';
import { cn } from '../utils';
import { PersonalityTest } from '../components/PersonalityTest/PersonalityTest';
import { PersonalityResult } from '../components/PersonalityTest/PersonalityResult';
import { PersonalityCustomize } from '../components/PersonalityTest/PersonalityCustomize';

// ── Wizard steps ─────────────────────────────────────────────────────────────
type WizardStep =
  | 'basic'           // Step 1: Name, avatar, bio
  | 'test-prompt'     // Step 2: Personality test intro
  | 'test-taking'     // Step 3: Taking the test
  | 'test-result'     // Step 4: View test result
  | 'test-customize'  // Step 5: Customize sliders
  | 'details'         // Step 6: Interests, backstory, quirks
  | 'preview'         // Step 7: Preview & finish
  | 'review';         // Step 8: Publish & create

const STEP_LABELS: Record<WizardStep, string> = {
  'basic': 'Basic Info',
  'test-prompt': 'Personality',
  'test-taking': 'Taking Test',
  'test-result': 'Results',
  'test-customize': 'Fine-tune',
  'details': 'Details',
  'preview': 'Preview',
  'review': 'Review',
};

const VISIBLE_STEPS: WizardStep[] = ['basic', 'test-prompt', 'details', 'review'];

// ── Tag input helper ──────────────────────────────────────────────────────────
function TagInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState('');

  function add() {
    const v = input.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setInput('');
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button type="button" onClick={add} className="px-3 py-2 rounded-lg bg-muted hover:bg-muted/80">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {value.map((item) => (
          <span key={item} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-muted">
            {item}
            <button type="button" onClick={() => onChange(value.filter((v) => v !== item))} className="hover:text-destructive">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Form state ────────────────────────────────────────────────────────────────
interface BasicInfo {
  name: string;
  avatarUrl: string;
  tagline: string;
  description: string;
}

interface DetailInfo {
  interests: string[];
  likes: string[];
  dislikes: string[];
  values: string[];
  quirks: string[];
  backstory: string;
  speechPatterns: string;
  responseGuidelines: string;
  colorTheme: string;
  isPublic: boolean;
}

// ── Main component ────────────────────────────────────────────────────────────
export function CreateCharacterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<WizardStep>('basic');
  const [loading, setLoading] = useState(false);

  const [basic, setBasic] = useState<BasicInfo>({
    name: '', avatarUrl: '', tagline: '', description: '',
  });

  const [personalityResult, setPersonalityResult] = useState<PersonalityTestResult | null>(null);

  const [details, setDetails] = useState<DetailInfo>({
    interests: [], likes: [], dislikes: [], values: [], quirks: [],
    backstory: '', speechPatterns: '', responseGuidelines: '',
    colorTheme: 'blue', isPublic: false,
  });

  const fieldClass = 'w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring';
  const labelClass = 'block text-sm font-medium mb-1.5';

  // ── Step progress indicator ─────────────────────────────────────────────────
  function StepIndicator() {
    const currentIndex = VISIBLE_STEPS.indexOf(step);
    const effectiveIndex = ['test-taking', 'test-result', 'test-customize'].includes(step) ? 1 : currentIndex;
    return (
      <div className="flex items-center gap-2 mb-8">
        {VISIBLE_STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors',
              i < effectiveIndex ? 'bg-primary border-primary text-primary-foreground' :
              i === effectiveIndex ? 'border-primary text-primary' :
              'border-border text-muted-foreground'
            )}>
              {i < effectiveIndex ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={cn('text-xs hidden sm:block', i === effectiveIndex ? 'text-foreground font-medium' : 'text-muted-foreground')}>
              {STEP_LABELS[s]}
            </span>
            {i < VISIBLE_STEPS.length - 1 && <div className={cn('w-8 h-0.5 mx-1', i < effectiveIndex ? 'bg-primary' : 'bg-border')} />}
          </div>
        ))}
      </div>
    );
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    setLoading(true);
    try {
      const p: PersonalityTestResult = personalityResult ?? {
        mbtiType: 'INFJ', mbtiTitle: 'The Counselor', mbtiDescription: '',
        traits: { introversion: 60, intuition: 65, thinking: 40, judging: 60,
          openness: 65, conscientiousness: 60, extraversion: 40, agreeableness: 65,
          emotionalStability: 55, confidence: 55, curiosity: 65, humor: 50,
          assertiveness: 50, patience: 60, spontaneity: 45, emotionalExpressiveness: 55,
          independence: 55, sociability: 45, riskTolerance: 45 } as PersonalityTraits,
        communication: { directness: 50, formality: 40, seriousness: 50, verbosity: 50,
          sarcasm: 30, expressiveness: 55, primaryStyle: 'thoughtful', tone: 'calm', humor: 'light' } as CommunicationStyle,
        relationshipStyle: { trustSpeed: 40, affectionStyle: 50, independence: 55,
          protectiveness: 55, emotionalReactivity: 45 } as RelationshipStyle,
        personalityTags: [], behaviourNotes: [], colorTheme: 'blue',
        humorLevel: 'moderate', emotionalOpenness: 'moderate', confidence: 'moderate',
        interests: details.interests, likes: details.likes, dislikes: details.dislikes,
        values: details.values, quirks: details.quirks,
        backstory: details.backstory, speechPatterns: details.speechPatterns,
        responseGuidelines: details.responseGuidelines, communicationStyle: 'Warm and thoughtful.',
        type: 'INFJ',
      };
      const theme = details.colorTheme || p.colorTheme || 'blue';

      const personalityJson: PersonalityJson = {
        // Legacy fields
        type: p.mbtiType,
        communicationStyle: p.communicationStyle,
        humorLevel: p.humorLevel,
        emotionalOpenness: p.emotionalOpenness,
        confidence: p.confidence,
        colorTheme: theme,
        interests: details.interests,
        likes: details.likes,
        dislikes: details.dislikes,
        values: details.values,
        quirks: details.quirks,
        backstory: details.backstory,
        speechPatterns: details.speechPatterns,
        responseGuidelines: details.responseGuidelines,
        // Rich fields from test
        mbtiType: p.mbtiType,
        mbtiTitle: p.mbtiTitle,
        mbtiDescription: p.mbtiDescription,
        traits: p.traits,
        communication: p.communication,
        relationshipStyle: p.relationshipStyle,
        personalityTags: p.personalityTags,
        behaviourNotes: p.behaviourNotes,
      };

      const avatarUrl = basic.avatarUrl ||
        `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(basic.name)}&radius=50`;

      const { data } = await api.post('/characters', {
        name: basic.name,
        avatarUrl,
        tagline: basic.tagline,
        description: basic.description,
        personalityJson,
        isPublic: details.isPublic,
      });

      toast.success(`${basic.name} created!`);
      navigate(`/characters/${data.character.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to create character';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  // ── Avatar URL for preview ──────────────────────────────────────────────────
  const avatarSrc = basic.avatarUrl ||
    `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(basic.name || 'Character')}&radius=50`;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Create a Character</h1>
      <p className="text-muted-foreground text-sm mb-8">
        Design an AI companion with a personality that's uniquely theirs.
      </p>

      <StepIndicator />

      <AnimatePresence mode="wait">

        {/* ── STEP 1: Basic Info ─────────────────────────────────────────────── */}
        {step === 'basic' && (
          <motion.div key="basic" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
              <h2 className="font-semibold">Basic Information</h2>
              <div>
                <label className={labelClass} htmlFor="name">Character Name *</label>
                <input id="name" type="text" value={basic.name}
                  onChange={(e) => setBasic((p) => ({ ...p, name: e.target.value }))}
                  className={fieldClass} placeholder="e.g. Alex, Mika, Jordan" maxLength={50} />
              </div>
              <div>
                <label className={labelClass} htmlFor="tagline">Tagline *</label>
                <input id="tagline" type="text" value={basic.tagline}
                  onChange={(e) => setBasic((p) => ({ ...p, tagline: e.target.value }))}
                  className={fieldClass} placeholder='"Quiet. Intelligent. Hard to read."' maxLength={120} />
              </div>
              <div>
                <label className={labelClass} htmlFor="description">Description *</label>
                <textarea id="description" value={basic.description}
                  onChange={(e) => setBasic((p) => ({ ...p, description: e.target.value }))}
                  className={`${fieldClass} min-h-[100px] resize-none`}
                  placeholder="A short overview of who this character is..." maxLength={1000} />
              </div>
              <div>
                <label className={labelClass} htmlFor="avatarUrl">Avatar URL</label>
                <input id="avatarUrl" type="url" value={basic.avatarUrl}
                  onChange={(e) => setBasic((p) => ({ ...p, avatarUrl: e.target.value }))}
                  className={fieldClass} placeholder="https://... (leave blank to auto-generate)" />
                {basic.avatarUrl && (
                  <img src={basic.avatarUrl} alt="Preview"
                    className="w-14 h-14 rounded-full object-cover border border-border mt-2"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  if (!basic.name.trim()) { toast.error('Please enter a character name'); return; }
                  if (!basic.tagline.trim()) { toast.error('Please enter a tagline'); return; }
                  if (!basic.description.trim()) { toast.error('Please enter a description'); return; }
                  setStep('test-prompt');
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: Personality Test Prompt ──────────────────────────────── */}
        {step === 'test-prompt' && (
          <motion.div key="test-prompt" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Discover Your Character's Personality</h2>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                  Take a 40-question personality assessment for{' '}
                  <span className="font-semibold text-foreground">{basic.name}</span>.
                  Answer how <em>they</em> would naturally respond — not you.
                  The results will automatically become the foundation of their personality and behavior.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left max-w-sm mx-auto">
                {[
                  { icon: '🧠', label: 'MBTI-style personality type' },
                  { icon: '📊', label: 'Big Five dimensions' },
                  { icon: '💬', label: 'Communication style' },
                  { icon: '💛', label: 'Relationship style' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              {personalityResult && (
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-300">
                  ✓ Test completed — <strong>{personalityResult.mbtiType}</strong> ({personalityResult.mbtiTitle})
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setStep('basic')}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => setStep('test-taking')}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90"
                >
                  <Sparkles className="w-4 h-4" />
                  {personalityResult ? 'Retake Personality Test' : 'Take Personality Test'}
                </button>
                {personalityResult && (
                  <button
                    onClick={() => setStep('details')}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-primary text-primary font-medium text-sm hover:bg-primary/10"
                  >
                    Skip to Details <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Taking the test ───────────────────────────────────────── */}
        {step === 'test-taking' && (
          <motion.div key="test-taking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PersonalityTest
              onComplete={(result) => {
                setPersonalityResult(result);
                setStep('test-result');
              }}
              onBack={() => setStep('test-prompt')}
            />
          </motion.div>
        )}

        {/* ── STEP 4: Test results ──────────────────────────────────────────── */}
        {step === 'test-result' && personalityResult && (
          <motion.div key="test-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PersonalityResult
              result={personalityResult}
              onUse={() => setStep('test-customize')}
              onRetake={() => setStep('test-taking')}
            />
          </motion.div>
        )}

        {/* ── STEP 5: Customize ────────────────────────────────────────────── */}
        {step === 'test-customize' && personalityResult && (
          <motion.div key="test-customize" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PersonalityCustomize
              result={personalityResult}
              onChange={setPersonalityResult}
              onContinue={() => setStep('details')}
              onBack={() => setStep('test-result')}
            />
          </motion.div>
        )}

        {/* ── STEP 6: Details ──────────────────────────────────────────────── */}
        {step === 'details' && (
          <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
              <h2 className="font-semibold">Character Details</h2>

              <div>
                <label className={labelClass}>Backstory *</label>
                <textarea value={details.backstory}
                  onChange={(e) => setDetails((p) => ({ ...p, backstory: e.target.value }))}
                  className={`${fieldClass} min-h-[120px] resize-none`}
                  placeholder={`Who is ${basic.name}? What shaped them? What do they want from life?`} />
              </div>

              <div>
                <label className={labelClass}>Speech Patterns</label>
                <textarea value={details.speechPatterns}
                  onChange={(e) => setDetails((p) => ({ ...p, speechPatterns: e.target.value }))}
                  className={`${fieldClass} min-h-[80px] resize-none`}
                  placeholder='Signature phrases, sentence style. e.g. "Short sentences. Starts messages with Look,"' />
              </div>

              <div>
                <label className={labelClass}>Response Guidelines</label>
                <textarea value={details.responseGuidelines}
                  onChange={(e) => setDetails((p) => ({ ...p, responseGuidelines: e.target.value }))}
                  className={`${fieldClass} min-h-[80px] resize-none`}
                  placeholder="Additional instructions for how the AI should behave as this character..." />
              </div>

              <TagInput label="Interests" value={details.interests} onChange={(v) => setDetails((p) => ({ ...p, interests: v }))} placeholder="Add interest and press Enter" />
              <TagInput label="Likes" value={details.likes} onChange={(v) => setDetails((p) => ({ ...p, likes: v }))} placeholder="Add something they like" />
              <TagInput label="Dislikes" value={details.dislikes} onChange={(v) => setDetails((p) => ({ ...p, dislikes: v }))} placeholder="Add something they dislike" />
              <TagInput label="Values" value={details.values} onChange={(v) => setDetails((p) => ({ ...p, values: v }))} placeholder="Add a core value" />
              <TagInput label="Quirks" value={details.quirks} onChange={(v) => setDetails((p) => ({ ...p, quirks: v }))} placeholder="Add a personality quirk" />

              <div>
                <label className={labelClass}>Color Theme</label>
                <select
                  value={details.colorTheme}
                  onChange={(e) => setDetails((p) => ({ ...p, colorTheme: e.target.value }))}
                  className={`${fieldClass} cursor-pointer`}
                >
                  <option value="blue">Blue (Cool)</option>
                  <option value="warm">Warm (Orange)</option>
                  <option value="purple">Purple (Mystic)</option>
                  <option value="red">Red (Bold)</option>
                  <option value="green">Green (Natural)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setStep(personalityResult ? 'test-customize' : 'test-prompt')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => setStep('review')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
              >
                Review & Create <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 7: Review ───────────────────────────────────────────────── */}
        {step === 'review' && (
          <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h2 className="font-semibold">Review & Create</h2>

              {/* Character preview card */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-muted">
                <img
                  src={avatarSrc}
                  alt={basic.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-border shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-lg">{basic.name || '(No name)'}</p>
                  <p className="text-sm text-muted-foreground italic">"{basic.tagline}"</p>
                  {personalityResult && (
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                        {personalityResult.mbtiType}
                      </span>
                      <span className="text-xs text-muted-foreground">{personalityResult.mbtiTitle}</span>
                      {personalityResult.personalityTags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted-foreground/15 text-muted-foreground">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">{basic.description}</p>

              {personalityResult?.mbtiDescription && (
                <p className="text-xs text-muted-foreground italic border-l-2 border-primary/40 pl-3">
                  {personalityResult.mbtiDescription}
                </p>
              )}

              {details.interests.length > 0 && (
                <div>
                  <span className="text-sm font-medium">Interests: </span>
                  <span className="text-sm text-muted-foreground">{details.interests.join(', ')}</span>
                </div>
              )}

              {!personalityResult && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-300">
                  ⚠ No personality test completed. The character will use default personality settings.
                </div>
              )}

              {/* Publish toggle */}
              <div className="flex items-center gap-3 p-4 rounded-xl border border-border">
                <input
                  type="checkbox"
                  id="publish"
                  checked={details.isPublic}
                  onChange={(e) => setDetails((p) => ({ ...p, isPublic: e.target.checked }))}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <div>
                  <label htmlFor="publish" className="font-medium text-sm cursor-pointer">
                    Publish to Gallery
                  </label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Allow other users to discover and chat with this character
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setStep('details')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !basic.name.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Create Character
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
