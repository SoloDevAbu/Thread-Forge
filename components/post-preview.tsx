'use client'

import { TwitterCard } from './cards/twitter-card'
import { LinkedInCard } from './cards/linkedin-card'
import { RedditCard } from './cards/reddit-card'
import { GeneratedPost } from '@/lib/types/database'

interface PostPreviewProps {
  post: GeneratedPost
}

export function PostPreview({ post }: PostPreviewProps) {
  switch (post.platform) {
    case 'twitter':
      return <TwitterCard post={post} />
    case 'linkedin':
      return <LinkedInCard post={post} />
    case 'reddit':
      return <RedditCard post={post} />
    default:
      return <TwitterCard post={post} />
  }
}
