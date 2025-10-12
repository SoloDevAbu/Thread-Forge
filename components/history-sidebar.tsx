'use client'

import { useState, useEffect } from 'react'
import { History, Search, Clock, X } from 'lucide-react'
import { GenerationWithPosts } from '@/lib/types/database'
import { createClient } from '@/lib/supabase/client'

interface HistorySidebarProps {
  onSelectGeneration: (generation: GenerationWithPosts) => void
}

export function HistorySidebar({ onSelectGeneration }: HistorySidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [generations, setGenerations] = useState<GenerationWithPosts[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      loadGenerations()
    }
  }, [isOpen])

  const loadGenerations = async () => {
    setLoading(true)
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return

      const { data, error } = await supabase
        .from('generations')
        .select(`
          *,
          generated_posts (*)
        `)
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setGenerations(data as GenerationWithPosts[])
    } catch (error) {
      console.error('Error loading generations:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredGenerations = generations.filter((gen) =>
    gen.original_content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <div
        className="fixed left-0 top-0 bottom-0 w-2 hover:w-4 bg-gradient-to-r from-blue-500 to-transparent opacity-0 hover:opacity-100 transition-all cursor-pointer z-40"
        onMouseEnter={() => setIsOpen(true)}
      />

      <div
        className={`fixed left-0 top-0 bottom-0 w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <History className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">History</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your content..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredGenerations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 px-6">
                <History className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-center">
                  {searchQuery ? 'No matching results' : 'No generation history yet'}
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {filteredGenerations.map((gen) => (
                  <button
                    key={gen.id}
                    onClick={() => {
                      onSelectGeneration(gen)
                      setIsOpen(false)
                    }}
                    className="w-full text-left p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition group border border-gray-200 hover:border-blue-300"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-sm text-gray-900 line-clamp-2 font-medium">
                        {gen.original_content.substring(0, 100)}
                        {gen.original_content.length > 100 ? '...' : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(gen.created_at).toLocaleDateString()}
                      </div>
                      <span className="text-blue-600 font-medium">
                        {gen.generated_posts?.length || 0} posts
                      </span>
                    </div>

                    {gen.platforms && gen.platforms.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {gen.platforms.map((platform) => (
                          <span
                            key={platform}
                            className="px-2 py-0.5 bg-white border border-gray-200 rounded text-xs capitalize"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
