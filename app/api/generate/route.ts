import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { Platform, Tone } from '@/lib/types/database'
import { PLATFORMS } from '@/lib/constants'

interface GenerateRequest {
  content: string
  platforms: Platform[]
  tones: Record<Platform, Tone>
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: GenerateRequest = await request.json()
    const { content, platforms, tones } = body

    if (!content || !platforms || platforms.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const generationId = crypto.randomUUID()

    const { error: genError } = await supabase.from('generations').insert({
      id: generationId,
      user_id: user.id,
      original_content: content,
      content_type: 'text',
      platforms,
    })

    if (genError) {
      console.error('Error creating generation:', genError)
      return NextResponse.json({ error: 'Failed to save generation' }, { status: 500 })
    }

    const generatedPosts = []

    for (const platform of platforms) {
      const tone = tones[platform]
      const platformInfo = PLATFORMS.find((p) => p.value === platform)

      if (!platformInfo) continue

      const prompt = createPrompt(content, platform, tone, platformInfo.maxChars)

      try {
        const { text } = await generateText({
          model: openai('gpt-4-turbo-preview'),
          prompt,
          temperature: 0.7,
        })

        const { postContent, hashtags } = parseGeneratedContent(text)

        const post = {
          generation_id: generationId,
          platform,
          tone,
          content: postContent,
          hashtags,
          character_count: postContent.length,
        }

        const { error: postError } = await supabase.from('generated_posts').insert(post)

        if (!postError) {
          generatedPosts.push({ id: crypto.randomUUID(), ...post, created_at: new Date().toISOString() })
        }
      } catch (error) {
        console.error(`Error generating for ${platform}:`, error)
      }
    }

    return NextResponse.json({
      generationId,
      posts: generatedPosts,
    })
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function createPrompt(content: string, platform: Platform, tone: Tone, maxChars: number): string {
  const platformGuidelines = {
    twitter: 'Keep it concise, punchy, and engaging. Use line breaks for readability. Twitter/X users value brevity and wit.',
    linkedin: 'Professional yet approachable. Use proper formatting with line breaks. Focus on insights and value.',
    reddit: 'Conversational and authentic. Redditors value genuine, detailed content. Avoid corporate speak.',
  }

  const toneGuidelines = {
    educational: 'Focus on teaching and providing valuable insights. Use clear explanations.',
    professional: 'Maintain a polished, business-appropriate tone. Be authoritative yet accessible.',
    funny: 'Inject humor and wit. Make it entertaining while delivering the message.',
    inspirational: 'Be motivating and uplifting. Use powerful, encouraging language.',
    controversial: 'Take a bold stance. Challenge conventional thinking. Be thought-provoking.',
    casual: 'Write like talking to a friend. Be relaxed and conversational.',
  }

  return `Transform the following content into a viral ${platform} post with a ${tone} tone.

ORIGINAL CONTENT:
${content}

REQUIREMENTS:
- Platform: ${platform.toUpperCase()}
- Tone: ${tone} (${toneGuidelines[tone]})
- Platform guidelines: ${platformGuidelines[platform]}
- Maximum ${maxChars} characters
- Include 3-5 relevant, trending hashtags at the end (on a new line, prefixed with "HASHTAGS:")
- Make it engaging, shareable, and optimized for ${platform}
- Use emojis strategically if appropriate for the platform and tone
- Format with proper line breaks for readability

OUTPUT FORMAT:
[Your viral post content here]

HASHTAGS: #hashtag1 #hashtag2 #hashtag3

Generate the post now:`
}

function parseGeneratedContent(text: string): { postContent: string; hashtags: string[] } {
  const parts = text.split('HASHTAGS:')

  let postContent = parts[0].trim()

  let hashtags: string[] = []
  if (parts[1]) {
    hashtags = parts[1]
      .trim()
      .split(/\s+/)
      .filter((tag) => tag.startsWith('#'))
      .slice(0, 5)
  }

  if (hashtags.length === 0) {
    const hashtagRegex = /#[\w]+/g
    const foundHashtags = postContent.match(hashtagRegex) || []
    if (foundHashtags.length > 0) {
      hashtags = foundHashtags.slice(-5)
      postContent = postContent.replace(new RegExp(foundHashtags.join('|'), 'g'), '').trim()
    }
  }

  return { postContent, hashtags }
}
