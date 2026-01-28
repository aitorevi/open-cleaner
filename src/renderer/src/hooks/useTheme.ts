import { useState, useEffect } from 'react'

export type Theme = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

/**
 * Hook to manage theme state and sync with system preferences
 * Automatically detects system color scheme and applies appropriate theme
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')

  // Get the resolved theme based on current theme setting
  const getResolvedTheme = (currentTheme: Theme): ResolvedTheme => {
    if (currentTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return currentTheme as ResolvedTheme
  }

  // Apply theme to document
  const applyTheme = (newResolvedTheme: ResolvedTheme) => {
    const root = document.documentElement
    root.setAttribute('data-theme', newResolvedTheme)
    setResolvedTheme(newResolvedTheme)
  }

  // Handle theme changes
  useEffect(() => {
    const resolved = getResolvedTheme(theme)
    applyTheme(resolved)

    // Load saved preference from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme && savedTheme !== theme) {
      setTheme(savedTheme)
    }
  }, [theme])

  // Listen to system color scheme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const newResolvedTheme = e.matches ? 'dark' : 'light'
        applyTheme(newResolvedTheme)
      }
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [theme])

  // Update theme and save to localStorage
  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)

    const resolved = getResolvedTheme(newTheme)
    applyTheme(resolved)
  }

  return {
    theme,
    resolvedTheme,
    setTheme: updateTheme
  }
}
