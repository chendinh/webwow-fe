'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Loader2,
  ShieldCheck,
  Zap,
  BarChart2,
  Brain,
  XCircle,
} from 'lucide-react'
import {
  systemHealthApi,
  SystemIssue,
  FailurePattern,
  IssueStats,
} from '@/lib/api/system-health.api'
import { useOrgStore } from '@/stores/org.store'
import { cn } from '@/lib/utils/cn'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `${mins} phút trước`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} giờ trước`
  return `${Math.floor(hours / 24)} ngày trước`
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

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

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: 'open' | 'resolved' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        status === 'resolved'
          ? 'bg-emerald-500/10 text-emerald-400'
          : 'bg-red-500/10 text-red-400',
      )}
    >
      {status === 'resolved' ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : (
        <XCircle className="h-3 w-3" />
      )}
      {status === 'resolved' ? 'Đã giải quyết' : 'Đang mở'}
    </span>
  )
}

// ─── Resolve Modal ────────────────────────────────────────────────────────────

function ResolveModal({
  issue,
  onClose,
  onResolved,
}: {
  issue: SystemIssue
  onClose: () => void
  onResolved: () => void
}) {
  const [solution, setSolution] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!solution.trim()) return
    setLoading(true)
    setError(null)
    try {
      await systemHealthApi.resolveIssue(issue.id, solution)
      onResolved()
      onClose()
    } catch {
      setError('Không thể đánh dấu sự cố. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-gray-900 p-6 shadow-2xl">
        <h3 className="mb-1 text-base font-semibold text-white">Đánh dấu đã giải quyết</h3>
        <p className="mb-4 text-xs text-gray-500">
          Nhập giải pháp để lưu vào kho mẫu sửa lỗi AI.
        </p>
        <div className="mb-3 rounded-lg bg-white/5 px-3 py-2 text-xs text-gray-400">
          <span className="font-medium text-gray-300">{issue.errorType}</span>
          {issue.framework && (
            <span className="ml-2 text-gray-600">· {issue.framework}</span>
          )}
        </div>
        <form onSubmit={(e) => { void handleSubmit(e) }}>
          <textarea
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="Mô tả giải pháp đã áp dụng..."
            rows={4}
            className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/20"
          />
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
          <div className="mt-4 flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !solution.trim()}
              className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Lưu giải pháp
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SystemPage() {
  const activeOrgId = useOrgStore((s) => s.activeOrgId)

  const [issues, setIssues] = useState<SystemIssue[]>([])
  const [patterns, setPatterns] = useState<FailurePattern[]>([])
  const [stats, setStats] = useState<IssueStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved'>('all')
  const [resolveTarget, setResolveTarget] = useState<SystemIssue | null>(null)

  const fetchData = useCallback(() => {
    if (!activeOrgId) {
      setLoading(false)
      return
    }
    setLoading(true)
    Promise.allSettled([
      systemHealthApi.getIssues(
        activeOrgId,
        statusFilter !== 'all' ? { status: statusFilter } : undefined,
      ),
      systemHealthApi.getStats(activeOrgId),
      systemHealthApi.getPatterns(),
    ])
      .then(([issuesRes, statsRes, patternsRes]) => {
        if (issuesRes.status === 'fulfilled') setIssues(issuesRes.value.data as SystemIssue[])
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data as IssueStats)
        if (patternsRes.status === 'fulfilled') setPatterns(patternsRes.value.data as FailurePattern[])
      })
      .finally(() => setLoading(false))
  }, [activeOrgId, statusFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (!activeOrgId) {
    return (
      <div className="flex flex-1 items-center justify-center py-20 text-sm text-gray-600">
        Chưa có tổ chức. Vui lòng tạo tổ chức trước.
      </div>
    )
  }

  const statCards = [
    {
      label: 'Tổng sự cố',
      value: stats ? String(stats.totalIssues) : '0',
      sub: 'Tất cả thời gian',
      icon: AlertTriangle,
      accent: 'text-red-400',
    },
    {
      label: 'Tuần này',
      value: stats ? String(stats.totalThisWeek) : '0',
      sub: 'Sự cố mới trong 7 ngày',
      icon: Clock,
      accent: 'text-amber-400',
    },
    {
      label: 'Tỷ lệ giải quyết',
      value: stats ? `${Math.round(stats.resolutionRate * 100)}%` : '0%',
      sub: `${stats?.resolvedIssues ?? 0} / ${stats?.totalIssues ?? 0} đã giải quyết`,
      icon: ShieldCheck,
      accent: 'text-emerald-400',
    },
    {
      label: 'Mẫu đã học',
      value: String(patterns.length),
      sub: stats?.mostCommonErrorType ? `Phổ biến: ${stats.mostCommonErrorType}` : 'Chưa có mẫu',
      icon: Brain,
      accent: 'text-violet-400',
    },
  ]

  return (
    <>
      {resolveTarget && (
        <ResolveModal
          issue={resolveTarget}
          onClose={() => setResolveTarget(null)}
          onResolved={fetchData}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Hệ thống & Tự học</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Theo dõi lỗi nền tảng, tỷ lệ giải quyết và mẫu sửa lỗi AI đã học
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            Làm mới
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((s) => (
            <StatCard key={s.label} {...s} loading={loading} />
          ))}
        </div>

        {/* Issues table + Top errors */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Issues list — takes 2/3 */}
          <div className="xl:col-span-2 rounded-xl border border-white/5 bg-gray-900">
            <div className="flex flex-wrap items-center gap-3 border-b border-white/5 px-5 py-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-gray-600" />
                <h2 className="text-sm font-semibold text-gray-100">Sự cố hệ thống</h2>
              </div>
              <div className="ml-auto flex gap-1">
                {(['all', 'open', 'resolved'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                      statusFilter === f
                        ? 'bg-sky-500/10 text-sky-400'
                        : 'text-gray-500 hover:bg-white/5 hover:text-gray-300',
                    )}
                  >
                    {f === 'all' ? 'Tất cả' : f === 'open' ? 'Đang mở' : 'Đã giải quyết'}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-gray-700" />
              </div>
            ) : issues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="h-8 w-8 text-gray-700" />
                <p className="mt-2 text-sm text-gray-600">Không có sự cố nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-xs text-gray-600">
                      <th className="px-5 py-3 text-left font-medium">Loại lỗi</th>
                      <th className="px-5 py-3 text-left font-medium">Framework</th>
                      <th className="px-5 py-3 text-right font-medium">Lần xảy ra</th>
                      <th className="px-5 py-3 text-left font-medium">Lần cuối</th>
                      <th className="px-5 py-3 text-left font-medium">Trạng thái</th>
                      <th className="px-5 py-3 text-right font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {issues.map((issue) => (
                      <tr key={issue.id} className="group hover:bg-white/[0.02]">
                        <td className="px-5 py-3">
                          <p className="font-medium text-gray-200 truncate max-w-[180px]">
                            {issue.errorType}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-600 truncate max-w-[180px]">
                            {issue.errorMessage.slice(0, 60)}
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          {issue.framework ? (
                            <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-xs text-sky-400">
                              {issue.framework}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-700">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="text-gray-300 font-medium">{issue.occurrences}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-xs text-gray-500">{timeAgo(issue.lastSeen)}</span>
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge status={issue.status} />
                        </td>
                        <td className="px-5 py-3 text-right">
                          {issue.status === 'open' && (
                            <button
                              onClick={() => setResolveTarget(issue)}
                              className="rounded-md bg-sky-500/10 px-2.5 py-1 text-xs text-sky-400 hover:bg-sky-500/20 transition-colors"
                            >
                              Giải quyết
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right column: top error types + avg fix */}
          <div className="space-y-6">
            {/* Top errors */}
            <div className="rounded-xl border border-white/5 bg-gray-900">
              <div className="flex items-center gap-2 border-b border-white/5 px-5 py-4">
                <BarChart2 className="h-4 w-4 text-gray-600" />
                <h2 className="text-sm font-semibold text-gray-100">Lỗi phổ biến nhất</h2>
              </div>
              <div className="p-5 space-y-3">
                {loading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-700" />
                  </div>
                ) : (stats?.byErrorType.length ?? 0) === 0 ? (
                  <p className="text-xs text-gray-600 text-center py-4">Chưa có dữ liệu</p>
                ) : (
                  stats?.byErrorType.map(({ errorType, count }, i) => {
                    const max = stats.byErrorType[0]?.count ?? 1
                    const pct = Math.round((count / max) * 100)
                    return (
                      <div key={errorType}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400 truncate max-w-[140px]">{errorType}</span>
                          <span className="text-xs font-medium text-gray-300">{count}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              i === 0 ? 'bg-red-500' : i === 1 ? 'bg-amber-500' : 'bg-sky-500',
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Quick stats */}
            <div className="rounded-xl border border-white/5 bg-gray-900">
              <div className="flex items-center gap-2 border-b border-white/5 px-5 py-4">
                <Zap className="h-4 w-4 text-gray-600" />
                <h2 className="text-sm font-semibold text-gray-100">Thống kê nhanh</h2>
              </div>
              <div className="p-5 space-y-3">
                {[
                  ['Đang mở', stats?.openIssues ?? 0],
                  ['Đã giải quyết', stats?.resolvedIssues ?? 0],
                  ['Trung bình số lần sửa', stats?.avgFixAttempts ?? 0],
                  ['Frameworks bị ảnh hưởng', stats?.byFramework.length ?? 0],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{label as string}</span>
                    <span className="font-medium text-gray-200">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Learned patterns */}
        <div className="rounded-xl border border-white/5 bg-gray-900">
          <div className="flex items-center gap-2 border-b border-white/5 px-5 py-4">
            <Brain className="h-4 w-4 text-violet-400" />
            <h2 className="text-sm font-semibold text-gray-100">Mẫu sửa lỗi AI đã học</h2>
            <span className="ml-auto rounded-full bg-violet-500/10 px-2 py-0.5 text-xs text-violet-400">
              {patterns.length} mẫu
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-gray-700" />
            </div>
          ) : patterns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Brain className="h-8 w-8 text-gray-700" />
              <p className="mt-2 text-sm text-gray-600">Chưa có mẫu nào được học</p>
              <p className="mt-1 text-xs text-gray-700">
                Khi bạn giải quyết sự cố và nhập giải pháp, AI sẽ học từ đó.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {patterns.map((pattern) => (
                <div key={pattern.id} className="px-5 py-4 hover:bg-white/[0.02]">
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-200">
                          {pattern.errorType}
                        </span>
                        {pattern.framework && (
                          <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-xs text-violet-400">
                            {pattern.framework}
                          </span>
                        )}
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
                          {Math.round(pattern.successRate * 100)}% thành công
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
                        {pattern.solution}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-gray-600">
                        {pattern.occurrences} lần áp dụng
                      </p>
                      <p className="mt-0.5 text-xs text-gray-700">
                        {formatDate(pattern.lastApplied)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
