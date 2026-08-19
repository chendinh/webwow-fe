'use client'

import { useEffect, useState } from 'react'
import {
  DollarSign,
  Zap,
  BarChart2,
  TrendingUp,
  Loader2,
  Building2,
} from 'lucide-react'
import { usageApi, UsageSummary } from '@/lib/api/usage.api'
import { organizationsApi, Organization } from '@/lib/api/organizations.api'
import { useOrgStore } from '@/stores/org.store'

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  loading,
}: {
  label: string
  value: string
  sub: string
  icon: React.ElementType
  accent: string
  loading: boolean
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-gray-900 p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-500">{label}</p>
          {loading ? (
            <div className="mt-2 h-7 w-24 animate-pulse rounded-md bg-white/5" />
          ) : (
            <>
              <p className="mt-1 text-2xl font-bold text-white">{value}</p>
              <p className="mt-0.5 text-xs text-gray-600">{sub}</p>
            </>
          )}
        </div>
        <div className={`rounded-lg p-2 ${accent}/10`}>
          <Icon className={`h-5 w-5 ${accent}`} />
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function UsagePage() {
  const activeOrgId = useOrgStore((s) => s.activeOrgId)
  const [current, setCurrent] = useState<UsageSummary | null>(null)
  const [history, setHistory] = useState<UsageSummary[]>([])
  const [org, setOrg] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeOrgId) {
      setLoading(false)
      return
    }
    setLoading(true)
    Promise.allSettled([
      usageApi.getCurrent(activeOrgId),
      usageApi.getHistory(activeOrgId),
      organizationsApi.getById(activeOrgId),
    ])
      .then(([currentRes, historyRes, orgRes]) => {
        if (currentRes.status === 'fulfilled') setCurrent(currentRes.value.data as UsageSummary)
        if (historyRes.status === 'fulfilled') setHistory((historyRes.value.data as UsageSummary[]) ?? [])
        if (orgRes.status === 'fulfilled') setOrg(orgRes.value.data as Organization)
      })
      .finally(() => setLoading(false))
  }, [activeOrgId])

  const stats = [
    {
      label: 'Cost this month',
      value: current ? `$${current.customerCost.toFixed(4)}` : '$0.00',
      sub: current ? `${current.totalTokens.toLocaleString()} tokens` : '0 tokens',
      icon: DollarSign,
      accent: 'text-emerald-400',
    },
    {
      label: 'AI Tasks run',
      value: current ? current.totalTasks.toString() : '0',
      sub: 'This month',
      icon: Zap,
      accent: 'text-violet-400',
    },
    {
      label: 'Tokens used',
      value: current ? current.totalTokens.toLocaleString() : '0',
      sub: 'This month',
      icon: BarChart2,
      accent: 'text-sky-400',
    },
    {
      label: 'Usage cap',
      value: org ? `$${org.usageCap.toFixed(2)}` : '—',
      sub: 'Monthly limit',
      icon: TrendingUp,
      accent: 'text-amber-400',
    },
  ]

  if (!activeOrgId) {
    return (
      <div className="space-y-6">
        <div className="flex flex-1 items-center justify-center py-20 text-sm text-gray-600">
          No organization. Please create one first.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-xl font-bold text-white">Usage & Billing</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Track your AI task spend and token consumption
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} loading={loading} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Org info */}
        <div className="rounded-xl border border-white/5 bg-gray-900">
          <div className="flex items-center gap-2 border-b border-white/5 px-5 py-4">
            <Building2 className="h-4 w-4 text-gray-600" />
            <h2 className="text-sm font-semibold text-gray-100">Organization</h2>
            {org && (
              <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 text-xs text-gray-400">
                {org.name}
              </span>
            )}
          </div>
          <div className="p-5 space-y-3">
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-gray-700" />
              </div>
            ) : (
              <>
                {[
                  ['Organization', org?.name ?? '—'],
                  ['Monthly cap', org ? `$${org.usageCap.toFixed(2)}` : '—'],
                  ['Tasks this month', current?.totalTasks ?? 0],
                  ['Cost this month', current ? `$${current.customerCost.toFixed(4)}` : '$0.00'],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-200">{String(value)}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Usage history */}
        <div className="rounded-xl border border-white/5 bg-gray-900">
          <div className="border-b border-white/5 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-100">Usage History</h2>
            <p className="text-xs text-gray-600">By month</p>
          </div>
          <div className="p-5">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-gray-700" />
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BarChart2 className="h-8 w-8 text-gray-700" />
                <p className="mt-2 text-sm text-gray-600">No usage data yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {history.map((h) => (
                  <li
                    key={`${h.year}-${h.month}`}
                    className="flex items-center justify-between py-3 text-sm"
                  >
                    <span className="text-gray-500">
                      {h.month}/{h.year}
                    </span>
                    <div className="text-right">
                      <p className="font-medium text-gray-200">
                        ${h.customerCost.toFixed(4)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {h.totalTasks} tasks · {h.totalTokens.toLocaleString()} tokens
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
