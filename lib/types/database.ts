export type Platform = 'twitter' | 'linkedin' | 'reddit'

export type Tone = 'educational' | 'professional' | 'funny' | 'inspirational' | 'controversial' | 'casual'

export type ContentType = 'text' | 'pdf' | 'excel' | 'csv' | 'google_sheets'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Generation {
  id: string
  user_id: string
  original_content: string
  content_type: ContentType
  file_url: string | null
  file_name: string | null
  platforms: Platform[]
  created_at: string
}

export interface GeneratedPost {
  id: string
  generation_id: string
  platform: Platform
  tone: Tone
  content: string
  hashtags: string[]
  character_count: number
  created_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  default_platforms: Platform[]
  default_tones: Record<Platform, Tone>
  created_at: string
  updated_at: string
}

export interface GenerationWithPosts extends Generation {
  generated_posts: GeneratedPost[]
}
