import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from './theme-provider'

export const metadata: Metadata = {
  title: 'WebWow — AI IT Team that codes for you',
  description:
    'WebWow is your autonomous AI engineering team. Describe a task, approve the plan, and watch production-ready code land in a PR automatically.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
