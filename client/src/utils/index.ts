import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { RelationshipStage, EmotionType } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const STAGE_LABELS: Record<RelationshipStage, string> = {
  STRANGER: 'Stranger',
  ACQUAINTANCE: 'Acquaintance',
  FRIEND: 'Friend',
  CLOSE_FRIEND: 'Close Friend',
  ROMANTIC_INTEREST: 'Romantic Interest',
  DEEP_CONNECTION: 'Deep Connection',
};

export const STAGE_COLORS: Record<RelationshipStage, string> = {
  STRANGER: 'text-muted-foreground bg-muted',
  ACQUAINTANCE: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950',
  FRIEND: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950',
  CLOSE_FRIEND: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950',
  ROMANTIC_INTEREST: 'text-pink-600 bg-pink-50 dark:text-pink-400 dark:bg-pink-950',
  DEEP_CONNECTION: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950',
};

export const EMOTION_EMOJIS: Record<EmotionType, string> = {
  happy: '😊',
  excited: '✨',
  curious: '🤔',
  sad: '💙',
  nervous: '😰',
  annoyed: '😤',
  jealous: '💚',
  affectionate: '🥰',
  calm: '😌',
  lonely: '🌙',
};

export const COLOR_THEME_GRADIENTS: Record<string, string> = {
  blue: 'from-blue-500/20 to-indigo-600/20',
  warm: 'from-orange-400/20 to-amber-500/20',
  purple: 'from-purple-500/20 to-violet-600/20',
  red: 'from-red-500/20 to-rose-600/20',
  green: 'from-green-500/20 to-emerald-600/20',
};

export const COLOR_THEME_ACCENT: Record<string, string> = {
  blue: 'text-blue-500',
  warm: 'text-orange-500',
  purple: 'text-purple-500',
  red: 'text-red-500',
  green: 'text-green-500',
};

export const COLOR_THEME_BORDER: Record<string, string> = {
  blue: 'border-blue-500/30',
  warm: 'border-orange-500/30',
  purple: 'border-purple-500/30',
  red: 'border-red-500/30',
  green: 'border-green-500/30',
};

export const STAGES: RelationshipStage[] = [
  'STRANGER',
  'ACQUAINTANCE',
  'FRIEND',
  'CLOSE_FRIEND',
  'ROMANTIC_INTEREST',
  'DEEP_CONNECTION',
];
