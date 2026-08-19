'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FolderGit2,
  Bot,
  AlertCircle,
  Activity,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react'
import { projectsApi } from '@/lib/api/projects.api'
import { aiTasksApi, AITask } from '@/lib/api/ai-tasks.api'
import { issuesApi, Issue } from '@/lib/api/issues.api'
import { activityApi, ActivityLogEntry } from '@/lib/api/activity.api'
import { useOrgStore } from '@/stores/org.store'

// ─── Status helpers ───────────────────────────────────────────────────────────
const ACTIVE_TASK_STATUSES = [
  'QUEUED',
  'PREPARING',
  'CODING',
  'TESTING',
  'FIXING',
  'REVIEWING',
  'CREATING_PR',
]

const RUNNING_STATUSES = ['CODING', 'TESTING', 'FIXING', 'REVIEWING', 'CREATING_PR']

const TASK_STATUS_LABELS: Record<string, string> = {
  QUEUED: 'Queued',
  PREPARING: 'Preparing',
  CODING: 'Coding',
  TESTING: 'Testing',
  FIXING: 'Fixing',
  REVIEWING: 'Reviewing',
  CREATING_PR: 'Creating PR',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
}

function statusDot(status: string) {
  if (RUNNING_STATUSES.includes(status)) return 'bg-sky-400 animate-pulse'
  if (status === 'COMPLETED') return 'bg-emerald-400'
  if (status === 'FAILED') return 'bg-red-400'
  if (status === 'QUEUED' || status === 'PREPARING') return 'bg-amber-400'
  return 'bg-gray-600'
}

// ─── Stat card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: string | number
  icon: React.ElementType
  color: string
  loading: boolean
  pulse?: boolean
}

function StatCard({ label, value, icon: Icon, color, loading, pulse }: StatCardProps) {
  return (
    <div className="rounded-xl border border-white/5 bg-gray-900 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>
          {loading ? (
            <div className="mt-2 h-7 w-16 animate-pulse rounded-md bg-white/5" />
          ) : (
            <div className="mt-1 flex items-center gap-2">
              <p className="text-3xl font-bold text-white">{value}</p>
              {pulse && Number(value) > 0 && (
                <span className="inline-flex h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
              )}
            </div>
          )}
        </div>
        <div className={`rounded-lg p-2 ${color} bg-opacity-10`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </div>
    </div>
  )
}

// ─── Issue approve row ────────────────────────────────────────────────────────
function PlanReadyRow({ issue }: { issue: Issue }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-sky-500/20 bg-sky-500/5 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-100">{issue.title}</p>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
          <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-sky-300">
            PLAN READY
          </span>
          {issue.estimatedCost != null && (
            <span>Est. ${issue.estimatedCost.toFixed(4)}</span>
          )}
        </div>
      </div>
      <Link
        href={`/projects/${issue.projectId}/issues/${issue.id}`}
        className="flex flex-none items-center gap-1 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-400 transition-colors"
      >
        Approve
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  )
}

