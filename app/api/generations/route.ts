import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const generations = await prisma.generation.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        generatedPosts: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    // Transform the data to match the expected format
    const formattedGenerations = generations.map((gen) => ({
      id: gen.id,
      user_id: gen.userId,
      original_content: gen.originalContent,
      content_type: gen.contentType,
      file_url: gen.fileUrl,
      file_name: gen.fileName,
      platforms: gen.platforms,
      created_at: gen.createdAt.toISOString(),
      generated_posts: gen.generatedPosts.map((post) => ({
        id: post.id,
        generation_id: post.generationId,
        platform: post.platform,
        tone: post.tone,
        content: post.content,
        hashtags: post.hashtags,
        character_count: post.characterCount,
        created_at: post.createdAt.toISOString(),
      })),
    }))

    return NextResponse.json(formattedGenerations)
  } catch (error) {
    console.error('Error fetching generations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
