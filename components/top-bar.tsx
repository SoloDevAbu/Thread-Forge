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

  useEffect(() => {
    // Check initial theme state
    const htmlElement = document.documentElement
    setIsDark(htmlElement.classList.contains('dark'))
  }, [])

  const toggleTheme = () => {
    const htmlElement = document.documentElement
    const newIsDark = !isDark
    setIsDark(newIsDark)
    
    if (newIsDark) {
      htmlElement.classList.add('dark')
    } else {
      htmlElement.classList.remove('dark')
    }
  }

  const getUserInitials = (user: any) => {
    if (!user) return ''
    const name = user.user_metadata?.full_name || user.email || ''
    return name.charAt(0).toUpperCase()
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-xl font-bold text-gray-900 dark:text-white">
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
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
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

            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 flex items-center justify-center transition"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
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

