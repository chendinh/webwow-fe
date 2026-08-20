'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, DollarSign, CheckCircle2, Circle, Loader2,
  AlertTriangle, GitPullRequest, XCircle, Zap, Network,
} from 'lucide-react'
import { issuesApi, Issue, ImplementationOption } from '@/lib/api/issues.api'
import { aiTasksApi, AITask } from '@/lib/api/ai-tasks.api'
import { approvalsApi } from '@/lib/api/approvals.api'
import { useOrgStore } from '@/stores/org.store'

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Open',
  ANALYZING: 'Analyzing',
  ANALYSIS_FAILED: 'Cần kiến trúc AI',
  OPTIONS_READY: 'Chọn phương án',
  PLAN_READY: 'Plan Ready',
  APPROVED: 'Approved',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Done',
  DONE: 'Done',
  FAILED: 'Failed',
  REJECTED: 'Rejected',
}

const STATUS_COLOR: Record<string, string> = {
  OPEN: 'text-gray-400 bg-white/5',
  ANALYZING: 'text-sky-300 bg-sky-500/10',
  ANALYSIS_FAILED: 'text-amber-300 bg-amber-500/10',
  OPTIONS_READY: 'text-violet-300 bg-violet-500/10',
  PLAN_READY: 'text-amber-300 bg-amber-500/10',
  APPROVED: 'text-emerald-300 bg-emerald-500/10',
  IN_PROGRESS: 'text-violet-300 bg-violet-500/10',
  COMPLETED: 'text-emerald-400 bg-emerald-500/10',
  DONE: 'text-emerald-400 bg-emerald-500/10',
  FAILED: 'text-red-400 bg-red-500/10',
  REJECTED: 'text-red-400 bg-red-500/10',
}

const TYPE_LABELS: Record<string, string> = {
  BUG: 'Bug', FEATURE: 'Feature', REFACTOR: 'Refactor',
  PERFORMANCE: 'Performance', SECURITY: 'Security',
  DEPENDENCY: 'Dependency', OTHER: 'Other',
}

const PRIORITY_LABELS: Record<string, string> = {
  CRITICAL: 'Critical', HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low',
}

const PRIORITY_COLOR: Record<string, string> = {
  CRITICAL: 'text-red-300 bg-red-500/10',
  HIGH: 'text-amber-300 bg-amber-500/10',
  MEDIUM: 'text-sky-300 bg-sky-500/10',
  LOW: 'text-gray-400 bg-white/5',
}

// Issue-level timeline steps
const ISSUE_TIMELINE = [
  { status: 'OPEN',      label: 'Issue created' },
  { status: 'ANALYZING', label: 'AI analyzing' },
  { status: 'OPTIONS_READY', label: 'Chọn phương án' },
  { status: 'PLAN_READY', label: 'Plan ready' },
  { status: 'APPROVED',  label: 'Approved' },
  { status: 'IN_PROGRESS', label: 'Coding in progress' },
  { status: 'COMPLETED', label: 'Done' },
]

const ISSUE_STATUS_ORDER = ['OPEN', 'ANALYZING', 'OPTIONS_READY', 'PLAN_READY', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'DONE']

// AITask sub-steps shown when coding is in progress
const TASK_STEPS: Array<{ status: string; label: string }> = [
  { status: 'QUEUED',       label: 'Queued' },
  { status: 'PREPARING',    label: 'Setting up sandbox' },
  { status: 'CODING',       label: 'Writing code' },
  { status: 'TESTING',      label: 'Running tests & build' },
  { status: 'FIXING',       label: 'Fixing errors' },
  { status: 'REVIEWING',    label: 'Reviewing changes' },
  { status: 'CREATING_PR',  label: 'Creating pull request' },
  { status: 'COMPLETED',    label: 'Completed' },
]

const TASK_STATUS_ORDER = ['QUEUED', 'PREPARING', 'CODING', 'TESTING', 'FIXING', 'REVIEWING', 'CREATING_PR', 'COMPLETED']

// Statuses that require active polling
const ACTIVE_ISSUE_STATUSES = ['ANALYZING', 'OPEN', 'APPROVED', 'IN_PROGRESS', 'OPTIONS_READY']
const ACTIVE_TASK_STATUSES = ['QUEUED', 'PREPARING', 'CODING', 'TESTING', 'FIXING', 'REVIEWING', 'CREATING_PR']

