import { motion } from 'framer-motion';
import { RotateCcw, Check, ChevronRight } from 'lucide-react';
import { PersonalityTestResult, PersonalityTraits } from '../../types';
import { cn } from '../../utils';

interface Props {
  result: PersonalityTestResult;
  onUse: () => void;
  onRetake: () => void;
}

const COLOR_ACCENT: Record<string, string> = {
  blue: 'text-blue-500',
  warm: 'text-orange-500',
  purple: 'text-purple-500',
  red: 'text-red-500',
  green: 'text-green-500',
};

const COLOR_BG: Record<string, string> = {
  blue: 'bg-blue-500',
  warm: 'bg-orange-500',
  purple: 'bg-purple-500',
  red: 'bg-red-500',
  green: 'bg-green-500',
};

const COLOR_BADGE: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  warm: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  red: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  green: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
};

function TraitMeter({ label, value, colorClass }: { label: string; value: number; colorClass: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-36 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', colorClass)}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-8 text-right">{value}</span>
    </div>
  );
}

const TRAIT_LABELS: Partial<Record<keyof PersonalityTraits, string>> = {
  introversion: 'Introversion',
  openness: 'Openness',
  confidence: 'Confidence',
  humor: 'Humor',
  emotionalExpressiveness: 'Emotional Expression',
  spontaneity: 'Spontaneity',
  assertiveness: 'Assertiveness',
  independence: 'Independence',
  curiosity: 'Curiosity',
  patience: 'Patience',
};

const TRAIT_DISPLAY_ORDER: (keyof PersonalityTraits)[] = [
  'introversion', 'openness', 'confidence', 'humor',
  'emotionalExpressiveness', 'spontaneity', 'assertiveness', 'independence',
];

export function PersonalityResult({ result, onUse, onRetake }: Props) {
  const theme = result.colorTheme || 'blue';
  const accentClass = COLOR_ACCENT[theme] || COLOR_ACCENT.blue;
  const barClass = COLOR_BG[theme] || COLOR_BG.blue;
  const badgeClass = COLOR_BADGE[theme] || COLOR_BADGE.blue;

  const trustLabel = result.relationshipStyle.trustSpeed < 40
    ? 'Slow to trust'
    : result.relationshipStyle.trustSpeed > 70
    ? 'Quick to trust'
    : 'Moderately trusting';

  const affectionLabel = result.relationshipStyle.affectionStyle < 40
    ? 'Subtle affection'
    : result.relationshipStyle.affectionStyle > 70
    ? 'Openly affectionate'
    : 'Moderately expressive';

  const commStyle = [
    result.communication.directness > 65 ? 'Direct' : 'Thoughtful',
    result.communication.sarcasm > 55 ? 'Dry Humor' : null,
    result.traits.sociability > 65 ? 'Talkative' : result.traits.introversion > 65 ? 'Concise' : null,
    result.traits.emotionalExpressiveness > 65 ? 'Expressive' : result.traits.emotionalExpressiveness < 35 ? 'Reserved' : null,
  ].filter(Boolean).join(' · ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto space-y-5"
    >
      {/* MBTI Hero */}
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Your Character's Personality</p>
        <div className={cn('text-5xl font-black mb-1', accentClass)}>{result.mbtiType}</div>
        <div className="text-xl font-semibold mb-3">{result.mbtiTitle}</div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto italic">
          "{result.mbtiDescription}"
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {result.personalityTags.map((tag) => (
            <span key={tag} className={cn('text-xs px-3 py-1 rounded-full font-medium', badgeClass)}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Trait Meters */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-semibold text-sm mb-4">Personality Dimensions</h3>
        <div className="space-y-3">
          {TRAIT_DISPLAY_ORDER.map((key) => (
            <TraitMeter
              key={key}
              label={TRAIT_LABELS[key] || key}
              value={result.traits[key]}
              colorClass={barClass}
            />
          ))}
        </div>
      </div>

      {/* Communication & Relationship Style */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-semibold text-sm mb-3">Communication Style</h3>
          <p className={cn('text-sm font-medium mb-2', accentClass)}>{commStyle || 'Thoughtful · Balanced'}</p>
          <div className="space-y-2 mt-3">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Directness</span>
              <span>{result.communication.directness > 65 ? 'Very direct' : result.communication.directness > 45 ? 'Moderate' : 'Diplomatic'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Tone</span>
              <span className="capitalize">{result.communication.tone}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Humor</span>
              <span className="capitalize">{result.communication.humor}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-semibold text-sm mb-3">Relationship Style</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Trust</span>
              <span>{trustLabel}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Affection</span>
              <span>{affectionLabel}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Independence</span>
              <span>{result.relationshipStyle.independence > 70 ? 'High' : result.relationshipStyle.independence > 45 ? 'Moderate' : 'Prefers closeness'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Reactivity</span>
              <span>{result.relationshipStyle.emotionalReactivity > 65 ? 'Emotionally reactive' : 'Emotionally stable'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Behaviour Notes */}
      {result.behaviourNotes.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-semibold text-sm mb-3">How This Character Tends to Behave</h3>
          <ul className="space-y-2">
            {result.behaviourNotes.map((note, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className={cn('mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 mt-2', barClass)} />
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={onRetake}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-muted transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Retake Test
        </button>
        <button
          onClick={onUse}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Check className="w-4 h-4" />
          Use This Personality
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
