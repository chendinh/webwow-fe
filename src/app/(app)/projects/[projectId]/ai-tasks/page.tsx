'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Bot,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Terminal,
} from 'lucide-react'
import { aiTasksApi, AITask } from '@/lib/api/ai-tasks.api'
import { useOrgStore } from '@/stores/org.store'
import { ProjectTabs } from '@/components/layout/project-tabs'

// ─── Config ───────────────────────────────────────────────────────────────────
const ACTIVE_STATUSES = ['QUEUED', 'PREPARING', 'CODING', 'TESTING', 'FIXING', 'REVIEWING', 'CREATING_PR']

const STATUS_LABELS: Record<string, string> = {
  QUEUED: 'Queued',
  ANALYZING: 'Analyzing',
  PLANNING: 'Planning',
  PREPARING: 'Preparing',
  CODING: 'Coding',
  TESTING: 'Testing',
  FIXING: 'Fixing',
  REVIEWING: 'Reviewing',
  CREATING_PR: 'Creating PR',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
  WAITING_APPROVAL: 'Waiting Approval',
  APPROVED: 'Approved',
}

const STATUS_COLOR: Record<string, string> = {
  COMPLETED: 'text-emerald-300 bg-emerald-500/10',
  FAILED: 'text-red-300 bg-red-500/10',
  CANCELLED: 'text-gray-400 bg-white/5',
  WAITING_APPROVAL: 'text-amber-300 bg-amber-500/10',
}

function statusDot(status: string) {
  if (ACTIVE_STATUSES.includes(status)) return 'bg-sky-400 animate-pulse'
  if (status === 'COMPLETED') return 'bg-emerald-400'
  if (status === 'FAILED' || status === 'CANCELLED') return 'bg-red-400'
  if (status === 'WAITING_APPROVAL') return 'bg-amber-400'
  return 'bg-gray-600'
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'COMPLETED') return <CheckCircle2 className="h-4 w-4 text-emerald-400" />
  if (status === 'FAILED' || status === 'CANCELLED') return <XCircle className="h-4 w-4 text-red-400" />
  if (status === 'WAITING_APPROVAL') return <AlertTriangle className="h-4 w-4 text-amber-400" />
  if (ACTIVE_STATUSES.includes(status)) return <Loader2 className="h-4 w-4 text-sky-400 animate-spin" />
  return <Clock className="h-4 w-4 text-gray-600" />
}

// ─── Task card ────────────────────────────────────────────────────────────────
function TaskCard({
  task,
  projectId,
  onResume,
  resuming,
}: {
  task: AITask
  projectId: string
  onResume: (id: string) => void
  resuming: boolean
}) {
  const isActive = ACTIVE_STATUSES.includes(task.status)
  const colorClass = STATUS_COLOR[task.status]

  return (
    <div
      className={[
        'rounded-xl border p-4 transition-all',
        isActive ? 'border-sky-500/20 bg-sky-500/5' : 'border-white/5 bg-gray-900',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 h-2 w-2 flex-none rounded-full ${statusDot(task.status)}`} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-medium text-gray-200">
              #{task.id.slice(0, 8)}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${colorClass ?? (isActive ? 'text-sky-300 bg-sky-500/10' : 'text-gray-500 bg-white/5')}`}
            >
              {STATUS_LABELS[task.status] ?? task.status}
            </span>
          </div>

          {task.currentStep && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
              <Terminal className="h-3 w-3" />
              {task.currentStep}
            </p>
          )}

          {task.status === 'WAITING_APPROVAL' && task.buildResult?.errorSummary && (
            <div className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
              ⚠️ {task.buildResult.errorSummary}
            </div>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-600">
            {task.durationMs != null && (
              <span>Duration: {Math.round(task.durationMs / 60000)} min</span>
            )}
            {task.actualCost > 0 && (
              <span>Cost: ${task.actualCost.toFixed(4)}</span>
            )}
          </div>
        </div>

        <div className="flex flex-none items-center gap-2">
          {task.status === 'WAITING_APPROVAL' && (
            <button
              disabled={resuming}
              onClick={() => onResume(task.id)}
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/20 disabled:opacity-60 transition-colors"
            >
              {resuming ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              Review & Continue
            </button>
          )}
          <Link
            href={`/projects/${projectId}/ai-tasks/${task.id}`}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-gray-400 hover:border-white/20 hover:text-gray-200 transition-colors"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProjectAITasksPage({
  params,
}: {
  params: { projectId: string }
}) {
  const [tasks, setTasks] = useState<AITask[]>([])
  const [loading, setLoading] = useState(true)
  const [resumingId, setResumingId] = useState<string | null>(null)
  const activeOrgId = useOrgStore((s) => s.activeOrgId ?? '')

  const fetchTasks = useCallback(async () => {
    if (!activeOrgId) return
    try {
      const res = await aiTasksApi.list(activeOrgId, params.projectId)
      setTasks(res.data)
    } catch (e) {
      console.error('Failed to fetch AI tasks', e)
    } finally {
      setLoading(false)
    }
  }, [activeOrgId, params.projectId])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  // Auto-refresh every 10 s while tasks are running
  useEffect(() => {
    if (!tasks.some((t) => ACTIVE_STATUSES.includes(t.status))) return
    const id = setInterval(fetchTasks, 10_000)
    return () => clearInterval(id)
  }, [tasks, fetchTasks])

  const handleResume = async (taskId: string) => {
    if (!activeOrgId) return
    setResumingId(taskId)
    try {
      await aiTasksApi.resume(taskId, activeOrgId)
      await fetchTasks()
    } catch (e) {
      console.error('Failed to resume task', e)
    } finally {
      setResumingId(null)
    }
  }

  const runningCount = tasks.filter((t) => ACTIVE_STATUSES.includes(t.status)).length

  return (
    <div className="space-y-0">
      <ProjectTabs projectId={params.projectId} activeTab="ai-tasks" />

      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <Bot className="h-5 w-5 text-sky-400" />
          <div>
            <h1 className="text-lg font-bold text-white">WebWow AI Tasks</h1>
            <p className="text-sm text-gray-500">
              {runningCount > 0 ? (
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
                  {runningCount} task{runningCount > 1 ? 's' : ''} running
                </span>
              ) : (
                'Monitor AI coding tasks for this project'
              )}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-gray-700" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-16 text-center">
            <Bot className="h-12 w-12 text-gray-700" />
            <h3 className="mt-3 text-sm font-medium text-gray-400">No AI tasks yet</h3>
            <p className="mt-1 text-xs text-gray-600">
              AI tasks are created automatically when you approve an issue.
            </p>
            <Link
              href={`/projects/${params.projectId}/issues`}
              className="mt-4 text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors"
            >
              View issues →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                projectId={params.projectId}
                onResume={handleResume}
                resuming={resumingId === task.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
