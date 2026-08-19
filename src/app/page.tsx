/**
 * Landing page — public marketing page for WebWow.
 *
 * Route: /
 *
 * Layout inspired by the commit-ts template (dark bg-gray-950 sidebar +
 * dotted timeline on the right + StarField constellation animation).
 *
 * i18n: Content is in English only for now.
 * TODO: Add i18n support (next-intl or similar) to support multiple languages.
 */

import { useId } from 'react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { StarField } from '@/components/marketing/StarField'
import { Glow } from '@/components/marketing/Glow'
import { EmailSignupForm } from '@/components/marketing/EmailSignupForm'
import { TokenLoginForm } from '@/components/marketing/TokenLoginForm'
import { SparkleIcon } from '@/components/marketing/SparkleIcon'
import { Github, Twitter, BookOpen, ArrowRight } from 'lucide-react'

// ─── Auth guard (server-side) ────────────────────────────────────────────────
// If the user already has a persisted auth token in the cookie/storage,
// send them directly to /dashboard.  We do a lightweight check here;
// the (app) layout handles the full AuthGuard.
function isAuthenticated(): boolean {
  try {
    const store = cookies().get('auth-storage')
    if (!store?.value) return false
    const parsed = JSON.parse(decodeURIComponent(store.value))
    return !!parsed?.state?.accessToken
  } catch {
    return false
  }
}

// ─── Timeline dotted line decoration ────────────────────────────────────────
function TimelineDots() {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- this is a plain function component
  const id = useId()
  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden lg:right-[calc(max(2rem,50%-38rem)+40rem)] lg:min-w-[400px] lg:overflow-visible">
      <svg
        className="absolute top-0 left-[max(0px,calc(50%-18.125rem))] h-full w-1.5 lg:left-full lg:ml-1 xl:left-auto xl:right-1 xl:ml-0"
        aria-hidden="true"
      >
        <defs>
          <pattern id={id} width="6" height="8" patternUnits="userSpaceOnUse">
            <path d="M0 0H6M0 8H6" className="stroke-white/10" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
    </div>
  )
}

// ─── Feature release-note card ────────────────────────────────────────────────
interface FeatureCardProps {
  date: string
  title: string
  description: string
  improvements: string[]
  placeholderGradient: string
}

function FeatureCard({
  date,
  title,
  description,
  improvements,
  placeholderGradient,
}: FeatureCardProps) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <article className="scroll-mt-16">
      {/* Image placeholder — simulates a product screenshot */}
      <div
        className={`aspect-[3/2] w-full max-w-2xl rounded-2xl ${placeholderGradient} ring-1 ring-white/10`}
        aria-hidden="true"
      >
        <div className="flex h-full items-center justify-center">
          <div className="h-16 w-16 rounded-full bg-white/5 ring-1 ring-white/10" />
        </div>
      </div>

      {/* Heading row */}
      <div className="mt-8 flex flex-wrap items-baseline justify-between gap-x-6">
        <h2 className="text-lg font-semibold tracking-tight text-white">
          {title}
        </h2>
        <time
          dateTime={date}
          className="font-mono text-sm text-gray-500"
        >
          {formattedDate}
        </time>
      </div>

      <p className="mt-3 text-sm/6 text-gray-400">{description}</p>

      <h3 className="mt-6 flex items-center gap-2 text-sm font-medium text-white">
        <SparkleIcon />
        Improvements
      </h3>
      <ul className="mt-3 space-y-2">
        {improvements.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-gray-400">
            <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-sky-400" />
            {item}
          </li>
        ))}
      </ul>
    </article>
  )
}

