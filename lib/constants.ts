import { Platform, Tone } from './types/database'

export const PLATFORMS: { value: Platform; label: string; color: string; maxChars: number }[] = [
  { value: 'twitter', label: 'Twitter/X', color: 'bg-black', maxChars: 280 },
  { value: 'linkedin', label: 'LinkedIn', color: 'bg-blue-700', maxChars: 300 },
  // { value: 'reddit', label: 'Reddit', color: 'bg-orange-600', maxChars: 400 },
]

export const TONES: { value: Tone; label: string; description: string }[] = [
  { value: 'educational', label: 'Educational', description: 'Informative and teaching-focused' },
  { value: 'professional', label: 'Professional', description: 'Business-appropriate and polished' },
  { value: 'funny', label: 'Funny', description: 'Humorous and entertaining' },
  { value: 'inspirational', label: 'Inspirational', description: 'Motivating and uplifting' },
  { value: 'casual', label: 'Casual', description: 'Relaxed and conversational' },
]

export const FILE_TYPES = {
  pdf: { accept: '.pdf', mime: 'application/pdf' },
} as const
