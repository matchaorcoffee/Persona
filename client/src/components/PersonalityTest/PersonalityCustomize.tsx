import { PersonalityTestResult } from '../../types';
import { ChevronRight } from 'lucide-react';

interface Props {
  result: PersonalityTestResult;
  onChange: (updated: PersonalityTestResult) => void;
  onContinue: () => void;
  onBack: () => void;
}

interface SliderConfig {
  key: keyof PersonalityTestResult['traits'];
  label: string;
  lowLabel: string;
  highLabel: string;
}

const SLIDERS: SliderConfig[] = [
  { key: 'humor', label: 'Humor', lowLabel: 'Serious', highLabel: 'Very Funny' },
  { key: 'emotionalExpressiveness', label: 'Emotional Expression', lowLabel: 'Reserved', highLabel: 'Very Open' },
  { key: 'confidence', label: 'Confidence', lowLabel: 'Humble', highLabel: 'Very Confident' },
  { key: 'assertiveness', label: 'Assertiveness', lowLabel: 'Gentle', highLabel: 'Very Direct' },
  { key: 'spontaneity', label: 'Spontaneity', lowLabel: 'Structured', highLabel: 'Spontaneous' },
  { key: 'introversion', label: 'Social Energy', lowLabel: 'Social Butterfly', highLabel: 'Introverted' },
  { key: 'patience', label: 'Patience', lowLabel: 'Quick-paced', highLabel: 'Very Patient' },
  { key: 'curiosity', label: 'Curiosity', lowLabel: 'Focused', highLabel: 'Highly Curious' },
];

function TraitSlider({
  config,
  value,
  onChange,
}: {
  config: SliderConfig;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{config.label}</label>
        <span className="text-xs text-muted-foreground w-8 text-right">{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{config.lowLabel}</span>
        <span>{config.highLabel}</span>
      </div>
    </div>
  );
}

export function PersonalityCustomize({ result, onChange, onContinue, onBack }: Props) {
  function handleSliderChange(key: keyof PersonalityTestResult['traits'], value: number) {
    onChange({
      ...result,
      traits: { ...result.traits, [key]: value },
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold">Fine-tune the Personality</h2>
        <p className="text-sm text-muted-foreground mt-1">
          These sliders adjust specific traits from the test result. The core personality remains
          intact — you're adding creative control on top.
        </p>
      </div>

      {/* MBTI reminder */}
      <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
        <div className="text-2xl font-black text-primary">{result.mbtiType}</div>
        <div>
          <p className="font-semibold text-sm">{result.mbtiTitle}</p>
          <p className="text-xs text-muted-foreground">{result.mbtiDescription}</p>
        </div>
      </div>

      {/* Sliders */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
        {SLIDERS.map((config) => (
          <TraitSlider
            key={config.key}
            config={config}
            value={result.traits[config.key]}
            onChange={(v) => handleSliderChange(config.key, v)}
          />
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Adjusting sliders fine-tunes the personality without overriding the test results.
        The character's core type and tendencies remain grounded in the assessment.
      </p>

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted transition-colors"
        >
          Back
        </button>
        <button
          onClick={onContinue}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Continue to Details
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