function getIssueStepState(stepStatus: string, currentStatus: string): 'done' | 'active' | 'inactive' {
  const si = ISSUE_STATUS_ORDER.indexOf(stepStatus)
  const ci = ISSUE_STATUS_ORDER.indexOf(currentStatus)
  if (['REJECTED', 'FAILED'].includes(currentStatus)) return si === 0 ? 'done' : 'inactive'
  if (si < ci) return 'done'
  if (si === ci) return 'active'
  return 'inactive'
}

function getTaskStepState(stepStatus: string, currentStatus: string): 'done' | 'active' | 'inactive' {
  const si = TASK_STATUS_ORDER.indexOf(stepStatus)
  const ci = TASK_STATUS_ORDER.indexOf(currentStatus)
  if (currentStatus === 'FAILED') return 'inactive'
  if (si < ci) return 'done'
  if (si === ci) return 'active'
  return 'inactive'
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIcon({ state, spinning }: { state: 'done' | 'active' | 'inactive'; spinning?: boolean }) {
  if (state === 'done') return <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" />
  if (state === 'active') {
    if (spinning) return <Loader2 className="h-4 w-4 flex-shrink-0 text-sky-400 animate-spin" />
    return <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-sky-400" />
  }
  return <Circle className="h-4 w-4 flex-shrink-0 text-gray-700" />
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IssueDetailPage({
  params,
}: {
  params: { projectId: string; issueId: string }
}) {
  const router = useRouter()
  const activeOrgId = useOrgStore((s) => s.activeOrgId)

  const [issue, setIssue] = useState<Issue | null>(null)
  const [activeTask, setActiveTask] = useState<AITask | null>(null)
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [selectingOption, setSelectingOption] = useState(false)

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Fetch both issue + its latest AITask ────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!activeOrgId) return
    try {
      const [issueRes, tasksRes] = await Promise.allSettled([
        issuesApi.getById(params.projectId, params.issueId, activeOrgId),
        aiTasksApi.list(activeOrgId, params.projectId),
      ])

      if (issueRes.status === 'fulfilled') {
        setIssue(issueRes.value.data as Issue)
      }

      if (tasksRes.status === 'fulfilled') {
        const tasks = (tasksRes.value.data as AITask[]) ?? []
        // Find the latest task for this issue
        const issueTasks = tasks
          .filter(t => t.issueId === params.issueId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setActiveTask(issueTasks[0] ?? null)
      }
    } catch (e) {
      console.error('Failed to fetch issue data', e)
    } finally {
      setLoading(false)
    }
  }, [activeOrgId, params.projectId, params.issueId])

  // ── Initial load ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!activeOrgId) { setLoading(false); return }
    fetchData()
  }, [activeOrgId, params.issueId, fetchData])

  // ── Smart polling: runs when issue OR task is in an active state ────────────

  useEffect(() => {
    const issueActive = issue && ACTIVE_ISSUE_STATUSES.includes(issue.status)
    const taskActive = activeTask && ACTIVE_TASK_STATUSES.includes(activeTask.status)

    if (!issueActive && !taskActive) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
      return
    }

    if (pollingRef.current) return // already polling

    pollingRef.current = setInterval(fetchData, 3000)

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issue?.status, activeTask?.status, fetchData])

  // ── Cleanup on unmount ──────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  // ── Actions ─────────────────────────────────────────────────────────────────

  const handleSelectOption = async (optionId: string) => {
    if (!activeOrgId || !issue) return
    setSelectingOption(true)
    setActionError(null)
    try {
      await issuesApi.selectOption(params.projectId, issue.id, activeOrgId, optionId)
      await fetchData()
    } catch (err: unknown) {
      setActionError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to select option.'
      )
    } finally {
      setSelectingOption(false)
    }
  }

  const handleApprove = async () => {
    if (!activeOrgId || !issue) return
    setApproving(true)
    setActionError(null)
    try {
      await approvalsApi.approve(issue.id, activeOrgId)
      await fetchData()
    } catch (err: unknown) {
      setActionError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Approval failed.'
      )
    } finally {
      setApproving(false)
    }
  }

  const handleReject = async () => {
    if (!activeOrgId || !issue || !rejectReason.trim()) return
    setRejecting(true)
    setActionError(null)
    try {
      await approvalsApi.reject(issue.id, activeOrgId, rejectReason.trim())
      router.push(`/projects/${params.projectId}/issues`)
    } catch (err: unknown) {
      setActionError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Rejection failed.'
      )
      setRejecting(false)
    }
  }

  // ── Loading / error states ──────────────────────────────────────────────────

  if (!activeOrgId || loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-700" />
      </div>
    )
  }

  if (!issue) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="h-12 w-12 text-gray-700" />
        <p className="mt-3 text-sm text-gray-500">Issue not found.</p>
        <Link href={`/projects/${params.projectId}/issues`} className="mt-3 text-sm text-sky-400 hover:text-sky-300 transition-colors">
          ← Back to issues
        </Link>
      </div>
    )
  }

  const isCodingActive = activeTask && ACTIVE_TASK_STATUSES.includes(activeTask.status)
  const isPRCreated = activeTask?.status === 'COMPLETED' || (activeTask?.status === 'CREATING_PR')

  // Detect requiresArchitectureSetup from aiDiagnosis
  const requiresArchitectureSetup = (() => {
    if (issue.status !== 'ANALYSIS_FAILED') return false
    try {
      const parsed = typeof issue.aiDiagnosis === 'string'
        ? JSON.parse(issue.aiDiagnosis)
        : issue.aiDiagnosis
      return parsed?.requiresArchitectureSetup === true
    } catch {
      return false
    }
  })()

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-0">
      <div className="p-6">
        <div className="mx-auto max-w-5xl space-y-6">

          {/* Back + status */}
          <div className="flex items-center justify-between">
            <Link
              href={`/projects/${params.projectId}/issues`}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to issues
            </Link>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLOR[issue.status] ?? 'text-gray-500 bg-white/5'}`}>
              {STATUS_LABELS[issue.status] ?? issue.status}
            </span>
          </div>

          {/* ── Architecture setup required banner ── */}
          {requiresArchitectureSetup && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
              <div className="flex items-start gap-3">
                <Network className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-amber-300">
                    Dự án chưa có kiến trúc AI
                  </p>
                  <p className="mt-1 text-xs text-amber-200/70 leading-relaxed">
                    AI cần phân tích cấu trúc dự án trước khi thực hiện bất kỳ task nào.
                    Chạy phân tích kiến trúc một lần — AI sẽ tự động duy trì sau đó.
                  </p>
                  <Link
                    href={`/projects/${params.projectId}/architecture`}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-400 transition-colors"
                  >
                    <Network className="h-3.5 w-3.5" />
                    Đi đến Kiến trúc AI
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Two-column layout */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

            {/* ── Main column ── */}
            <div className="space-y-5 lg:col-span-2">

              {/* Title + meta */}
              <div className="rounded-xl border border-white/5 bg-gray-900 p-6">
                <h1 className="text-xl font-bold text-white">{issue.title}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLOR[issue.priority] ?? 'text-gray-500 bg-white/5'}`}>
                    {PRIORITY_LABELS[issue.priority] ?? issue.priority}
                  </span>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-gray-500">
                    {TYPE_LABELS[issue.type] ?? issue.type}
                  </span>
                  <span className="text-xs text-gray-600">
                    Created {new Date(issue.createdAt).toLocaleDateString('en-US')}
                  </span>
                </div>
                <div className="mt-5 border-t border-white/5 pt-5">
                  <p className="text-sm/7 text-gray-300 whitespace-pre-wrap">{issue.description}</p>
                </div>
              </div>

              {/* Live coding progress — shown when task is active */}
              {activeTask && (
                <div className={`rounded-xl border p-6 ${
                  activeTask.status === 'FAILED'
                    ? 'border-red-500/20 bg-red-500/5'
                    : activeTask.status === 'COMPLETED'
                    ? 'border-emerald-500/20 bg-emerald-500/5'
                    : 'border-violet-500/20 bg-violet-500/5'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isCodingActive ? (
                        <Loader2 className="h-4 w-4 text-violet-400 animate-spin" />
                      ) : activeTask.status === 'COMPLETED' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                      <h2 className={`text-sm font-semibold ${
                        activeTask.status === 'FAILED' ? 'text-red-300'
                        : activeTask.status === 'COMPLETED' ? 'text-emerald-300'
                        : 'text-violet-300'
                      }`}>
                        {activeTask.status === 'COMPLETED' ? 'AI Coding Complete'
                          : activeTask.status === 'FAILED' ? 'Coding Failed'
                          : 'AI Coding in Progress'}
                      </h2>
                    </div>
                    {activeTask.currentStep && isCodingActive && (
                      <span className="text-xs text-gray-500 italic">{activeTask.currentStep}</span>
                    )}
                  </div>

                  {/* Task sub-steps */}
                  <ol className="mt-4 space-y-2">
                    {TASK_STEPS.map(({ status, label }) => {
                      const state = getTaskStepState(status, activeTask.status)
                      const isCurrentlyActive = state === 'active'
                      return (
                        <li key={status} className="flex items-center gap-3">
                          <StepIcon state={state} spinning={isCurrentlyActive} />
                          <span className={`text-sm ${
                            isCurrentlyActive ? 'font-medium text-sky-300'
                            : state === 'done' ? 'text-gray-300'
                            : 'text-gray-700'
                          }`}>
                            {label}
                          </span>
                        </li>
                      )
                    })}
                  </ol>

                  {/* PR link */}
                  {activeTask.status === 'COMPLETED' && (
                    <div className="mt-4 border-t border-white/5 pt-4 flex items-center gap-2">
                      <GitPullRequest className="h-4 w-4 text-emerald-400" />
                      <span className="text-sm text-gray-400">Pull request created successfully</span>
                      <Link
                        href={`/projects/${params.projectId}/pull-requests`}
                        className="ml-auto text-xs text-sky-400 hover:text-sky-300 transition-colors"
                      >
                        View PR →
                      </Link>
                    </div>
                  )}

                  {/* Failure reason */}
                  {activeTask.status === 'FAILED' && activeTask.failureReason && (
                    <div className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">
                      {activeTask.failureReason}
                    </div>
                  )}

                  {/* Files changed */}
                  {activeTask.filesChanged && activeTask.filesChanged.length > 0 && (
                    <div className="mt-4 border-t border-white/5 pt-4">
                      <p className="text-xs font-semibold text-gray-500 mb-2">
                        {activeTask.filesChanged.length} file{activeTask.filesChanged.length !== 1 ? 's' : ''} changed
                      </p>
                      <ul className="space-y-1">
                        {activeTask.filesChanged.map(f => (
                          <li key={f} className="font-mono text-xs text-sky-400/80">{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* AI Diagnosis */}
              {issue.aiDiagnosis && (
                <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-6">
                  <h2 className="text-sm font-semibold text-sky-300">AI Analysis</h2>
                  {/* Plain language explanation first for non-devs */}
                  {issue.plainDiagnosis && (
                    <div className="mt-3 rounded-lg bg-white/5 px-4 py-3">
                      <p className="text-xs font-semibold text-gray-500 mb-1">💬 Giải thích đơn giản</p>
                      <p className="text-sm text-gray-300 leading-relaxed">{issue.plainDiagnosis}</p>
                    </div>
                  )}
                  <details className="mt-3">
                    <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-400 transition-colors">
                      Xem phân tích kỹ thuật ▸
                    </summary>
                    <p className="mt-2 text-sm/7 text-gray-400 whitespace-pre-wrap">{issue.aiDiagnosis}</p>
                  </details>
                </div>
              )}

              {/* Implementation Plan */}
              {issue.implementationPlan ? (
                <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-6">
                  <h2 className="text-sm font-semibold text-violet-300">Implementation Plan</h2>
                  {(() => {
                    const plan = typeof issue.implementationPlan === 'string'
                      ? JSON.parse(issue.implementationPlan)
                      : issue.implementationPlan as {
                          summary?: string
                          steps?: Array<{ order: number; type: string; filePath: string; description: string; testRequired?: boolean }>
                          testsToWrite?: string[]
                          complexityLevel?: string
                          estimatedMinutes?: number
                        }
                    return (
                      <div className="mt-4 space-y-4">
                        {plan.summary && <p className="text-sm/7 text-gray-300">{plan.summary}</p>}
                        {plan.steps && plan.steps.length > 0 && (
                          <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-violet-400 mb-2">Steps</h3>
                            <ol className="space-y-3">
                              {plan.steps.map((step: { order: number; type: string; filePath: string; description: string }) => (
                                <li key={step.order} className="flex gap-3">
                                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-[10px] font-bold text-violet-300">
                                    {step.order}
                                  </span>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-gray-400">{step.type}</span>
                                      <span className="truncate font-mono text-xs text-sky-300">{step.filePath}</span>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-400">{step.description}</p>
                                  </div>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                        {plan.testsToWrite && plan.testsToWrite.length > 0 && (
                          <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-violet-400 mb-2">Tests to Write</h3>
                            <ul className="space-y-1">
                              {plan.testsToWrite.map((t: string, i: number) => (
                                <li key={i} className="flex gap-2 text-xs text-gray-400">
                                  <span className="mt-1 h-1 w-1 flex-none rounded-full bg-violet-400" />
                                  {t}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {(plan.complexityLevel || plan.estimatedMinutes) && (
                          <div className="flex gap-4 border-t border-white/5 pt-3">
                            {plan.complexityLevel && (
                              <div className="text-xs">
                                <span className="text-gray-600">Complexity </span>
                                <span className="font-medium text-gray-300">{plan.complexityLevel}</span>
                              </div>
                            )}
                            {plan.estimatedMinutes && (
                              <div className="text-xs">
                                <span className="text-gray-600">Est. time </span>
                                <span className="font-medium text-gray-300">{plan.estimatedMinutes} min</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
              ) : issue.status === 'ANALYZING' ? (
                <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-6">
                  <div className="flex items-center gap-2 text-sm text-sky-300">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    AI is analyzing and will generate a plan shortly…
                  </div>
                </div>
              ) : null}
            </div>

            {/* ── Sidebar ── */}
            <div className="space-y-4">

              {/* Option picker — shown when AI has multiple implementation approaches */}
              {issue.status === 'OPTIONS_READY' && issue.implementationOptions && issue.implementationOptions.length > 0 && (
                <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-violet-400" />
                    <h2 className="text-sm font-semibold text-violet-300">Chọn cách thực hiện</h2>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    AI đề xuất {issue.implementationOptions.length} phương án. Chọn một để bắt đầu lên kế hoạch chi tiết.
                  </p>

                  {/* Clarifying questions if any */}
                  {issue.clarifyingQuestions && issue.clarifyingQuestions.length > 0 && (
                    <div className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
                      <p className="text-xs font-semibold text-amber-300 mb-1.5">💡 Để hiểu rõ hơn, AI muốn hỏi:</p>
                      <ul className="space-y-1">
                        {issue.clarifyingQuestions.map((q, i) => (
                          <li key={i} className="text-xs text-gray-400">• {q}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {actionError && (
                    <p className="mb-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">{actionError}</p>
                  )}

                  <div className="space-y-3">
                    {issue.implementationOptions.map((opt: ImplementationOption) => (
                      <div
                        key={opt.id}
                        className={`rounded-xl border p-4 transition-colors ${
                          opt.recommended
                            ? 'border-violet-500/40 bg-violet-500/10'
                            : 'border-white/5 bg-gray-900/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-gray-100">{opt.plainTitle}</p>
                              {opt.recommended && (
                                <span className="rounded-full bg-violet-500/20 border border-violet-500/30 px-2 py-0.5 text-[10px] font-medium text-violet-300">
                                  Đề xuất
                                </span>
                              )}
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                opt.complexity === 'LOW' ? 'bg-emerald-500/10 text-emerald-400'
                                : opt.complexity === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400'
                                : 'bg-red-500/10 text-red-400'
                              }`}>
                                ~{opt.estimatedMinutes} phút
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-gray-400 leading-relaxed">{opt.plainDescription}</p>

                            {/* Pros/Cons */}
                            {(opt.pros.length > 0 || opt.cons.length > 0) && (
                              <div className="mt-2 grid grid-cols-2 gap-2">
                                {opt.pros.length > 0 && (
                                  <div>
                                    {opt.pros.slice(0, 2).map((p, i) => (
                                      <p key={i} className="text-[10px] text-emerald-400">✓ {p}</p>
                                    ))}
                                  </div>
                                )}
                                {opt.cons.length > 0 && (
                                  <div>
                                    {opt.cons.slice(0, 2).map((c, i) => (
                                      <p key={i} className="text-[10px] text-red-400">✗ {c}</p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleSelectOption(opt.id)}
                          disabled={selectingOption}
                          className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
                            opt.recommended
                              ? 'bg-violet-500 text-white hover:bg-violet-400'
                              : 'border border-white/10 text-gray-300 hover:border-white/20 hover:text-white'
                          }`}
                        >
                          {selectingOption ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                          Chọn phương án này
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Approval panel */}
              {issue.status === 'PLAN_READY' && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
                  <h2 className="text-sm font-semibold text-amber-300">Approve Plan</h2>
                  <p className="mt-1 text-xs text-gray-500">Review the AI plan, then approve to start coding.</p>

                  {actionError && (
                    <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">{actionError}</p>
                  )}

                  <div className="mt-4 space-y-2">
                    {!showRejectForm ? (
                      <>
                        <button
                          onClick={handleApprove}
                          disabled={approving}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-60 transition-colors"
                        >
                          {approving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                          Approve & Start Coding
                        </button>
                        <button
                          onClick={() => setShowRejectForm(true)}
                          className="flex w-full items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-300 hover:bg-red-500/20 transition-colors"
                        >
                          Reject Plan
                        </button>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <textarea
                          rows={3}
                          placeholder="Reason for rejection…"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-200 placeholder:text-gray-600 focus:border-red-500/50 focus:outline-none"
                        />
                        <button
                          onClick={handleReject}
                          disabled={rejecting || !rejectReason.trim()}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-400 disabled:opacity-60 transition-colors"
                        >
                          {rejecting && <Loader2 className="h-4 w-4 animate-spin" />}
                          Confirm Rejection
                        </button>
                        <button
                          onClick={() => setShowRejectForm(false)}
                          className="w-full rounded-xl border border-white/10 px-4 py-2.5 text-xs text-gray-400 hover:border-white/20 hover:text-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Cost estimate */}
              {(issue.estimatedCost != null || issue.estimatedTokens != null) && (
                <div className="rounded-xl border border-white/5 bg-gray-900 p-5">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-400" />
                    <h2 className="text-sm font-semibold text-gray-100">Cost Estimate</h2>
                  </div>
                  <div className="mt-4 space-y-2">
                    {issue.estimatedTokens != null && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Tokens</span>
                        <span className="font-medium text-gray-200">~{issue.estimatedTokens.toLocaleString()}</span>
                      </div>
                    )}
                    {issue.estimatedMinutes != null && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Est. time</span>
                        <span className="font-medium text-gray-200">~{issue.estimatedMinutes} min</span>
                      </div>
                    )}
                    {issue.estimatedCost != null && (
                      <div className="flex justify-between border-t border-white/5 pt-2 text-sm font-semibold">
                        <span className="text-gray-300">Total</span>
                        <span className="text-emerald-400">${issue.estimatedCost.toFixed(4)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Progress timeline */}
              <div className="rounded-xl border border-white/5 bg-gray-900 p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-100">Progress</h2>
                  {ACTIVE_ISSUE_STATUSES.includes(issue.status) && (
                    <span className="flex items-center gap-1 text-xs text-sky-400">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sky-400" />
                      </span>
                      Live
                    </span>
                  )}
                </div>

                {/* Issue-level steps */}
                <ol className="mt-4 space-y-3">
                  {ISSUE_TIMELINE.map(({ status, label }) => {
                    const state = getIssueStepState(status, issue.status)
                    const isActive = state === 'active'
                    const isCodingStep = status === 'IN_PROGRESS'
                    return (
                      <li key={status}>
                        <div className="flex items-center gap-3">
                          <StepIcon state={state} spinning={isActive && !isCodingStep} />
                          <span className={`text-sm ${
                            isActive ? 'font-medium text-sky-300'
                            : state === 'done' ? 'text-gray-300'
                            : 'text-gray-700'
                          }`}>
                            {label}
                          </span>
                        </div>

                        {/* Inline task sub-steps under "Coding in progress" */}
                        {isCodingStep && activeTask && (state === 'active' || state === 'done') && (
                          <ol className="mt-2 ml-7 space-y-2 border-l border-white/5 pl-4">
                            {TASK_STEPS.map(({ status: ts, label: tl }) => {
                              const tState = getTaskStepState(ts, activeTask.status)
                              return (
                                <li key={ts} className="flex items-center gap-2">
                                  <StepIcon state={tState} spinning={tState === 'active'} />
                                  <span className={`text-xs ${
                                    tState === 'active' ? 'font-medium text-sky-300'
                                    : tState === 'done' ? 'text-gray-400'
                                    : 'text-gray-700'
                                  }`}>
                                    {tl}
                                  </span>
                                </li>
                              )
                            })}
                          </ol>
                        )}
                      </li>
                    )
                  })}

                  {issue.status === 'REJECTED' && (
                    <li className="flex items-center gap-3">
                      <XCircle className="h-4 w-4 flex-shrink-0 text-red-400" />
                      <span className="text-sm font-medium text-red-400">Rejected</span>
                    </li>
                  )}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
