'use client'

import { useState } from 'react'
import { Upload, FileText, Sparkles } from 'lucide-react'
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
}

export function ContentInput({ onGenerate, loading }: ContentInputProps) {
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['twitter', 'linkedin'])
  const [tones, setTones] = useState<Record<Platform, Tone>>({
    twitter: 'casual',
    linkedin: 'professional',
    reddit: 'casual',
  })

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

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Your Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your long-form content here, or upload a file below..."
              className="w-full h-48 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none text-gray-900 placeholder-gray-400"
              disabled={loading}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="text-sm text-gray-500 font-medium">OR</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Upload File
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                accept={`${FILE_TYPES.pdf.accept},${FILE_TYPES.excel.accept},${FILE_TYPES.csv.accept}`}
                className="hidden"
                id="file-upload"
                disabled={loading}
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center gap-3 w-full px-6 py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition cursor-pointer group"
              >
                <Upload className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition" />
                <span className="text-gray-600 group-hover:text-blue-600 font-medium">
                  {file ? file.name : 'Choose PDF, Excel, or CSV file'}
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Platforms
            </label>
            <div className="flex flex-wrap gap-3">
              {PLATFORMS.map((platform) => (
                <button
                  key={platform.value}
                  onClick={() => handlePlatformToggle(platform.value)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedPlatforms.includes(platform.value)
                      ? `${platform.color} text-white`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {platform.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">
              Select Tone for Each Platform
            </label>
            {selectedPlatforms.map((platform) => {
              const platformInfo = PLATFORMS.find((p) => p.value === platform)
              return (
                <div key={platform} className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    {platformInfo?.label}
                  </label>
                  <select
                    value={tones[platform]}
                    onChange={(e) =>
                      setTones((prev) => ({ ...prev, [platform]: e.target.value as Tone }))
                    }
                    disabled={loading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white text-gray-900"
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

          <button
            onClick={handleSubmit}
            disabled={loading || (!content.trim() && !file) || selectedPlatforms.length === 0}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Viral Posts
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
