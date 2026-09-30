import { Link } from 'react-router-dom';
import { MessageCircle, User, Bot } from 'lucide-react';
import { Character } from '../../types';
import {
  cn,
  STAGE_LABELS,
  STAGE_COLORS,
  EMOTION_EMOJIS,
  COLOR_THEME_GRADIENTS,
  COLOR_THEME_BORDER,
  COLOR_THEME_ACCENT,
} from '../../utils';

interface Props {
  character: Character;
}

export function CharacterCard({ character }: Props) {
  const { personalityJson, relationship, emotionalState } = character;
  const theme = personalityJson?.colorTheme || 'blue';
  const stage = relationship?.stage || 'STRANGER';
  const emotion = emotionalState?.currentEmotion || 'calm';
  const traits = [
    personalityJson?.type,
    ...(personalityJson?.values?.slice(0, 3) || []),
  ].filter(Boolean);

  return (
    <div
      className={cn(
        'group relative rounded-2xl border bg-card overflow-hidden transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-1',
        COLOR_THEME_BORDER[theme] || 'border-border'
      )}
    >
      {/* Gradient overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-40 pointer-events-none',
          COLOR_THEME_GRADIENTS[theme] || ''
        )}
      />

      {/* AI Badge */}
      <div className="absolute top-3 right-3 z-10">
        <span className="flex items-center gap-1 text-xs bg-background/80 backdrop-blur-sm border border-border rounded-full px-2 py-0.5 text-muted-foreground">
          <Bot className="w-3 h-3" />
          AI Character
        </span>
      </div>

      <div className="relative p-5 flex flex-col gap-4">
        {/* Avatar + Name */}
        <div className="flex items-start gap-3">
          <div className="relative flex-shrink-0">
            <img
              src={character.avatarUrl}
              alt={character.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-border"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/personas/svg?seed=${character.name}`;
              }}
            />
            {/* Emotion indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 text-sm leading-none">
              {EMOTION_EMOJIS[emotion]}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-base leading-tight">{character.name}</h3>
            <p className={cn('text-xs mt-0.5 font-medium italic', COLOR_THEME_ACCENT[theme] || 'text-muted-foreground')}>
              "{character.tagline}"
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {character.description}
        </p>

        {/* Personality Traits */}
        <div className="flex flex-wrap gap-1">
          {traits.slice(0, 4).map((t) => (
            <span
              key={t}
              className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Relationship Stage */}
        <div className="flex items-center justify-between pt-1 border-t border-border/50">
          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', STAGE_COLORS[stage])}>
            {STAGE_LABELS[stage]}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            to={`/chat/${character.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Chat
          </Link>
          <Link
            to={`/characters/${character.id}`}
            className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
          >
            <User className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