// ─── Running task row ─────────────────────────────────────────────────────────
function RunningTaskRow({ task }: { task: AITask }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
      <span className={`h-2 w-2 flex-none rounded-full ${statusDot(task.status)}`} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-gray-200">
          Task <span className="font-mono text-xs text-gray-500">#{task.id.slice(0, 8)}</span>
        </p>
        <p className="text-xs text-gray-600">
          {TASK_STATUS_LABELS[task.status] ?? task.status}
          {task.currentStep ? ` — ${task.currentStep}` : ''}
        </p>
      </div>
      {task.actualCost > 0 && (
        <span className="text-xs text-gray-600">${task.actualCost.toFixed(4)}</span>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const activeOrgId = useOrgStore((s) => s.activeOrgId)
  const [projectCount, setProjectCount] = useState(0)
  const [activeTaskCount, setActiveTaskCount] = useState(0)
  const [planReadyIssues, setPlanReadyIssues] = useState<Issue[]>([])
  const [runningTasks, setRunningTasks] = useState<AITask[]>([])
  const [recentActivity, setRecentActivity] = useState<ActivityLogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeOrgId) {
      setLoading(false)
      return
    }
    setLoading(true)

    const fetchAll = async () => {
      try {
        const [projectsRes, tasksRes, activityRes] = await Promise.allSettled([
          projectsApi.list(activeOrgId),
          aiTasksApi.list(activeOrgId),
          activityApi.list(activeOrgId),
        ])

        if (projectsRes.status === 'fulfilled') {
          const projects = (projectsRes.value.data as { id: string }[]) ?? []
          setProjectCount(projects.length)

          if (projects.length > 0) {
            const issueResults = await Promise.allSettled(
              projects.map((p) => issuesApi.list(p.id, activeOrgId))
            )
            const allIssues = issueResults
              .filter((r) => r.status === 'fulfilled')
              .flatMap((r) =>
                r.status === 'fulfilled' ? ((r.value.data as Issue[]) ?? []) : []
              )
            setPlanReadyIssues(allIssues.filter((i) => i.status === 'PLAN_READY'))
          }
        }

        if (tasksRes.status === 'fulfilled') {
          const tasks = (tasksRes.value.data as AITask[]) ?? []
          const active = tasks.filter((t) => ACTIVE_TASK_STATUSES.includes(t.status))
          setActiveTaskCount(active.length)
          setRunningTasks(active.filter((t) => RUNNING_STATUSES.includes(t.status)).slice(0, 6))
        }

        if (activityRes.status === 'fulfilled') {
          setRecentActivity(((activityRes.value.data as ActivityLogEntry[]) ?? []).slice(0, 10))
        }
      } catch (e) {
        console.error('Dashboard fetch error', e)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [activeOrgId])

  if (!activeOrgId) {
    return (
      <div className="flex flex-1 items-center justify-center">
          <div className="max-w-sm text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/10">
              <Bot className="h-6 w-6 text-sky-400" />
            </div>
            <h2 className="text-base font-semibold text-gray-100">No organization yet</h2>
            <p className="mt-1 text-sm text-gray-500">
              Create an organization to start using WebWow AI.
            </p>
            <Link
              href="/settings/organization"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-400 transition-colors"
            >
              Create organization
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Projects"
          value={projectCount}
          icon={FolderGit2}
          color="text-sky-400"
          loading={loading}
        />
        <StatCard
          label="Active AI Tasks"
          value={activeTaskCount}
          icon={Bot}
          color="text-violet-400"
          loading={loading}
          pulse
        />
        <StatCard
          label="Awaiting Approval"
          value={planReadyIssues.length}
          icon={AlertCircle}
          color="text-amber-400"
          loading={loading}
        />
        <StatCard
          label="Recent Activity"
          value={recentActivity.length}
          icon={Activity}
          color="text-emerald-400"
          loading={loading}
        />
      </div>

      {/* ── Active Tasks (plan ready + running) ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* PLAN_READY issues — immediate action */}
        <section className="rounded-xl border border-white/5 bg-gray-900">
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-sky-400" />
              <h2 className="text-sm font-semibold text-gray-100">Awaiting Approval</h2>
              {planReadyIssues.length > 0 && (
                <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-xs font-medium text-sky-300">
                  {planReadyIssues.length}
                </span>
              )}
            </div>
            <Link
              href="/projects"
              className="text-xs text-gray-600 hover:text-gray-300 transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-lg bg-white/5" />
                ))}
              </div>
            ) : planReadyIssues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500/50" />
                <p className="mt-2 text-sm text-gray-600">All caught up!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {planReadyIssues.slice(0, 5).map((issue) => (
                  <PlanReadyRow key={issue.id} issue={issue} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Running tasks */}
        <section className="rounded-xl border border-white/5 bg-gray-900">
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-violet-400" />
              <h2 className="text-sm font-semibold text-gray-100">Running Now</h2>
              {runningTasks.length > 0 && (
                <span className="inline-flex h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
              )}
            </div>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-lg bg-white/5" />
                ))}
              </div>
            ) : runningTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bot className="h-8 w-8 text-gray-700" />
                <p className="mt-2 text-sm text-gray-600">No tasks running</p>
              </div>
            ) : (
              <div className="space-y-2">
                {runningTasks.map((task) => (
                  <RunningTaskRow key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ── Recent Activity ── */}
      <section className="rounded-xl border border-white/5 bg-gray-900">
        <div className="border-b border-white/5 px-5 py-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-100">Recent Activity</h2>
          </div>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-white/5" />
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="h-10 w-10 text-gray-700" />
              <p className="mt-2 text-sm text-gray-600">
                No activity yet. Create your first project!
              </p>
              <Link
                href="/projects/new"
                className="mt-3 text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors"
              >
                Get started →
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {recentActivity.map((log) => (
                <li key={log.id} className="flex items-start gap-3 py-3">
                  <Activity className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-700" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-300">{log.friendlyMessage}</p>
                    <p className="mt-0.5 text-xs text-gray-600">
                      {new Date(log.createdAt).toLocaleString('en-US')}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
