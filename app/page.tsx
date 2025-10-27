'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { Twitter, Linkedin } from 'lucide-react'
import { ContentInput } from '@/components/content-input'
import { PostPreview } from '@/components/post-preview'
import { TopBar } from '@/components/top-bar'
import { HistorySidebar } from '@/components/history-sidebar'
import { GeneratedPost, Platform, Tone, GenerationWithPosts } from '@/lib/types/database'
import { parseFile } from '@/lib/file-parser'
import { AuthDialog } from '@/components/auth-dialog'
import { PLATFORMS } from '@/lib/constants'

const DUMMY_POSTS: GeneratedPost[] = [
  {
    id: '1',
    generation_id: '1',
    content: "🔥 Unleash your content's potential! Turn blogs into viral tweets with ThreadForge.",
    platform: 'twitter',
    hashtags: ['ContentCreation', 'ViralPosts'],
    character_count: 100,
    created_at: new Date().toISOString(),
    tone: 'educational',
  },
  {
    id: '2',
    generation_id: '2',
    content: "🔥 Unleash your content's potential! Turn blogs into viral tweets with ThreadForge.",
    platform: 'twitter',
    hashtags: ['ContentCreation', 'ViralPosts'],
    character_count: 100,
    created_at: new Date().toISOString(),
    tone: 'educational',
  },
  {
    id: '3',
    generation_id: '3',
    content: "Wondering how to adapt content for LinkedIn audiences? With ThreadForge, optimize for every platform 🤩 Try it free today!",
    platform: 'linkedin',
    hashtags: ['ContentCreation', 'ViralPosts'],
    character_count: 100,
    created_at: new Date().toISOString(),
    tone: 'educational',
  },
  {
    id: '4',
    generation_id: '4',
    content: "Reddit tip: Sharing knowledge is easy when your posts are tailored. Use ThreadForge to engage, inform, and get upvotes!",
    platform: 'linkedin',
    hashtags: ['ContentCreation', 'ViralPosts'],
    character_count: 100,
    created_at: new Date().toISOString(),
    tone: 'professional',
  },
  {
    id: '5',
    content: "Reddit tip: Sharing knowledge is easy when your posts are tailored. Use ThreadForge to engage, inform, and get upvotes!",
    platform: 'reddit',
    hashtags: ['ContentCreation', 'ViralPosts'],
    character_count: 100,
    created_at: new Date().toISOString(),
    tone: 'casual',
    generation_id: '5',
  },
];

export default function Home() {
  const { data: session, status } = useSession()
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  // For now, initialize with dummy posts
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>(DUMMY_POSTS)
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

      // Comment out real API call for now
      /*
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
      */
      // Use dummy posts for now
      setGeneratedPosts(DUMMY_POSTS)
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:bg-black transition-colors">
      <TopBar user={user || null} onAuthSuccess={handleAuthSuccess} />
      <HistorySidebar onSelectGeneration={handleSelectGeneration} />

      <div className="container mx-auto px-4 py-12 pt-28">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 leading-tight">
            Transform Content Into
            <br />
            Viral Social Posts
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Convert your content into platform-optimized posts for Twitter, LinkedIn, and Reddit.
          </p>
        </header>

        <ContentInput onGenerate={handleGenerate} loading={loading} user={user} />

        {error && (
          <div className="max-w-4xl mx-auto mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="mt-16 max-w-6xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
            Your Viral Posts
          </h2>
          
          {PLATFORMS.map((platform) => {
            const platformPosts = generatedPosts.filter(post => post.platform === platform.value)
            if (platformPosts.length === 0) return null
            
            return (
              <div key={platform.value} className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-8 h-8 rounded-full ${platform.color} flex items-center justify-center`}>
                    {platform.value === 'twitter' && <Twitter className="w-5 h-5 text-white" />}
                    {platform.value === 'linkedin' && <Linkedin className="w-5 h-5 text-white" />}
                    {platform.value === 'reddit' && (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{platform.label}</h3>
                </div>
                
                <div className={`grid gap-6 ${platform.value === 'reddit' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                  {platformPosts.map((post) => (
                    <PostPreview key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  )
}
