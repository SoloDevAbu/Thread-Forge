'use client'

import { useState } from 'react'
import { Copy, Check, Heart, MessageCircle, Share, BadgeCheck, BarChart3, Bookmark } from 'lucide-react'
import { GeneratedPost } from '@/lib/types/database'

interface TwitterCardProps {
  post: GeneratedPost
}

export function TwitterCard({ post }: TwitterCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const hashtagsWithSymbol = post.hashtags.map(tag => `#${tag}`).join(' ')
    await navigator.clipboard.writeText(`${post.content}\n\n${hashtagsWithSymbol}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getDummyUser = () => {
    const users = [
      { name: 'Sarah', handle: 'sarahchen', avatar: 'SC', verified: true },
      { name: 'Alex', handle: 'alexrod', avatar: 'AR', verified: false },
      { name: 'Emma', handle: 'emmathompson', avatar: 'ET', verified: true },
    ]
    return users[Math.floor(Math.random() * users.length)]
  }

  const dummyUser = getDummyUser()

  return (
    <div className="bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
      <div className="flex">
        <div className="p-4 flex justify-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {dummyUser.avatar}
          </div>
        </div>

        <div className="pt-3 pr-6 space-y-3">
          {/* Top section with name, handle, timestamp and copy button */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <h4 className="font-bold text-gray-900 text-sm">{dummyUser.name}</h4>
                {dummyUser.verified && (
                  <BadgeCheck className="w-5 h-5 text-white fill-blue-600" />
                )}
                <p className="text-sm text-gray-500">@{dummyUser.handle}</p>
                <span className="text-sm text-gray-500">·</span>
                <p className="text-sm text-gray-500">{Math.floor(Math.random() * 24) + 1}h</p>
              </div>
              <button
                onClick={handleCopy}
                className="p-1.5 hover:bg-gray-100 rounded-full transition"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
              </button>
            </div>
            {/* Content section */}
            <div className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>

          </div>


          {/* Hashtags */}
          {post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.hashtags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-blue-500 hover:text-blue-600 cursor-pointer text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Engagement buttons */}
          <div className="flex items-center justify-between pb-4">
            <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{Math.floor(Math.random() * 100) + 1}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition">
              <Share className="w-4 h-4" />
              <span className="text-sm">{Math.floor(Math.random() * 10) + 1}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition">
              <Heart className="w-4 h-4" />
              <span className="text-sm">{Math.floor(Math.random() * 100) + 1}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm">{Math.floor(Math.random() * 10) + 1}.{Math.floor(Math.random() * 10)}K</span>
            </button>
            <div className='flex items-center gap-2'>
              <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition">
                <Bookmark className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition">
                <Share className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Copy confirmation */}
          {copied && (
            <div className="text-center text-green-600 font-medium flex items-center justify-center gap-1 text-xs pb-2">
              <Check className="w-3 h-3" />
              Copied!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
