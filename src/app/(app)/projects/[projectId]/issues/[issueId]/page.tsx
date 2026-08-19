'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, DollarSign, CheckCircle2, Circle, Loader2, AlertTriangle } from 'lucide-react'
import { issuesApi, Issue } from '@/lib/api/issues.api'
import { approvalsApi } from '@/lib/api/approvals.api'
import { useOrgStore } from '@/stores/org.store'

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

const TYPE_LABELS: Record<string, string> = {
  BUG: 'Bug',
  FEATURE: 'Feature',
  REFACTOR: 'Refactor',
  PERFORMANCE: 'Performance',
  SECURITY: 'Security',
  DEPENDENCY: 'Dependency',
  OTHER: 'Other',
}

const PRIORITY_LABELS: Record<string, string> = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
}

const PRIORITY_COLOR: Record<string, string> = {
  CRITICAL: 'text-red-300 bg-red-500/10',
  HIGH: 'text-amber-300 bg-amber-500/10',
  MEDIUM: 'text-sky-300 bg-sky-500/10',
  LOW: 'text-gray-400 bg-white/5',
}

const TIMELINE_STEPS = [
  { status: 'OPEN', label: 'Issue created' },
  { status: 'ANALYZING', label: 'AI analyzing' },
  { status: 'PLAN_READY', label: 'Plan ready' },
  { status: 'APPROVED', label: 'Approved' },
  { status: 'IN_PROGRESS', label: 'In progress' },
  { status: 'DONE', label: 'Done' },
]

const STATUS_ORDER = ['OPEN', 'ANALYZING', 'PLAN_READY', 'APPROVED', 'IN_PROGRESS', 'DONE']

function getStepState(stepStatus: string, currentStatus: string) {
  const si = STATUS_ORDER.indexOf(stepStatus)
  const ci = STATUS_ORDER.indexOf(currentStatus)
  if (currentStatus === 'REJECTED') return si === 0 ? 'done' : 'inactive'
  if (si < ci) return 'done'
  if (si === ci) return 'active'
  return 'inactive'
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
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const fetchIssue = async () => {
    if (!activeOrgId) return
    try {
      const res = await issuesApi.getById(params.projectId, params.issueId, activeOrgId)
      setIssue(res.data as Issue)
    } catch (e) {
      console.error('Failed to fetch issue', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!activeOrgId) { setLoading(false); return }
    fetchIssue()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOrgId, params.issueId])

  // Poll while AI is working so the page updates automatically when the plan is ready
  useEffect(() => {
    const POLLING_STATUSES = ['ANALYZING', 'OPEN']
    if (!issue || !POLLING_STATUSES.includes(issue.status)) return

    const interval = setInterval(() => {
      fetchIssue()
    }, 3000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issue?.status])

  const handleApprove = async () => {
    if (!activeOrgId || !issue) return
    setApproving(true)
    setActionError(null)
    try {
      await approvalsApi.approve(issue.id, activeOrgId)
      await fetchIssue()
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
        <Link
          href={`/projects/${params.projectId}/issues`}
          className="mt-3 text-sm text-sky-400 hover:text-sky-300 transition-colors"
        >
          ← Back to issues
        </Link>
      </div>
    )
  }

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
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLOR[issue.status] ?? 'text-gray-500 bg-white/5'}`}
            >
              {STATUS_LABELS[issue.status] ?? issue.status}
            </span>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main column */}
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
                  <p className="text-sm/7 text-gray-300 whitespace-pre-wrap">
                    {issue.description}
                  </p>
                </div>
              </div>

              {/* AI Diagnosis */}
              {issue.aiDiagnosis && (
                <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-6">
                  <h2 className="text-sm font-semibold text-sky-300">AI Analysis</h2>
                  <p className="mt-3 text-sm/7 text-gray-300 whitespace-pre-wrap">
                    {issue.aiDiagnosis}
                  </p>
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
                          rollbackStrategy?: string
                        }
                    return (
                      <div className="mt-4 space-y-4">
                        {plan.summary && (
                          <p className="text-sm/7 text-gray-300">{plan.summary}</p>
                        )}
                        {plan.steps && plan.steps.length > 0 && (
                          <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-violet-400 mb-2">Steps</h3>
                            <ol className="space-y-3">
                              {plan.steps.map((step: { order: number; type: string; filePath: string; description: string; testRequired?: boolean }) => (
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

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Approval panel */}
              {issue.status === 'PLAN_READY' && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
                  <h2 className="text-sm font-semibold text-amber-300">Approve Plan</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Review the AI plan above, then approve to start coding.
                  </p>

                  {actionError && (
                    <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">
                      {actionError}
                    </p>
                  )}

                  <div className="mt-4 space-y-2">
                    {!showRejectForm ? (
                      <>
                        <button
                          onClick={handleApprove}
                          disabled={approving}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-60 transition-colors"
                        >
                          {approving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
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
                        <span className="font-medium text-gray-200">
                          ~{issue.estimatedTokens.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {issue.estimatedMinutes != null && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Est. time</span>
                        <span className="font-medium text-gray-200">
                          ~{issue.estimatedMinutes} min
                        </span>
                      </div>
                    )}
                    {issue.estimatedCost != null && (
                      <div className="flex justify-between border-t border-white/5 pt-2 text-sm font-semibold">
                        <span className="text-gray-300">Total</span>
                        <span className="text-emerald-400">
                          ${issue.estimatedCost.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Progress timeline */}
              <div className="rounded-xl border border-white/5 bg-gray-900 p-5">
                <h2 className="text-sm font-semibold text-gray-100">Progress</h2>
                <ol className="mt-4 space-y-3">
                  {TIMELINE_STEPS.map(({ status, label }) => {
                    const state = getStepState(status, issue.status)
                    return (
                      <li key={status} className="flex items-center gap-3">
                        {state === 'done' ? (
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                        ) : state === 'active' ? (
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-sky-400" />
                        ) : (
                          <Circle className="h-4 w-4 flex-shrink-0 text-gray-700" />
                        )}
                        <span
                          className={`text-sm ${
                            state === 'active'
                              ? 'font-medium text-sky-300'
                              : state === 'done'
                              ? 'text-gray-300'
                              : 'text-gray-700'
                          }`}
                        >
                          {label}
                        </span>
                      </li>
                    )
                  })}
                  {issue.status === 'REJECTED' && (
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-red-400" />
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
