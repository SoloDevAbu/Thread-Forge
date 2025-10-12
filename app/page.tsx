'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Zap, TrendingUp, Target } from 'lucide-react'
import { ContentInput } from '@/components/content-input'
import { PostPreview } from '@/components/post-preview'
import { AuthDialog } from '@/components/auth-dialog'
import { HistorySidebar } from '@/components/history-sidebar'
import { createClient } from '@/lib/supabase/client'
import { GeneratedPost, Platform, Tone, GenerationWithPosts } from '@/lib/types/database'
import { parseFile } from '@/lib/file-parser'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleGenerate = async (data: {
    content: string
    file?: File
    platforms: Platform[]
    tones: Record<Platform, Tone>
  }) => {
    if (!user) {
      setShowAuthDialog(true)
      return
    }

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

  const handleSelectGeneration = (generation: GenerationWithPosts) => {
    if (generation.generated_posts) {
      setGeneratedPosts(generation.generated_posts)
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthDialog(false)
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <HistorySidebar onSelectGeneration={handleSelectGeneration} />

      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12 pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Content Transformation
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
            Transform Content Into
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Viral Social Posts
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Convert long-form content, PDFs, spreadsheets, and documents into platform-optimized,
            engagement-ready posts for Twitter, LinkedIn, and Reddit.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-medium">AI-Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <span className="font-medium">Viral-Optimized</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <span className="font-medium">Platform-Specific</span>
            </div>
          </div>
        </header>

        <ContentInput onGenerate={handleGenerate} loading={loading} />

        {error && (
          <div className="max-w-4xl mx-auto mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {generatedPosts.length > 0 && (
          <div className="mt-12 max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Your Viral Posts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedPosts.map((post) => (
                <PostPreview key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}

        {!loading && generatedPosts.length === 0 && (
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-xl">
                    1
                  </div>
                  <h4 className="font-semibold text-gray-900">Input Content</h4>
                  <p className="text-sm text-gray-600">
                    Paste text or upload PDFs, Excel files, or CSV documents
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-bold text-xl">
                    2
                  </div>
                  <h4 className="font-semibold text-gray-900">Choose Platforms & Tone</h4>
                  <p className="text-sm text-gray-600">
                    Select target platforms and customize tone for each
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 font-bold text-xl">
                    3
                  </div>
                  <h4 className="font-semibold text-gray-900">Get Viral Posts</h4>
                  <p className="text-sm text-gray-600">
                    Receive optimized posts with hashtags, ready to copy and share
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        onSuccess={handleAuthSuccess}
      />

      <footer className="mt-20 py-8 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p className="text-sm">
            Built with Next.js, Supabase, and AI
          </p>
        </div>
      </footer>
    </div>
  )
}