// ─── Feature data ─────────────────────────────────────────────────────────────
const features: FeatureCardProps[] = [
  {
    date: '2024-06-01',
    title: 'AI Code Generation',
    description:
      'WebWow AI analyzes your codebase, understands the context, and writes production-ready code changes — complete with tests and documentation.',
    improvements: [
      'Auto branch creation from issue context',
      'Automatic PR generation with description',
      'Build verification before commit',
    ],
    placeholderGradient:
      'bg-gradient-to-br from-sky-950/80 via-gray-900 to-gray-900',
  },
  {
    date: '2024-05-15',
    title: 'Pre-flight Build Check',
    description:
      'Before writing a single line of code, WebWow runs a full build check on your repository to detect existing issues.',
    improvements: [
      'Minor errors auto-fixed silently',
      'Major issues surfaced for user approval',
      'Compatible with all major CI/CD setups',
    ],
    placeholderGradient:
      'bg-gradient-to-br from-emerald-950/80 via-gray-900 to-gray-900',
  },
  {
    date: '2024-05-01',
    title: 'Real-time Task Monitoring',
    description:
      'Watch your AI team work in real-time with live status updates across 14 task states.',
    improvements: [
      'Live polling with WebSocket fallback',
      'Activity logs with token cost per step',
      'Developer comparison table',
    ],
    placeholderGradient:
      'bg-gradient-to-br from-violet-950/80 via-gray-900 to-gray-900',
  },
  {
    date: '2024-04-10',
    title: 'Developer Cost Comparison',
    description:
      'See exactly how much you save vs hiring a Junior, Middle, or Senior developer for every task.',
    improvements: [
      'Token usage tracking per task',
      'Actual vs estimated cost comparison',
      'Monthly spend breakdown by project',
    ],
    placeholderGradient:
      'bg-gradient-to-br from-amber-950/80 via-gray-900 to-gray-900',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  if (isAuthenticated()) {
    redirect('/dashboard')
  }

  return (
    <div className="relative min-h-screen bg-gray-950 text-gray-100">
      {/* ── Fixed left sidebar ── */}
      <div className="relative flex-none overflow-hidden px-6 lg:pointer-events-none lg:fixed lg:inset-0 lg:z-40 lg:flex lg:px-0">
        {/* Glow + background */}
        <Glow />

        {/* Sidebar inner content */}
        <div className="relative flex w-full lg:pointer-events-auto lg:mr-[calc(max(2rem,50%-38rem)+40rem)] lg:min-w-[400px] lg:overflow-x-hidden lg:overflow-y-auto lg:pl-[max(4rem,calc(50%-38rem))]">
          <div className="mx-auto max-w-lg lg:mx-0 lg:flex lg:w-96 lg:max-w-none lg:flex-col lg:before:flex-1 lg:before:pt-6">
            <div className="pt-20 pb-16 sm:pt-32 sm:pb-20 lg:py-20">
              <div className="relative">
                {/* StarField constellation */}
                <StarField className="top-14 -right-44" />

                {/* Logo */}
                <Link href="/" className="inline-block">
                  <span className="text-2xl font-bold tracking-tight">
                    <span className="bg-gradient-to-r from-sky-300 to-sky-500 bg-clip-text text-transparent">
                      WebWow
                    </span>
                  </span>
                </Link>

                {/* Tagline */}
                <h1 className="mt-14 text-4xl font-bold leading-tight tracking-tight text-white lg:text-5xl">
                  AI IT Team that codes for you{' '}
                  <span className="text-sky-300">so you ship faster</span>
                </h1>

                {/* Description */}
                <p className="mt-4 text-sm/6 text-gray-400">
                  WebWow is your autonomous AI engineering team. Describe a task,
                  approve the plan, and watch production-ready code land in a PR —
                  automatically.
                </p>

                {/* Email signup */}
                <EmailSignupForm />

                {/* Token login */}
                <div className="mt-6 border-t border-white/10 pt-6">
                  <TokenLoginForm />
                </div>

                {/* Social links */}
                <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
                  <a
                    href="https://github.com/webwow-ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-sky-300 transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                  <a
                    href="https://x.com/webwow_ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-sky-300 transition-colors"
                  >
                    <Twitter className="h-4 w-4" />
                    Twitter / X
                  </a>
                  <a
                    href="/docs"
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-sky-300 transition-colors"
                  >
                    <BookOpen className="h-4 w-4" />
                    Docs
                  </a>
                </div>

                {/* Auth links */}
                <div className="mt-6 flex items-center gap-4">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-1 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-400 transition-colors"
                  >
                    Dashboard
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-1 items-end justify-center pb-4 lg:justify-start lg:pb-6">
              <p className="text-xs/5 text-gray-600">
                Built with ❤️ by WebWow Team
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right content: feature timeline ── */}
      <div className="relative flex-auto">
        {/* Dotted timeline line */}
        <TimelineDots />

        <main className="space-y-20 py-20 sm:space-y-32 sm:py-32 lg:ml-[calc(max(2rem,50%-38rem)+40rem)] lg:pl-16 lg:pr-8">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </main>
      </div>
    </div>
  )
}
