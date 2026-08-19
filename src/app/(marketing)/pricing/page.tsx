import Link from 'next/link'
import { Check, Sparkles, ArrowRight } from 'lucide-react'

interface PricingTier {
  name: string
  price: string
  period?: string
  description: string
  features: string[]
  cta: string
  ctaHref: string
  highlighted?: boolean
  badge?: string
}

const tiers: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for side projects and exploration.',
    features: [
      '5 AI tasks / month',
      '1 project',
      'GitHub integration',
      'Community support',
    ],
    cta: 'Start for free',
    ctaHref: '/register',
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'Everything you need to move fast.',
    features: [
      '50 AI tasks / month',
      'Unlimited projects',
      'Priority task queue',
      'Real-time monitoring',
      'Cost comparison reports',
      'Email & chat support',
    ],
    cta: 'Start Pro trial',
    ctaHref: '/register',
    highlighted: true,
    badge: 'Recommended',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For teams that need more control and support.',
    features: [
      'Unlimited AI tasks',
      'Unlimited projects',
      'Dedicated AI agents',
      'Custom integrations',
      'SLA guarantee',
      'Dedicated support channel',
      'On-premise option',
    ],
    cta: 'Talk to us',
    ctaHref: 'mailto:hello@webwow.ai',
  },
]

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      {/* Heading */}
      <div className="mx-auto max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-sm text-sky-300">
          <Sparkles className="h-3.5 w-3.5" />
          Simple, transparent pricing
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Pay for results, not headcount
        </h1>
        <p className="mt-4 text-lg text-gray-400">
          WebWow replaces hours of developer work with minutes of AI. Pick the
          plan that fits your velocity.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="mt-16 grid gap-6 lg:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={[
              'relative flex flex-col rounded-2xl p-8 ring-1 transition-shadow',
              tier.highlighted
                ? 'bg-gradient-to-b from-sky-950/60 to-gray-900 ring-sky-500/50 shadow-[0_0_40px_rgba(14,165,233,0.15)]'
                : 'bg-gray-900 ring-white/10 hover:ring-white/20',
            ].join(' ')}
          >
            {/* Badge */}
            {tier.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-sky-500 px-3 py-1 text-xs font-semibold text-white shadow">
                  {tier.badge}
                </span>
              </div>
            )}

            {/* Tier name */}
            <h2 className="text-base font-semibold text-gray-200">
              {tier.name}
            </h2>

            {/* Price */}
            <div className="mt-4 flex items-baseline gap-1">
              <span
                className={[
                  'text-5xl font-bold tracking-tight',
                  tier.highlighted ? 'text-white' : 'text-gray-100',
                ].join(' ')}
              >
                {tier.price}
              </span>
              {tier.period && (
                <span className="text-sm text-gray-500">{tier.period}</span>
              )}
            </div>

            <p className="mt-3 text-sm text-gray-500">{tier.description}</p>

            {/* Features */}
            <ul className="mt-8 flex-1 space-y-3">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-4 w-4 flex-none text-sky-400" />
                  <span className="text-sm text-gray-300">{f}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Link
              href={tier.ctaHref}
              className={[
                'mt-8 flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-colors',
                tier.highlighted
                  ? 'bg-sky-500 text-white hover:bg-sky-400'
                  : 'bg-white/5 text-gray-200 hover:bg-white/10 ring-1 ring-white/10',
              ].join(' ')}
            >
              {tier.cta}
              {tier.highlighted && <ArrowRight className="h-4 w-4" />}
            </Link>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p className="mt-12 text-center text-sm text-gray-600">
        All plans include a 14-day free trial. No credit card required.
      </p>
    </div>
  )
}
