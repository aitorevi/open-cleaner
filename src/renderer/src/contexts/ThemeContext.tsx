import React, { createContext, useContext } from 'react'
import { useTheme, Theme, ResolvedTheme } from '../hooks/useTheme'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

interface ThemeProviderProps {
  children: React.ReactNode
}

/**
 * Theme Provider Component
 * Wraps the app and provides theme context to all children
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const themeState = useTheme()

  return <ThemeContext.Provider value={themeState}>{children}</ThemeContext.Provider>
}

/**
 * Hook to access theme context
 * Must be used within ThemeProvider
 */
export function useThemeContext() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider')
  }
  return context
}
