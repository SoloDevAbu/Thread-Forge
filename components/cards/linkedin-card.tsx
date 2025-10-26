'use client'

import { useState } from 'react'
import { Copy, Check, Heart, MessageCircle, Share, MoreHorizontal } from 'lucide-react'
import { GeneratedPost } from '@/lib/types/database'

interface LinkedInCardProps {
  post: GeneratedPost
}

export function LinkedInCard({ post }: LinkedInCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${post.content}\n\n${post.hashtags.join(' ')}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getDummyUser = () => {
    const users = [
      { name: 'Michael Johnson', title: 'Senior Marketing Manager', company: 'TechCorp', avatar: 'MJ' },
      { name: 'Lisa Wang', title: 'Product Director', company: 'InnovateLab', avatar: 'LW' },
      { name: 'David Chen', title: 'CEO & Founder', company: 'StartupXYZ', avatar: 'DC' },
    ]
    return users[Math.floor(Math.random() * users.length)]
  }

  const dummyUser = getDummyUser()

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white font-semibold">
              {dummyUser.avatar}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{dummyUser.name}</h4>
              <p className="text-sm text-gray-600">{dummyUser.title}</p>
              <p className="text-xs text-gray-500">{dummyUser.company}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition">
              <MoreHorizontal className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="text-gray-900 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>

        {post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.hashtags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
              <Heart className="w-5 h-5" />
              <span className="text-sm">{Math.floor(Math.random() * 100) + 1}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">{Math.floor(Math.random() * 30) + 1}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
              <Share className="w-5 h-5" />
              <span className="text-sm">{Math.floor(Math.random() * 15) + 1}</span>
            </button>
          </div>
          
          <span className="text-xs text-gray-400">
            {post.character_count}/3000
          </span>
        </div>

        {copied && (
          <div className="text-center text-green-600 font-medium flex items-center justify-center gap-1 text-sm">
            <Check className="w-4 h-4" />
            Copied to clipboard!
          </div>
        )}
      </div>
    </div>
  )
}
