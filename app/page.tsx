'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { ContentInput } from '@/components/content-input'
import { PostPreview } from '@/components/post-preview'
import { TopBar } from '@/components/top-bar'
import { HistorySidebar } from '@/components/history-sidebar'
import { GeneratedPost, Platform, Tone, GenerationWithPosts } from '@/lib/types/database'
import { parseFile } from '@/lib/file-parser'
import { AuthDialog } from '@/components/auth-dialog'

export default function Home() {
  const { data: session, status } = useSession()
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingGeneration, setPendingGeneration] = useState<{
    content: string
    file?: File
    platforms: Platform[]
    tones: Record<Platform, Tone>
  } | null>(null)

  const user = session?.user

  const performGeneration = async (data: {
    content: string
    file?: File
    platforms: Platform[]
    tones: Record<Platform, Tone>
  }) => {
    setLoading(true)
    setError(null)
    setGeneratedPosts([])

    try {
      let contentToGenerate = data.content

      if (data.file) {
        try {
          contentToGenerate = await parseFile(data.file)
        } catch (err) {
          setError('Failed to parse file. Please try with text content.')
          setLoading(false)
          return
        }
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: contentToGenerate,
          platforms: data.platforms,
          tones: data.tones,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate content')
      }

      const result = await response.json()
      setGeneratedPosts(result.posts)
    } catch (err: any) {
      setError(err.message || 'An error occurred during generation')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async (data: {
    content: string
    file?: File
    platforms: Platform[]
    tones: Record<Platform, Tone>
  }) => {
    if (!session?.user) {
      setPendingGeneration(data)
      setShowAuthDialog(true)
      return
    }

    await performGeneration(data)
  }

  const handleSelectGeneration = (generation: GenerationWithPosts) => {
    if (generation.generated_posts) {
      setGeneratedPosts(generation.generated_posts)
    }
  }

  const handleAuthSuccess = async () => {
    setShowAuthDialog(false)
    
    // Auto-generate if there's a pending generation
    if (pendingGeneration) {
      await performGeneration(pendingGeneration)
      setPendingGeneration(null)
    }
  }

  const handleSignIn = async () => {
    try {
      await signIn('google', { 
        callbackUrl: window.location.href,
        redirect: false 
      })
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors">
      <TopBar user={user} onAuthSuccess={handleAuthSuccess} />
      <HistorySidebar onSelectGeneration={handleSelectGeneration} />

      <div className="container mx-auto px-4 py-12 pt-28">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-5 leading-tight">
            Transform Content Into
            <br />
            Viral Social Posts
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-500 max-w-2xl mx-auto">
            Convert your content into platform-optimized posts for Twitter, LinkedIn, and Reddit.
          </p>
        </header>

        <ContentInput onGenerate={handleGenerate} loading={loading} user={user} />

        {error && (
          <div className="max-w-4xl mx-auto mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {generatedPosts.length > 0 && (
          <div className="mt-16 max-w-6xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Your Viral Posts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedPosts.map((post) => (
                <PostPreview key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}
      </div>

      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  )
}
