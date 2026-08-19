import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WebWow — AI IT Team that codes for you',
  description:
    'WebWow is your autonomous AI engineering team. Describe a task, approve the plan, and watch production-ready code land in a PR automatically.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-gray-950">
      <body className="bg-gray-950 text-gray-100">{children}</body>
    </html>
  )
}
