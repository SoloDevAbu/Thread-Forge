'use client'

import { useState } from 'react'
import { Copy, Check, Twitter, Linkedin } from 'lucide-react'
import { GeneratedPost } from '@/lib/types/database'
import { PLATFORMS } from '@/lib/constants'

interface PostPreviewProps {
  post: GeneratedPost
}

export function PostPreview({ post }: PostPreviewProps) {
  const [copied, setCopied] = useState(false)

  const platformInfo = PLATFORMS.find((p) => p.value === post.platform)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${post.content}\n\n${post.hashtags.join(' ')}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getPlatformIcon = () => {
    switch (post.platform) {
      case 'twitter':
        return <Twitter className="w-5 h-5" />
      case 'linkedin':
        return <Linkedin className="w-5 h-5" />
      case 'reddit':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
          </svg>
        )
      default:
        return null
    }
  }

  const getCharacterColor = () => {
    if (!platformInfo) return 'text-gray-600'
    const ratio = post.character_count / platformInfo.maxChars
    if (ratio > 0.9) return 'text-red-600'
    if (ratio > 0.75) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition">
      <div className={`${platformInfo?.color} text-white px-6 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          {getPlatformIcon()}
          <div>
            <h3 className="font-bold text-lg">{platformInfo?.label}</h3>
            <p className="text-sm opacity-90 capitalize">{post.tone} tone</p>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="p-2 hover:bg-white/20 rounded-lg transition"
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
        </button>
      </div>

      <div className="p-6 space-y-4">
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{post.content}</p>
        </div>

        {post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
            {post.hashtags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm">
          <span className={`font-medium ${getCharacterColor()}`}>
            {post.character_count} / {platformInfo?.maxChars} characters
          </span>
          {copied && (
            <span className="text-green-600 font-medium flex items-center gap-1">
              <Check className="w-4 h-4" />
              Copied!
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
