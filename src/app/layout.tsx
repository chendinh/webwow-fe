import type { Metadata } from 'next'
import './globals.css'
import React, { useState } from 'react'

export const metadata: Metadata = {
  title: 'WebWow — AI IT Team that codes for you',
  description:
    'WebWow is your autonomous AI engineering team. Describe a task, approve the plan, and watch production-ready code land in a PR automatically.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'))
  }

  return (
    <html lang="en" className={theme === 'dark' ? 'bg-gray-950' : 'bg-white'}>
      <body className={theme === 'dark' ? 'bg-gray-950 text-gray-100' : 'bg-white text-gray-900'}>
        <button onClick={toggleTheme} className="p-2 m-4 border rounded">
          Toggle Theme
        </button>
        {children}
      </body>
    </html>
  )
}