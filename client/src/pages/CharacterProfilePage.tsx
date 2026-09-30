import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MessageCircle, ArrowLeft, Bot, Lightbulb, Calendar, Star, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { Character, RelationshipData, Memory } from '../types';
import {
  cn,
  STAGE_LABELS,
  STAGE_COLORS,
  STAGES,
  EMOTION_EMOJIS,
  COLOR_THEME_GRADIENTS,
  COLOR_THEME_ACCENT,
} from '../utils';

const MEMORY_ICONS: Record<string, React.ReactNode> = {
  FACT: <Lightbulb className="w-3.5 h-3.5" />,
  EVENT: <Calendar className="w-3.5 h-3.5" />,
  PREFERENCE: <Heart className="w-3.5 h-3.5" />,
  MILESTONE: <Star className="w-3.5 h-3.5" />,
};

function RelationshipBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-32 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(1, value)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-8 text-right">{Math.round(value)}</span>
    </div>
  );
}

function StageTrack({ currentStage }: { currentStage: string }) {
  const currentIndex = STAGES.indexOf(currentStage as typeof STAGES[number]);
  return (
    <div className="flex items-center gap-1">
      {STAGES.map((stage, i) => (
        <div key={stage} className="flex items-center gap-1">
          <div
            className={cn(
              'w-2.5 h-2.5 rounded-full border-2 transition-colors',
              i <= currentIndex
                ? 'bg-primary border-primary'
                : 'bg-transparent border-muted-foreground/40'
            )}
            title={STAGE_LABELS[stage]}
          />
          {i < STAGES.length - 1 && (
            <div
              className={cn(
                'flex-1 h-0.5 w-6 transition-colors',
                i < currentIndex ? 'bg-primary' : 'bg-muted-foreground/20'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function CharacterProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<Character | null>(null);
  const [relationship, setRelationship] = useState<RelationshipData | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [emotionalState, setEmotionalState] = useState<{ currentEmotion: string; intensity: number } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get(`/characters/${id}`);
        setCharacter(data.character);
        setRelationship(data.relationship);
        setMemories(data.memories || []);
        setEmotionalState(data.emotionalState);
      } catch {
        navigate('/characters');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="h-64 rounded-2xl bg-muted animate-pulse mb-4" />
        <div className="h-32 rounded-2xl bg-muted animate-pulse" />
      </div>
    );
  }

  if (!character) return null;

  const p = character.personalityJson;
  const theme = p?.colorTheme || 'blue';
  const stage = relationship?.stage || 'STRANGER';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Hero Card */}
      <div className={cn('rounded-2xl border overflow-hidden relative', 'border-border')}>
        <div className={cn('absolute inset-0 bg-gradient-to-br opacity-30 pointer-events-none', COLOR_THEME_GRADIENTS[theme] || '')} />
        <div className="relative p-6">
          {/* AI badge */}
          <div className="flex justify-end mb-4">
            <span className="flex items-center gap-1 text-xs bg-background/80 backdrop-blur-sm border border-border rounded-full px-2 py-0.5 text-muted-foreground">
              <Bot className="w-3 h-3" />
              AI Character
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="relative">
              <img
                src={character.avatarUrl}
                alt={character.name}
                className="w-24 h-24 rounded-full border-2 border-border object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/personas/svg?seed=${character.name}`;
                }}
              />
              {emotionalState && (
                <div className="absolute -bottom-1 -right-1 text-xl leading-none">
                  {EMOTION_EMOJIS[emotionalState.currentEmotion as keyof typeof EMOTION_EMOJIS] || '😌'}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{character.name}</h1>
              <p className={cn('text-sm italic mt-1', COLOR_THEME_ACCENT[theme] || 'text-muted-foreground')}>
                "{character.tagline}"
              </p>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{character.description}</p>
              {p && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium">{p.type}</span>
                  {p.values?.slice(0, 3).map((v) => (
                    <span key={v} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{v}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Relationship Stage */}
          <div className="mt-5 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Relationship</span>
              <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', STAGE_COLORS[stage])}>
                {STAGE_LABELS[stage]}
              </span>
            </div>
            <StageTrack currentStage={stage} />
          </div>

          {/* Chat CTA */}
          <div className="mt-4">
            <Link
              to={`/chat/${character.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Start Chatting
            </Link>
          </div>
        </div>
      </div>

      {/* Personality & Details */}
      {p && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-semibold text-sm mb-3">Interests</h2>
            <div className="flex flex-wrap gap-1.5">
              {p.interests?.map((i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                  {i}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-semibold text-sm mb-3">Personality</h2>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">{p.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Humor</span>
                <span className="font-medium capitalize">{p.humorLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Openness</span>
                <span className="font-medium capitalize">{p.emotionalOpenness?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confidence</span>
                <span className="font-medium capitalize">{p.confidence?.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Relationship Dimensions */}
      {relationship && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold text-sm mb-4">Relationship Status</h2>
          <div className="space-y-3">
            <RelationshipBar label="Familiarity" value={relationship.familiarity} />
            <RelationshipBar label="Trust" value={relationship.trust} />
            <RelationshipBar label="Friendship" value={relationship.friendship} />
            <RelationshipBar label="Affection" value={relationship.affection} />
            <RelationshipBar label="Curiosity" value={relationship.curiosity} />
            <RelationshipBar label="Emotional Closeness" value={relationship.emotionalCloseness} />
          </div>
        </div>
      )}

      {/* Memories */}
      {memories.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold text-sm mb-4">
            What {character.name} Remembers
          </h2>
          <div className="space-y-2">
            {memories.map((mem) => (
              <div
                key={mem.id}
                className="flex items-start gap-2.5 py-2 border-b border-border/50 last:border-0"
              >
                <div className="mt-0.5 text-muted-foreground flex-shrink-0">
                  {MEMORY_ICONS[mem.type] || <Lightbulb className="w-3.5 h-3.5" />}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{mem.content}</p>
                <span className="text-xs text-muted-foreground/50 ml-auto shrink-0 font-medium">
                  {mem.importance}/10
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {memories.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 text-center">
          <p className="text-sm text-muted-foreground">
            {character.name} doesn't remember anything about you yet. Start a conversation!
          </p>
          <Link to={`/chat/${character.id}`} className="text-primary text-sm hover:underline mt-2 inline-block">
            Start chatting →
          </Link>
        </div>
      )}
    </div>
  );
}
