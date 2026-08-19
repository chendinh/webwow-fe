import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

function MarketingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-gray-950/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="text-lg font-bold">
          <span className="bg-gradient-to-r from-sky-300 to-sky-500 bg-clip-text text-transparent">
            WebWow
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden items-center gap-6 sm:flex">
          <Link
            href="/pricing"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-400 transition-colors"
          >
            Get Started
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </nav>

        {/* Mobile CTA */}
        <Link
          href="/register"
          className="flex items-center gap-1 rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-sky-400 transition-colors sm:hidden"
        >
          Get Started
        </Link>
      </div>
    </header>
  )
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <MarketingNav />
      {children}
    </div>
  )
}
