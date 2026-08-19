'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  Bot,
  Send,
  Loader2,
  FolderGit2,
  RefreshCw,
  Zap,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  User,
} from 'lucide-react'
import { useOrgStore } from '@/stores/org.store'
import { projectsApi } from '@/lib/api/projects.api'
import { issuesApi, Issue, ImplementationOption } from '@/lib/api/issues.api'
import { cn } from '@/lib/utils/cn'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Project {
  id: string
  name: string
  status: string
  githubRepoFullName: string
  description?: string | null
}

type MessageRole = 'user' | 'bot'
type BotMessageType = 'text' | 'thinking' | 'plan' | 'options'

interface UserMessage {
  id: string
  role: 'user'
  content: string
}

interface BotMessage {
  id: string
  role: 'bot'
  type: BotMessageType
  content?: string
  issue?: Issue
}

type ChatMessage = UserMessage | BotMessage

// ─── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  ANALYZING: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  PENDING_ANALYSIS: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  ANALYSIS_FAILED: 'bg-red-500/20 text-red-300 border-red-500/30',
  ARCHIVED: 'bg-gray-600/20 text-gray-500 border-gray-600/30',
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Sẵn sàng',
  ANALYZING: 'Đang phân tích',
  PENDING_ANALYSIS: 'Chờ phân tích',
  ANALYSIS_FAILED: 'Lỗi phân tích',
  ARCHIVED: 'Đã lưu trữ',
}

const PRIORITY_LABELS: Record<string, string> = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
}

const COMPLEXITY_LABELS: Record<string, string> = {
  LOW: 'Đơn giản',
  MEDIUM: 'Trung bình',
  HIGH: 'Phức tạp',
  VERY_HIGH: 'Rất phức tạp',
}

