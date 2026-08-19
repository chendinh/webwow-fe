'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, Plus, Loader2, ArrowRight } from 'lucide-react'
import { issuesApi, Issue } from '@/lib/api/issues.api'
import { useOrgStore } from '@/stores/org.store'
import { ProjectTabs } from '@/components/layout/project-tabs'

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Open',
  ANALYZING: 'Analyzing',
  PLAN_READY: 'Plan Ready',
  APPROVED: 'Approved',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
  REJECTED: 'Rejected',
}

const STATUS_COLOR: Record<string, string> = {
  OPEN: 'text-gray-400 bg-white/5',
  ANALYZING: 'text-sky-300 bg-sky-500/10',
  PLAN_READY: 'text-amber-300 bg-amber-500/10',
  APPROVED: 'text-emerald-300 bg-emerald-500/10',
  IN_PROGRESS: 'text-violet-300 bg-violet-500/10',
  DONE: 'text-emerald-400 bg-emerald-500/10',
  REJECTED: 'text-red-400 bg-red-500/10',
}

const PRIORITY_COLOR: Record<string, string> = {
  CRITICAL: 'bg-red-500',
  HIGH: 'bg-amber-500',
  MEDIUM: 'bg-sky-500',
  LOW: 'bg-gray-600',
}

const TYPE_LABELS: Record<string, string> = {
  BUG: 'Bug',
  FEATURE: 'Feature',
  REFACTOR: 'Refactor',
  PERFORMANCE: 'Performance',
  SECURITY: 'Security',
  DEPENDENCY: 'Dependency',
  OTHER: 'Other',
}

type FilterTab = 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'DONE'

// ─── Issue card ───────────────────────────────────────────────────────────────
function IssueCard({ issue, projectId }: { issue: Issue; projectId: string }) {
  const isActionable = issue.status === 'PLAN_READY'

  return (
    <Link href={`/projects/${projectId}/issues/${issue.id}`}>
      <div
        className={[
          'group flex items-start gap-4 rounded-xl border px-4 py-3.5 transition-all',
          isActionable
            ? 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50'
            : 'border-white/5 bg-gray-900 hover:border-white/10',
        ].join(' ')}
      >
        {/* Priority indicator bar */}
        <div
          className={`mt-1.5 h-full w-1 flex-none self-stretch rounded-full ${PRIORITY_COLOR[issue.priority] ?? 'bg-gray-700'}`}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-gray-100 group-hover:text-white transition-colors">
              {issue.title}
            </p>
            <span
              className={`flex-none rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[issue.status] ?? 'text-gray-500 bg-white/5'}`}
            >
              {STATUS_LABELS[issue.status] ?? issue.status}
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-gray-600">
            <span>{TYPE_LABELS[issue.type] ?? issue.type}</span>
            <span>·</span>
            <span>{new Date(issue.createdAt).toLocaleDateString('en-US')}</span>
            {issue.estimatedCost != null && (
              <>
                <span>·</span>
                <span className="text-gray-500">Est. ${issue.estimatedCost.toFixed(4)}</span>
              </>
            )}
          </div>
        </div>

        {/* Inline approve button for PLAN_READY */}
        {isActionable && (
          <div className="flex-none self-center" onClick={(e) => e.preventDefault()}>
            <Link
              href={`/projects/${projectId}/issues/${issue.id}`}
              className="flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-400 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Approve
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>
    </Link>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProjectIssuesPage({
  params,
}: {
  params: { projectId: string }
}) {
  const activeOrgId = useOrgStore((s) => s.activeOrgId)
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterTab>('ALL')

  useEffect(() => {
    if (!activeOrgId) {
      setLoading(false)
      return
    }
    setLoading(true)
    issuesApi
      .list(params.projectId, activeOrgId)
      .then((res) => setIssues((res.data as Issue[]) ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [activeOrgId, params.projectId])

  const filtered = issues.filter((i) => {
    if (filter === 'ALL') return true
    if (filter === 'OPEN') return ['OPEN', 'ANALYZING', 'PLAN_READY'].includes(i.status)
    if (filter === 'IN_PROGRESS') return ['APPROVED', 'IN_PROGRESS'].includes(i.status)
    if (filter === 'DONE') return ['DONE', 'REJECTED'].includes(i.status)
    return true
  })

  const filterTabs: { id: FilterTab; label: string; count: number }[] = [
    { id: 'ALL', label: 'All', count: issues.length },
    {
      id: 'OPEN',
      label: 'Open',
      count: issues.filter((i) => ['OPEN', 'ANALYZING', 'PLAN_READY'].includes(i.status)).length,
    },
    {
      id: 'IN_PROGRESS',
      label: 'In Progress',
      count: issues.filter((i) => ['APPROVED', 'IN_PROGRESS'].includes(i.status)).length,
    },
    {
      id: 'DONE',
      label: 'Done',
      count: issues.filter((i) => ['DONE', 'REJECTED'].includes(i.status)).length,
    },
  ]

  return (
    <div className="space-y-0">
      <ProjectTabs projectId={params.projectId} activeTab="issues" />

      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">Issues</h1>
            <p className="text-sm text-gray-500">Track bugs, features, and improvements</p>
          </div>
          <Link
            href={`/projects/${params.projectId}/issues/new`}
            className="flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-400 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Issue
          </Link>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={[
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                filter === tab.id
                  ? 'bg-sky-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200',
              ].join(' ')}
            >
              {tab.label}
              <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Issue list */}
        {!activeOrgId ? (
          <div className="rounded-xl border border-white/5 bg-gray-900 p-8 text-center text-sm text-gray-600">
            No organization found.
          </div>
        ) : loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-gray-700" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-16 text-center">
            <AlertCircle className="h-10 w-10 text-gray-700" />
            <h3 className="mt-3 text-sm font-medium text-gray-400">No issues found</h3>
            <p className="mt-1 text-xs text-gray-600">Create one to get started.</p>
            <Link
              href={`/projects/${params.projectId}/issues/new`}
              className="mt-4 flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-gray-400 hover:border-white/20 hover:text-white transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Create issue
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((issue) => (
              <IssueCard key={issue.id} issue={issue} projectId={params.projectId} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
