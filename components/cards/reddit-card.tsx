'use client'

import { useState } from 'react'
import { Copy, Check, MessageCircle, Share, Award, ArrowBigUp, ArrowBigDown } from 'lucide-react'
import { GeneratedPost } from '@/lib/types/database'

interface RedditCardProps {
  post: GeneratedPost
}

export function RedditCard({ post }: RedditCardProps) {
  const [headerCopied, setHeaderCopied] = useState(false)
  const [bodyCopied, setBodyCopied] = useState(false)
  const [upvoted, setUpvoted] = useState(false)
  const [downvoted, setDownvoted] = useState(false)

  const handleHeaderCopy = async () => {
    await navigator.clipboard.writeText(post.content.split('\n')[0] || post.content)
    setHeaderCopied(true)
    setTimeout(() => setHeaderCopied(false), 2000)
  }

  const handleBodyCopy = async () => {
    await navigator.clipboard.writeText(post.content)
    setBodyCopied(true)
    setTimeout(() => setBodyCopied(false), 2000)
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

  const getDummySubreddit = () => {
    const subreddits = [
      { name: 'r/IndianStockMarket', icon: '📈' },
      { name: 'r/marketing', icon: '📊' },
      { name: 'r/technology', icon: '💻' },
    ]
    return subreddits[Math.floor(Math.random() * subreddits.length)]
  }

  const subreddit = getDummySubreddit()
  const upvotes = Math.floor(Math.random() * 500) + 1
  const comments = Math.floor(Math.random() * 100) + 1
  const timeAgo = Math.floor(Math.random() * 24) + 1

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition w-full">
      <div className="flex">
        {/* Left voting section */}
        {/* <div className="flex flex-col items-center p-2 bg-gray-800">
          <button
            onClick={handleUpvote}
            className={`p-1 rounded transition ${upvoted ? 'text-orange-500' : 'text-gray-400 hover:text-orange-500'}`}
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <span className={`text-sm font-semibold ${upvoted ? 'text-orange-500' : downvoted ? 'text-blue-400' : 'text-gray-300'}`}>
            {upvotes}
          </span>
          <button
            onClick={handleDownvote}
            className={`p-1 rounded transition ${downvoted ? 'text-blue-400' : 'text-gray-400 hover:text-blue-400'}`}
          >
            <ArrowDown className="w-5 h-5" />
          </button>
        </div> */}
        
        {/* Main content section */}
        <div className="flex-1 p-4 space-y-3">
          {/* Header section with subreddit info and copy button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-orange-500 rounded flex items-center justify-center text-white text-xs">
                🏢
              </div>
              <span className="text-orange-600 text-xs sm:text-sm font-medium">{subreddit.name}</span>
              <span className="text-gray-500 text-xs sm:text-sm">•</span>
              <span className="text-gray-500 text-xs sm:text-sm">{timeAgo} hr. ago</span>
              <span className="text-gray-500 text-xs sm:text-sm">•</span>
              <div className="flex items-center gap-1">
                <span className="text-gray-500 text-xs sm:text-sm hidden sm:inline">Popular on Reddit right now</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-700 transition">
                Join
              </button>
              <button className="text-gray-500 hover:text-gray-700 transition">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Post title with copy button */}
          <div className="flex items-start justify-between">
            <h2 className="text-gray-900 text-lg font-medium leading-tight flex-1 pr-2">
              {post.content.split('\n')[0] || post.content}
            </h2>
            <button
              onClick={handleHeaderCopy}
              className="p-1.5 hover:bg-gray-100 rounded transition flex-shrink-0"
              title="Copy title"
            >
              {headerCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
            </button>
          </div>

          {/* Post body with copy button */}
          <div className="flex items-start justify-between">
            <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap flex-1 pr-2">
              {post.content.split('\n').slice(1).join('\n') || post.content}
            </div>
            <button
              onClick={handleBodyCopy}
              className="p-1.5 hover:bg-gray-100 rounded transition flex-shrink-0"
              title="Copy content"
            >
              {bodyCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
            </button>
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

          {/* Bottom action bar */}
          <div className="flex items-center gap-6 pt-2">
            <div className="flex items-center gap-1 bg-indigo-200 rounded-full py-1 px-2">
              <button className="text-gray-900 hover:text-orange-500 transition">
                <ArrowBigUp className="w-4 h-4" />
              </button>
              <span className="text-gray-900 text-sm font-medium">{upvotes}</span>
              <button className="text-gray-900 hover:text-blue-500 transition">
                <ArrowBigDown className="w-4 h-4" />
              </button>
            </div>
            <button className="flex items-center gap-1 bg-indigo-200 rounded-full py-1 px-2 text-gray-900 hover:text-gray-700 transition">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{comments}</span>
            </button>
            <button className="flex items-center gap-1 bg-indigo-200 rounded-full py-1 px-2 text-gray-900 hover:text-gray-700 transition">
              <Award className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-1 bg-indigo-200 rounded-full py-1 px-2 text-gray-900 hover:text-gray-700 transition">
              <Share className="w-4 h-4" />
              <span className="text-sm">Share</span>
            </button>
          </div>

          {/* Copy confirmations */}
          {(headerCopied || bodyCopied) && (
            <div className="text-center text-green-600 font-medium flex items-center justify-center gap-1 text-xs">
              <Check className="w-3 h-3" />
              {headerCopied ? 'Title copied!' : 'Content copied!'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
