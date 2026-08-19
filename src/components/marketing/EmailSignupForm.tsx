'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

export function EmailSignupForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    // Simulate async signup — replace with real API call
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="mt-8 flex items-center gap-3 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-300">
        <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-sky-400" />
        <span>You&rsquo;re on the list! We&rsquo;ll be in touch soon.</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8">
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          aria-label="Email address"
          className="
            flex-1 min-w-0 rounded-lg border border-white/10 bg-white/5
            px-4 py-2.5 text-sm text-gray-100 placeholder:text-gray-500
            focus:border-sky-500/60 focus:outline-none focus:ring-1 focus:ring-sky-500/60
            transition
          "
        />
        <button
          type="submit"
          disabled={loading}
          aria-label="Get early access"
          className="
            group relative isolate flex-none rounded-lg bg-sky-500 px-4 py-2.5
            text-sm font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,.4)]
            hover:bg-sky-400 active:bg-sky-600 disabled:opacity-60
            transition-colors
          "
        >
          {loading ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <span className="flex items-center gap-1">
              Get early access
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          )}
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-600">No spam. Unsubscribe anytime.</p>
    </form>
  )
}
