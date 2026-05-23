import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import config from '../config.js'

const Ctx = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => config.color || 'slate')
  const [mode, setModeState] = useState(() => config.defaultMode || 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode)
  }, [mode])

  const setTheme = useCallback((t) => setThemeState(t), [])
  const toggleMode = useCallback(() => setModeState((m) => (m === 'light' ? 'dark' : 'light')), [])
  const setMode = useCallback((m) => setModeState(m), [])

  return (
    <Ctx.Provider value={{ theme, setTheme, mode, toggleMode, setMode }}>
      {children}
    </Ctx.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider')
  return ctx
}
