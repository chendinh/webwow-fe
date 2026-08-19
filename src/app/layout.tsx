import type { Metadata } from 'next'
import './globals.css'
import ThemeProvider from '@/context/ThemeContext'
import ThemeToggle from '@/components/common/ThemeToggle'

export const metadata: Metadata = {
  title: 'WebWow — AI IT Team that codes for you',
  description:
    'WebWow is your autonomous AI engineering team. Describe a task, approve the plan, and watch production-ready code land in a PR automatically.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[var(--color-bg)] text-[var(--color-text)]">
        <ThemeProvider>
          <ThemeToggle />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}