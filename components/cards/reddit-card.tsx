'use client'

import { useState } from 'react'
import { Copy, Check, ArrowUp, ArrowDown, MessageCircle, Share, MoreHorizontal } from 'lucide-react'
import { GeneratedPost } from '@/lib/types/database'

interface RedditCardProps {
  post: GeneratedPost
}

export function RedditCard({ post }: RedditCardProps) {
  const [copied, setCopied] = useState(false)
  const [upvoted, setUpvoted] = useState(false)
  const [downvoted, setDownvoted] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${post.content}\n\n${post.hashtags.join(' ')}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleUpvote = () => {
    if (downvoted) {
      setDownvoted(false)
    }
    setUpvoted(!upvoted)
  }

  const handleDownvote = () => {
    if (upvoted) {
      setUpvoted(false)
    }
    setDownvoted(!downvoted)
  }

  const getDummyUser = () => {
    const users = [
      { name: 'u/tech_enthusiast', avatar: 'TE' },
      { name: 'u/marketing_pro', avatar: 'MP' },
      { name: 'u/content_creator', avatar: 'CC' },
    ]
    return users[Math.floor(Math.random() * users.length)]
  }

  const dummyUser = getDummyUser()
  const upvotes = Math.floor(Math.random() * 500) + 1
  const comments = Math.floor(Math.random() * 50) + 1

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition">
      <div className="flex">
        <div className="flex flex-col items-center p-2 bg-gray-50">
          <button
            onClick={handleUpvote}
            className={`p-1 rounded transition ${upvoted ? 'text-orange-500' : 'text-gray-500 hover:text-orange-500'}`}
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <span className={`text-sm font-semibold ${upvoted ? 'text-orange-500' : downvoted ? 'text-blue-500' : 'text-gray-700'}`}>
            {upvotes}
          </span>
          <button
            onClick={handleDownvote}
            className={`p-1 rounded transition ${downvoted ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
          >
            <ArrowDown className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                {dummyUser.avatar}
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">{dummyUser.name}</h4>
                <p className="text-xs text-gray-500">r/marketing • 2h ago</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                className="p-1.5 hover:bg-gray-100 rounded transition"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded transition">
                <MoreHorizontal className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="text-gray-900 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>

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

          <div className="flex items-center gap-4 pt-2">
            <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{comments} comments</span>
            </button>
            <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition">
              <Share className="w-4 h-4" />
              <span className="text-sm">Share</span>
            </button>
            <span className="text-xs text-gray-400 ml-auto">
              {post.character_count}/40000
            </span>
          </div>

          {copied && (
            <div className="text-center text-green-600 font-medium flex items-center justify-center gap-1 text-xs">
              <Check className="w-3 h-3" />
              Copied!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
