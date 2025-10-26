'use client'

import { useState } from 'react'
import { Copy, Check, ThumbsUp, MessageCircle, Share, Send, MoreHorizontal, Earth, ShieldCheck } from 'lucide-react'
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
      { 
        name: 'John', 
        title: "social media manager & video editor", 
        avatar: 'PA',
        verified: true,
        connection: '1st',
        timeAgo: '1yr'
      },
      { 
        name: 'Michael Johnson', 
        title: 'Senior Marketing Manager at TechCorp', 
        avatar: 'MJ',
        verified: false,
        connection: '2nd',
        timeAgo: '2mo'
      },
      { 
        name: 'Lisa Wang', 
        title: 'Product Director at InnovateLab', 
        avatar: 'LW',
        verified: true,
        connection: '1st',
        timeAgo: '3mo'
      },
    ]
    return users[Math.floor(Math.random() * users.length)]
  }

  const dummyUser = getDummyUser()

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition">
      <div className="p-4 space-y-3">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white font-semibold">
              {dummyUser.avatar}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <h4 className="font-semibold text-gray-900 text-sm">{dummyUser.name}</h4>
                {dummyUser.verified && (
                  <ShieldCheck
                    className="w-4 h-4 text-gray-600"
                  />
                )}
                <span className="text-gray-500 text-sm">• {dummyUser.connection}</span>
              </div>
              <p className="text-xs text-gray-600">{dummyUser.title}</p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>{dummyUser.timeAgo}</span>
                <span>•</span>
                <Earth className="w-3 h-3" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="p-1.5 hover:bg-gray-100 rounded-full transition"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>

        {/* Hashtags */}
        {post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.hashtags.map((tag, idx) => (
              <span
                key={idx}
                className="text-blue-600 hover:text-blue-800 cursor-pointer text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Engagement Summary */}
        <div className="flex items-center justify-between text-xs text-gray-500 border-b border-gray-200 pb-2">
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <ThumbsUp className="w-2 h-2 text-white" />
              </div>
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            </div>
            <span>{Math.floor(Math.random() * 10) + 1}</span>
          </div>
          <span>{Math.floor(Math.random() * 5) + 1} comment</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition py-2 px-3 rounded-md hover:bg-gray-50">
            <ThumbsUp className="w-4 h-4" />
            <span className="text-sm font-medium">Like</span>
          </button>
          <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition py-2 px-3 rounded-md hover:bg-gray-50">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Comment</span>
          </button>
          <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition py-2 px-3 rounded-md hover:bg-gray-50">
            <Share className="w-4 h-4" />
            <span className="text-sm font-medium">Repost</span>
          </button>
          <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition py-2 px-3 rounded-md hover:bg-gray-50">
            <Send className="w-4 h-4" />
            <span className="text-sm font-medium">Send</span>
          </button>
        </div>

        {/* Copy confirmation */}
        {copied && (
          <div className="text-center text-green-600 font-medium flex items-center justify-center gap-1 text-xs">
            <Check className="w-3 h-3" />
            Copied to clipboard!
          </div>
        )}
      </div>
    </div>
  )
}
