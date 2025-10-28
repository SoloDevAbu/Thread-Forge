'use client'

import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import { Upload, Sparkles, ChevronDown, X } from 'lucide-react'
import { PLATFORMS, TONES, FILE_TYPES } from '@/lib/constants'
import { Platform, Tone } from '@/lib/types/database'

interface ContentInputProps {
  onGenerate: (data: {
    content: string
    file?: File
    platforms: Platform[]
    tones: Record<Platform, Tone>
  }) => void
  loading: boolean
  user?: any
}

export interface ContentInputRef {
  clearInput: () => void
}

export const ContentInput = forwardRef<ContentInputRef, ContentInputProps>(({ onGenerate, loading, user }, ref) => {
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['twitter', 'linkedin'])
  const [tones, setTones] = useState<Record<Platform, Tone>>({
    twitter: 'casual',
    linkedin: 'professional',
    reddit: 'casual',
  })
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false)
  const [showToneSelectors, setShowToneSelectors] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setContent(`File uploaded: ${selectedFile.name}`)
    }
  }

  const handlePlatformToggle = (platform: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    )
  }

  const clearInput = () => {
    setContent('')
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = () => {
    if ((!content.trim() && !file) || selectedPlatforms.length === 0) {
      return
    }

    const selectedTones = selectedPlatforms.reduce((acc, platform) => {
      acc[platform] = tones[platform]
      return acc
    }, {} as Record<Platform, Tone>)

    onGenerate({
      content,
      file: file || undefined,
      platforms: selectedPlatforms,
      tones: selectedTones,
    })
  }

  useImperativeHandle(ref, () => ({
    clearInput
  }))

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative">
        <div className="bg-gray-50 rounded-2xl border border-gray-300 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all duration-300">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe your content or paste it here..."
            className="w-full h-48 px-6 py-4 bg-transparent text-gray-900 placeholder-gray-500 outline-none resize-none rounded-t-2xl"
            disabled={loading}
          />

          {file && (
            <div className="px-6 pb-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm">
                <span className="font-medium">{file.name}</span>
                <button
                  onClick={() => {
                    setFile(null)
                    setContent('')
                  }}
                  className="hover:text-blue-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-300 bg-gray-100 rounded-b-2xl">
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept={`${FILE_TYPES.pdf.accept},`}
                className="hidden"
                disabled={loading}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-gray-200 rounded-lg transition"
                disabled={loading}
                title="Upload file"
              >
                <Upload className="w-5 h-5 text-gray-600" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowToneSelectors(!showToneSelectors)}
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition"
                  disabled={loading}
                >
                  Tone
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowPlatformDropdown(!showPlatformDropdown)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition"
                  disabled={loading}
                >
                  <span>Platforms ({selectedPlatforms.length})</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showPlatformDropdown && (
                  <div className="absolute right-0 bottom-full mb-2 w-64 bg-white border border-gray-200 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-3 z-10">
                    <div className="space-y-2">
                      {PLATFORMS.map((platform) => (
                        <label
                          key={platform.value}
                          className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPlatforms.includes(platform.value)}
                            onChange={() => handlePlatformToggle(platform.value)}
                            className="w-4 h-4 rounded accent-blue-600"
                            disabled={loading}
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {platform.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || (!content.trim() && !file) || selectedPlatforms.length === 0}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>

          {showToneSelectors && selectedPlatforms.length > 0 && (
            <div className="px-6 pb-4 space-y-3 border-t border-gray-300 pt-4 bg-gray-100">
              {selectedPlatforms.map((platform) => {
                const platformInfo = PLATFORMS.find((p) => p.value === platform)
                return (
                  <div key={platform} className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700 w-24">
                      {platformInfo?.label}
                    </label>
                    <select
                      value={tones[platform]}
                      onChange={(e) =>
                        setTones((prev) => ({ ...prev, [platform]: e.target.value as Tone }))
                      }
                      disabled={loading}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white text-gray-900 text-sm"
                    >
                      {TONES.map((tone) => (
                        <option key={tone.value} value={tone.value}>
                          {tone.label} - {tone.description}
                        </option>
                      ))}
                    </select>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})
