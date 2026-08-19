'use client'
import { useState, useEffect } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    document.documentElement.className = isDarkMode ? 'bg-gray-950' : 'bg-white'
  }, [isDarkMode])

  const toggleTheme = () => setIsDarkMode((prev) => !prev)

  return (
    <div className={isDarkMode ? 'bg-gray-950 text-gray-100 min-h-screen' : 'bg-white text-gray-900 min-h-screen'}>
      <button onClick={toggleTheme} className="p-2 m-4 border rounded">
        Toggle {isDarkMode ? 'Light' : 'Dark'} Mode
      </button>
      {children}
    </div>
  )
}
