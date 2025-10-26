'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { AuthDialog } from './auth-dialog'

interface TopBarProps {
  user: any
  onAuthSuccess: () => void
}

export function TopBar({ user, onAuthSuccess }: TopBarProps) {
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [isDark, setIsDark] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    // Check initial theme state
    const htmlElement = document.documentElement
    setIsDark(htmlElement.classList.contains('dark'))

    // Handle scroll detection
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const getUserInitials = (user: any) => {
    if (!user) return ''
    const name = user.user_metadata?.full_name || user.email || ''
    return name.charAt(0).toUpperCase()
  }

  return (
    <>
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-blue-50/80 backdrop-blur-sm border-b border-blue-100 shadow-sm hover:bg-blue-50/60 my-2 mx-4 rounded-3xl' 
          : 'bg-blue-50/0 border-b border-transparent'
      }`}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-xl font-bold text-gray-800">
            ThreadForge
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-semibold shadow-lg">
                {getUserInitials(user)}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAuthDialog(true)}
                  className="px-4 py-2 text-sm font-medium text-gray-800 hover:text-gray-900 transition"
                >
                  Log In
                </button>
                <button
                  onClick={() => setShowAuthDialog(true)}
                  className="px-4 py-2 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg hover:shadow-lg transition"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        onSuccess={() => {
          setShowAuthDialog(false)
          onAuthSuccess()
        }}
      />
    </>
  )
}