function uid() {
  return Math.random().toString(36).slice(2)
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        STATUS_COLORS[status] ?? 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

function OptionsBubble({
  issue,
  projectId,
  activeOrgId,
  onOptionSelected,
}: {
  issue: Issue
  projectId: string
  activeOrgId: string
  onOptionSelected: (updatedIssue: Issue) => void
}) {
  const [selecting, setSelecting] = useState<string | null>(null)

  const handleSelect = async (optionId: string) => {
    setSelecting(optionId)
    try {
      const { data } = await issuesApi.selectOption(projectId, issue.id, activeOrgId, optionId)
      onOptionSelected(data as Issue)
    } catch {
      setSelecting(null)
    }
  }

  return (
    <div className="flex items-start gap-3">
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-sky-500/20">
        <Bot className="h-4 w-4 text-sky-400" />
      </div>
      <div className="max-w-[90%] w-full space-y-3">
        {/* Plain diagnosis */}
        {issue.plainDiagnosis && (
          <div className="rounded-2xl rounded-tl-sm border border-white/5 bg-gray-900 px-4 py-3">
            <p className="text-sm text-gray-200 leading-relaxed">{issue.plainDiagnosis}</p>
          </div>
        )}

        {/* Clarifying questions */}
        {issue.clarifyingQuestions && issue.clarifyingQuestions.length > 0 && (
          <div className="rounded-2xl rounded-tl-sm border border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <p className="text-xs font-semibold text-amber-300 mb-2">💡 Để làm tốt hơn, tôi muốn biết thêm:</p>
            <ul className="space-y-1">
              {issue.clarifyingQuestions.map((q, i) => (
                <li key={i} className="text-xs text-gray-400">• {q}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-gray-600">Bạn có thể chọn phương án trước, tôi sẽ làm theo yêu cầu đó.</p>
          </div>
        )}

        {/* Options */}
        <div className="rounded-2xl rounded-tl-sm border border-violet-500/20 bg-violet-500/5 px-4 py-3">
          <p className="text-sm font-semibold text-violet-300 mb-3">
            Có {issue.implementationOptions?.length} cách thực hiện. Bạn muốn dùng cách nào?
          </p>
          <div className="space-y-3">
            {issue.implementationOptions?.map((opt: ImplementationOption) => (
              <div
                key={opt.id}
                className={`rounded-xl border p-4 ${
                  opt.recommended ? 'border-violet-500/40 bg-violet-500/10' : 'border-white/5 bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="text-sm font-semibold text-gray-100">{opt.plainTitle}</p>
                  {opt.recommended && (
                    <span className="rounded-full bg-violet-500/20 border border-violet-500/30 px-2 py-0.5 text-[10px] font-medium text-violet-300">
                      ⭐ Đề xuất
                    </span>
                  )}
                  <span className="text-[10px] text-gray-500">~{opt.estimatedMinutes} phút</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-2">{opt.plainDescription}</p>
                {(opt.pros.length > 0 || opt.cons.length > 0) && (
                  <div className="grid grid-cols-2 gap-1 mb-3">
                    {opt.pros.slice(0, 2).map((p, i) => (
                      <p key={i} className="text-[11px] text-emerald-400">✓ {p}</p>
                    ))}
                    {opt.cons.slice(0, 1).map((c, i) => (
                      <p key={i} className="text-[11px] text-gray-500">✗ {c}</p>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => handleSelect(opt.id)}
                  disabled={selecting !== null}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
                    opt.recommended
                      ? 'bg-violet-500 text-white hover:bg-violet-400'
                      : 'border border-white/10 text-gray-300 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  {selecting === opt.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  Chọn cách này
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ThinkingBubble() {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-sky-500/20">
        <Bot className="h-4 w-4 text-sky-400" />
      </div>
      <div className="rounded-2xl rounded-tl-sm border border-white/5 bg-gray-900 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-sky-300">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Đang phân tích yêu cầu và tạo kế hoạch...</span>
        </div>
      </div>
    </div>
  )
}

function BotTextBubble({ content }: { content: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-sky-500/20">
        <Bot className="h-4 w-4 text-sky-400" />
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-white/5 bg-gray-900 px-4 py-3">
        <p className="text-sm text-gray-200 leading-relaxed">{content}</p>
      </div>
    </div>
  )
}

function PlanBubble({ issue, projectId }: { issue: Issue; projectId: string }) {
  const plan = (() => {
    if (!issue.implementationPlan) return null
    try {
      return typeof issue.implementationPlan === 'string'
        ? JSON.parse(issue.implementationPlan)
        : issue.implementationPlan
    } catch {
      return null
    }
  })() as {
    summary?: string
    steps?: Array<{ order: number; type: string; filePath: string; description: string }>
    testsToWrite?: string[]
    complexityLevel?: string
    estimatedMinutes?: number
  } | null

  return (
    <div className="flex items-start gap-3">
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-sky-500/20">
        <Bot className="h-4 w-4 text-sky-400" />
      </div>
      <div className="max-w-[90%] w-full space-y-3">
        {/* Header bubble */}
        <div className="rounded-2xl rounded-tl-sm border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            Kế hoạch đã sẵn sàng!
          </div>
          {plan?.summary && (
            <p className="mt-2 text-sm text-gray-300 leading-relaxed">{plan.summary}</p>
          )}
        </div>

        {/* Cost + complexity */}
        {(issue.estimatedCost != null || issue.estimatedMinutes != null || plan?.complexityLevel) && (
          <div className="rounded-2xl border border-white/5 bg-gray-900 px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-gray-300">Ước tính</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              {issue.estimatedCost != null && (
                <div>
                  <p className="text-gray-500">Chi phí</p>
                  <p className="font-semibold text-emerald-400">${issue.estimatedCost.toFixed(4)}</p>
                </div>
              )}
              {issue.estimatedMinutes != null && (
                <div>
                  <p className="text-gray-500">Thời gian</p>
                  <p className="font-semibold text-gray-200">~{issue.estimatedMinutes} phút</p>
                </div>
              )}
              {plan?.complexityLevel && (
                <div>
                  <p className="text-gray-500">Độ phức tạp</p>
                  <p className="font-semibold text-gray-200">
                    {COMPLEXITY_LABELS[plan.complexityLevel] ?? plan.complexityLevel}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Steps preview */}
        {plan?.steps && plan.steps.length > 0 && (
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 px-4 py-3">
            <p className="text-xs font-semibold text-violet-300 mb-2">
              {plan.steps.length} bước triển khai
            </p>
            <ol className="space-y-2">
              {plan.steps.slice(0, 3).map((step) => (
                <li key={step.order} className="flex gap-2 text-xs text-gray-400">
                  <span className="flex-shrink-0 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500/20 text-[10px] font-bold text-violet-300">
                    {step.order}
                  </span>
                  <span className="leading-relaxed">
                    <span className="font-mono text-sky-400">{step.filePath}</span>
                    {' — '}
                    {step.description}
                  </span>
                </li>
              ))}
              {plan.steps.length > 3 && (
                <li className="text-xs text-gray-600 pl-6">
                  +{plan.steps.length - 3} bước khác...
                </li>
              )}
            </ol>
          </div>
        )}

        {/* CTA */}
        <div className="flex items-center gap-2 text-xs text-gray-500 pl-1">
          Bạn có muốn bắt đầu?
        </div>
        <Link
          href={`/projects/${projectId}/issues/${issue.id}`}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-400 transition-colors"
        >
          Xem chi tiết & Duyệt plan
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ConsultPage() {
  const { activeOrgId } = useOrgStore()

  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])

  // Track the issue that's currently being polled
  const pollingIssueRef = useRef<{ projectId: string; issueId: string } | null>(null)
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)

  // ── Auto-scroll ─────────────────────────────────────────────────────────────

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Load projects ───────────────────────────────────────────────────────────

  const loadProjects = useCallback(async () => {
    if (!activeOrgId) return
    setLoadingProjects(true)
    try {
      const { data } = await projectsApi.list(activeOrgId)
      const list = Array.isArray(data) ? (data as Project[]) : []
      setProjects(list)
      if (list.length === 1) setSelectedProject(list[0])
    } catch {
      setProjects([])
    } finally {
      setLoadingProjects(false)
    }
  }, [activeOrgId])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  // ── Cleanup polling on unmount ───────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)
    }
  }, [])

  // ── Polling helpers ─────────────────────────────────────────────────────────

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    pollingIssueRef.current = null
  }

  const startPolling = (projectId: string, issueId: string, thinkingMsgId: string) => {
    pollingIssueRef.current = { projectId, issueId }

    pollingIntervalRef.current = setInterval(async () => {
      if (!pollingIssueRef.current || !activeOrgId) return
      try {
        const { data } = await issuesApi.getById(projectId, issueId, activeOrgId)
        const issue = data as Issue

        if (issue.status === 'OPTIONS_READY' && issue.implementationOptions && issue.implementationOptions.length > 0) {
          stopPolling()
          // Replace thinking bubble with option picker bubble
          setMessages(prev =>
            prev.map(m =>
              m.id === thinkingMsgId
                ? ({ id: m.id, role: 'bot', type: 'options', issue, projectId } as BotMessage & { projectId: string })
                : m
            )
          )
          setSubmitting(false)
        } else if (issue.status === 'PLAN_READY' || issue.implementationPlan) {
          stopPolling()
          // Replace the thinking bubble with the plan bubble
          setMessages(prev =>
            prev.map(m =>
              m.id === thinkingMsgId
                ? ({ id: m.id, role: 'bot', type: 'plan', issue, projectId } as BotMessage & { projectId: string })
                : m
            )
          )
          setSubmitting(false)
        }
      } catch {
        // network hiccup — keep polling
      }
    }, 3000)
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !selectedProject || !activeOrgId || submitting) return

    const userText = input.trim()
    setInput('')
    setSubmitting(true)

    // 1. Push user message
    const userMsgId = uid()
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', content: userText }])

    // 2. Push thinking bubble
    const thinkingId = uid()
    setMessages(prev => [...prev, { id: thinkingId, role: 'bot', type: 'thinking' }])

    try {
      // Create issue
      const { data: issue } = await issuesApi.create(selectedProject.id, activeOrgId, {
        title: userText.slice(0, 100),
        description: userText,
        type: 'FEATURE',
        priority: 'MEDIUM',
      })

      // Start polling for plan
      startPolling(selectedProject.id, issue.id, thinkingId)
    } catch {
      setMessages(prev =>
        prev.map(m =>
          m.id === thinkingId
            ? ({ id: m.id, role: 'bot', type: 'text', content: 'Đã xảy ra lỗi khi tạo yêu cầu. Vui lòng thử lại.' } as BotMessage)
            : m
        )
      )
      setSubmitting(false)
    }
  }

  const canSubmit = !submitting && !!selectedProject && input.trim().length > 0

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full gap-6">
      {/* ── Left panel: Projects ─── */}
      <div className="hidden md:flex w-72 flex-shrink-0 flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-300">Dự án</h2>
          <button
            onClick={loadProjects}
            className="rounded-md p-1 text-gray-600 hover:bg-white/5 hover:text-gray-400 transition-colors"
            title="Tải lại"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {loadingProjects ? (
          <div className="flex items-center justify-center py-8 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-gray-900 p-4 text-center">
            <FolderGit2 className="mx-auto h-6 w-6 text-gray-700 mb-2" />
            <p className="text-xs text-gray-500">Chưa có dự án nào</p>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map(project => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={cn(
                  'w-full rounded-xl border p-3 text-left transition-colors',
                  selectedProject?.id === project.id
                    ? 'border-sky-500/40 bg-sky-500/10'
                    : 'border-white/5 bg-gray-900 hover:border-white/10 hover:bg-gray-900/80'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p
                      className={cn(
                        'truncate text-sm font-medium',
                        selectedProject?.id === project.id ? 'text-sky-200' : 'text-gray-200'
                      )}
                    >
                      {project.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {project.githubRepoFullName}
                    </p>
                  </div>
                  <StatusBadge status={project.status} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Right panel: Chat ─── */}
      <div className="flex flex-1 flex-col min-h-0">
        {/* AI indicator */}
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 flex-shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <Bot className="h-4 w-4 text-emerald-400" />
          <span className="text-sm text-emerald-300 font-medium">WebWow AI Team is ready</span>
        </div>

        {/* Mobile: project selector */}
        {projects.length > 0 && (
          <div className="md:hidden mb-4 flex-shrink-0">
            <select
              value={selectedProject?.id ?? ''}
              onChange={e => setSelectedProject(projects.find(p => p.id === e.target.value) ?? null)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-100 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
            >
              <option value="" disabled>Chọn dự án...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-2">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 border border-sky-500/20 mb-4">
                <Zap className="h-6 w-6 text-sky-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-200">Quick Request</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-xs">
                {selectedProject
                  ? `Dự án: ${selectedProject.name}. Mô tả yêu cầu bên dưới.`
                  : 'Chọn một dự án từ danh sách bên trái, rồi mô tả yêu cầu của bạn.'}
              </p>
            </div>
          ) : (
            messages.map(msg => {
              if (msg.role === 'user') {
                return (
                  <div key={msg.id} className="flex items-start gap-3 flex-row-reverse">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-700">
                      <User className="h-4 w-4 text-gray-300" />
                    </div>
                    <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-sky-500/20 border border-sky-500/20 px-4 py-3">
                      <p className="text-sm text-gray-100 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                )
              }

              if (msg.role === 'bot') {
                if (msg.type === 'thinking') return <ThinkingBubble key={msg.id} />
                if (msg.type === 'text') return <BotTextBubble key={msg.id} content={msg.content ?? ''} />
                if (msg.type === 'options') {
                  const m = msg as BotMessage & { projectId?: string }
                  return (
                    <OptionsBubble
                      key={msg.id}
                      issue={msg.issue!}
                      projectId={m.projectId ?? selectedProject?.id ?? ''}
                      activeOrgId={activeOrgId ?? ''}
                      onOptionSelected={(updatedIssue) => {
                        // Replace options bubble with thinking bubble, then poll for plan
                        const newThinkingId = uid()
                        setMessages(prev =>
                          prev.map(m2 =>
                            m2.id === msg.id
                              ? ({ id: msg.id, role: 'bot', type: 'thinking' } as BotMessage)
                              : m2
                          )
                        )
                        setSubmitting(true)
                        startPolling(m.projectId ?? selectedProject?.id ?? '', updatedIssue.id, msg.id)
                      }}
                    />
                  )
                }
                if (msg.type === 'plan') {
                  const m = msg as BotMessage & { projectId?: string }
                  return (
                    <PlanBubble
                      key={msg.id}
                      issue={msg.issue!}
                      projectId={m.projectId ?? selectedProject?.id ?? ''}
                    />
                  )
                }
              }
              return null
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="mt-4 flex-shrink-0 rounded-xl border border-white/10 bg-gray-900 p-3">
          {selectedProject && (
            <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
              <FolderGit2 className="h-3.5 w-3.5" />
              <span className="truncate">{selectedProject.name}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex gap-3 items-end">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  if (canSubmit) handleSubmit(e as unknown as React.FormEvent)
                }
              }}
              placeholder={
                selectedProject
                  ? 'Tôi muốn thêm dark mode... (Enter để gửi, Shift+Enter để xuống dòng)'
                  : 'Chọn một dự án trước...'
              }
              disabled={!selectedProject || submitting}
              rows={3}
              className="flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-shrink-0 flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-400 disabled:opacity-50 transition-colors self-end"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Gửi
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
