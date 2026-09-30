import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Brain } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';
import { TestQuestion, PersonalityTestResult } from '../../types';
import { cn } from '../../utils';

interface Props {
  onComplete: (result: PersonalityTestResult) => void;
  onBack: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  social: 'Social Behavior',
  decision: 'Decision Making',
  emotional: 'Emotional Response',
  conflict: 'Conflict & Pressure',
  preference: 'Personal Preferences',
  relationship: 'Relationships',
  problem: 'Problem Solving',
  situational: 'Real Situations',
};

export function PersonalityTest({ onComplete, onBack }: Props) {
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  useEffect(() => {
    api.get('/personality-test/questions')
      .then(({ data }) => setQuestions(data.questions))
      .catch(() => toast.error('Failed to load personality test'))
      .finally(() => setLoading(false));
  }, []);

  const question = questions[current];
  const total = questions.length;
  const progress = total > 0 ? ((current) / total) * 100 : 0;
  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id]);

  const handleSelect = useCallback((optionId: string) => {
    if (!question) return;
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
    // Auto-advance after short delay
    if (current < total - 1) {
      setTimeout(() => {
        setDirection('forward');
        setCurrent((c) => c + 1);
      }, 350);
    }
  }, [question, current, total]);

  const goBack = () => {
    if (current > 0) {
      setDirection('back');
      setCurrent((c) => c - 1);
    }
  };

  const goNext = () => {
    if (current < total - 1) {
      setDirection('forward');
      setCurrent((c) => c + 1);
    }
  };

  async function handleFinish() {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < 20) {
      toast.error(`Please answer at least 20 questions (you've answered ${answeredCount})`);
      return;
    }
    setScoring(true);
    try {
      const { data } = await api.post('/personality-test/score', { answers });
      onComplete(data.profile as PersonalityTestResult);
    } catch {
      toast.error('Failed to score test. Please try again.');
    } finally {
      setScoring(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading personality test...</p>
      </div>
    );
  }

  if (scoring) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Brain className="w-12 h-12 text-primary" />
        </motion.div>
        <div className="text-center">
          <h3 className="font-semibold text-lg">Analyzing the results...</h3>
          <p className="text-sm text-muted-foreground mt-1">Building your character's personality profile</p>
        </div>
      </div>
    );
  }

  if (!question) return null;

  const selectedAnswer = answers[question.id];
  const isLast = current === total - 1;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to character info
        </button>
        <span className="text-sm text-muted-foreground font-medium">
          Question {current + 1} of {total}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-muted-foreground">{CATEGORY_LABELS[question.category] || question.category}</span>
          <span className="text-xs text-muted-foreground">
            {Object.keys(answers).length}/{total} answered
          </span>
        </div>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: direction === 'forward' ? 40 : -40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction === 'forward' ? -40 : 40 }}
          transition={{ duration: 0.25 }}
        >
          <div className="rounded-2xl border border-border bg-card p-6 mb-5">
            <h2 className="text-lg font-medium leading-snug mb-6">{question.question}</h2>

            <div className="space-y-3">
              {question.options.map((opt) => {
                const selected = selectedAnswer === opt.id;
                return (
                  <motion.button
                    key={opt.id}
                    onClick={() => handleSelect(opt.id)}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all duration-200',
                      'flex items-start gap-3 group',
                      selected
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    )}
                  >
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-colors',
                        selected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/40 text-muted-foreground group-hover:border-primary/60'
                      )}
                    >
                      {opt.id}
                    </div>
                    <span className={cn('text-sm leading-relaxed', selected ? 'text-foreground' : 'text-muted-foreground')}>
                      {opt.text}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goBack}
          disabled={current === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="flex gap-1">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > current ? 'forward' : 'back'); setCurrent(i); }}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                i === current ? 'bg-primary w-4' : answers[questions[i]?.id] ? 'bg-primary/50' : 'bg-muted-foreground/30'
              )}
            />
          ))}
        </div>

        {isLast ? (
          <button
            onClick={handleFinish}
            disabled={!allAnswered && Object.keys(answers).length < 20}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Brain className="w-4 h-4" />
            See Results
          </button>
        ) : (
          <button
            onClick={goNext}
            disabled={!selectedAnswer}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Skip to finish when enough are answered */}
      {!isLast && Object.keys(answers).length >= 20 && (
        <div className="text-center mt-4">
          <button
            onClick={handleFinish}
            className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
          >
            I've answered enough — see my results
          </button>
        </div>
      )}
    </div>
  );
}
