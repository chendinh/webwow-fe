'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  GitBranch, Bot, AlertCircle, Loader2, RefreshCw,
  CheckCircle2, XCircle, Clock, Activity, HeartPulse,
  ShieldAlert, Shield, Wrench, Package, Settings,
  ChevronDown, ChevronUp, Plus,
} from 'lucide-react'
import { projectsApi, HealthCheckResult, HealthIssue } from '@/lib/api/projects.api'
import { issuesApi, Issue } from '@/lib/api/issues.api'
import { aiTasksApi, AITask } from '@/lib/api/ai-tasks.api'
import { activityApi, ActivityLogEntry } from '@/lib/api/activity.api'
import { issuesApi as issuesApiCreate } from '@/lib/api/issues.api'
import { useOrgStore } from '@/stores/org.store'
import { ProjectTabs } from '@/components/layout/project-tabs'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Project {
  id: string
  name: string
  description: string | null
  githubRepoFullName: string
  defaultBranch: string
  status: string
  createdAt: string
  primaryLanguage: string | null
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  ACTIVE: { label: 'Active', color: 'text-emerald-400', icon: CheckCircle2 },
  ANALYZING: { label: 'Analyzing', color: 'text-sky-400', icon: Loader2 },
  PENDING_ANALYSIS: { label: 'Pending', color: 'text-amber-400', icon: Clock },
  ANALYSIS_FAILED: { label: 'Failed', color: 'text-red-400', icon: XCircle },
  ARCHIVED: { label: 'Archived', color: 'text-gray-600', icon: Clock },
}

const ACTIVE_TASK_STATUSES = ['QUEUED', 'PREPARING', 'CODING', 'TESTING', 'FIXING', 'REVIEWING', 'CREATING_PR']

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  critical: { color: 'text-red-300', bg: 'bg-red-500/10 border-red-500/20', label: 'Critical' },
  high:     { color: 'text-orange-300', bg: 'bg-orange-500/10 border-orange-500/20', label: 'High' },
  medium:   { color: 'text-amber-300', bg: 'bg-amber-500/10 border-amber-500/20', label: 'Medium' },
  low:      { color: 'text-sky-300', bg: 'bg-sky-500/10 border-sky-500/20', label: 'Low' },
  info:     { color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20', label: 'Info' },
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  build: Wrench,
  lint: Settings,
  type: Settings,
  security: ShieldAlert,
  dependency: Package,
  config: Settings,
}

const GRADE_CONFIG: Record<string, { color: string; bg: string }> = {
  A: { color: 'text-emerald-300', bg: 'bg-emerald-500/20' },
  B: { color: 'text-sky-300',     bg: 'bg-sky-500/20' },
  C: { color: 'text-amber-300',   bg: 'bg-amber-500/20' },
  D: { color: 'text-orange-300',  bg: 'bg-orange-500/20' },
  F: { color: 'text-red-300',     bg: 'bg-red-500/20' },
}

// ─── Health Issue Card ────────────────────────────────────────────────────────

function HealthIssueCard({
  issue,
  projectId,
  activeOrgId,
  onTaskCreated,
}: {
  issue: HealthIssue
  projectId: string
  activeOrgId: string
  onTaskCreated: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState(false)

  const sev = SEVERITY_CONFIG[issue.severity] ?? SEVERITY_CONFIG.info
  const Icon = CATEGORY_ICONS[issue.category] ?? Settings

  const handleCreateTask = async () => {
    setCreating(true)
    try {
      await issuesApiCreate.create(projectId, activeOrgId, {
        title: issue.title,
        description: `${issue.detail}\n\n${issue.suggestedFix ? `Suggested fix: ${issue.suggestedFix}` : ''}`.trim(),
        type: issue.category === 'security' ? 'SECURITY' : issue.category === 'dependency' ? 'DEPENDENCY' : 'BUG',
        priority: issue.severity === 'critical' ? 'CRITICAL' : issue.severity === 'high' ? 'HIGH' : 'MEDIUM',
      })
      setCreated(true)
      onTaskCreated()
    } catch {
      /* ignore */
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className={`rounded-xl border p-4 ${sev.bg}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <Icon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${sev.color}`} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${sev.bg} ${sev.color} border`}>
                {sev.label}
              </span>
              <span className="text-xs text-gray-500 capitalize">{issue.category}</span>
            </div>
            <p className={`mt-1 text-sm font-medium ${sev.color}`}>{issue.title}</p>
            {issue.filePath && (
              <p className="mt-0.5 font-mono text-xs text-gray-500">
                {issue.filePath}{issue.line ? `:${issue.line}` : ''}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {issue.canAutoFix && !created && (
            <button
              onClick={handleCreateTask}
              disabled={creating}
              className="flex items-center gap-1 rounded-lg bg-sky-500/20 border border-sky-500/30 px-2.5 py-1.5 text-xs font-medium text-sky-300 hover:bg-sky-500/30 disabled:opacity-60 transition-colors"
            >
              {creating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
              Fix
            </button>
          )}
          {created && (
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <CheckCircle2 className="h-3 w-3" /> Task created
            </span>
          )}
          <button onClick={() => setExpanded(v => !v)} className="text-gray-600 hover:text-gray-400 transition-colors">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 ml-7 space-y-2">
          <p className="text-xs text-gray-400 leading-relaxed">{issue.detail}</p>
          {issue.suggestedFix && (
            <div className="rounded-lg bg-white/5 px-3 py-2">
              <p className="text-xs font-semibold text-gray-500 mb-1">Suggested fix</p>
              <p className="text-xs text-gray-300">{issue.suggestedFix}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Health Check Panel ───────────────────────────────────────────────────────

function HealthCheckPanel({
  projectId,
  activeOrgId,
  onTaskCreated,
}: {
  projectId: string
  activeOrgId: string
  onTaskCreated: () => void
}) {
  const [status, setStatus] = useState<string | null>(null)
  const [result, setResult] = useState<HealthCheckResult | null>(null)
  const [checkedAt, setCheckedAt] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchResult = useCallback(async () => {
    try {
      const res = await projectsApi.getHealthCheck(projectId, activeOrgId)
      const data = res.data
      setStatus(data.status)
      setResult(data.result)
      setCheckedAt(data.checkedAt)
      if (data.status !== 'RUNNING') {
        if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null }
        setRunning(false)
      }
    } catch { /* ignore */ }
  }, [projectId, activeOrgId])

  useEffect(() => {
    fetchResult()
    return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
  }, [fetchResult])

  const handleRun = async () => {
    setRunning(true)
    setStatus('RUNNING')
    try {
      await projectsApi.triggerHealthCheck(projectId, activeOrgId)
      pollingRef.current = setInterval(fetchResult, 3000)
    } catch (e) {
      setRunning(false)
      setStatus(null)
      console.error(e)
    }
  }

  const filteredIssues = result?.issues.filter(i =>
    activeFilter === 'all' ? true : i.severity === activeFilter
  ) ?? []

  const severityCounts = result?.issues.reduce((acc, i) => {
    acc[i.severity] = (acc[i.severity] ?? 0) + 1
    return acc
  }, {} as Record<string, number>) ?? {}

  const gc = result ? GRADE_CONFIG[result.grade] ?? GRADE_CONFIG.F : null

  return (
    <div className="rounded-xl border border-white/5 bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <HeartPulse className="h-4 w-4 text-rose-400" />
          <h2 className="text-sm font-semibold text-gray-100">Health Check</h2>
          {checkedAt && (
            <span className="text-xs text-gray-600">
              · {new Date(checkedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <button
          onClick={handleRun}
          disabled={running}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-gray-400 hover:border-white/20 hover:text-gray-200 disabled:opacity-60 transition-colors"
        >
          {running ? <Loader2 className="h-3 w-3 animate-spin" /> : <HeartPulse className="h-3 w-3" />}
          {running ? 'Scanning…' : result ? 'Re-scan' : 'Run Health Check'}
        </button>
      </div>

      {/* Running state */}
      {running && !result && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-rose-400" />
          <p className="text-sm text-gray-500">Scanning codebase for issues…</p>
        </div>
      )}

      {/* Empty state */}
      {!running && !result && (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <Shield className="h-10 w-10 text-gray-700" />
          <p className="text-sm font-medium text-gray-400">No health scan yet</p>
          <p className="text-xs text-gray-600 max-w-xs">
            Run a health check to detect build errors, lint issues, security vulnerabilities, and get AI-powered suggestions.
          </p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="p-5 space-y-5">
          {/* Score row */}
          <div className="flex items-center gap-4">
            <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-2xl font-black ${gc?.bg} ${gc?.color}`}>
              {result.grade}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-white">{result.score}<span className="text-sm font-normal text-gray-500">/100</span></p>
              </div>
              <p className="mt-0.5 text-xs text-gray-400">{result.summary}</p>
            </div>
            {/* Severity pills */}
            <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
              {(['critical', 'high', 'medium', 'low'] as const).map(sev => {
                const count = severityCounts[sev] ?? 0
                if (count === 0) return null
                const cfg = SEVERITY_CONFIG[sev]
                return (
                  <span key={sev} className={`rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.color} ${cfg.bg}`}>
                    {count} {cfg.label}
                  </span>
                )
              })}
              {result.issues.length === 0 && (
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-300">
                  All clear
                </span>
              )}
            </div>
          </div>

          {/* Filter tabs */}
          {result.issues.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {['all', 'critical', 'high', 'medium', 'low', 'info'].map(f => {
                const count = f === 'all' ? result.issues.length : (severityCounts[f] ?? 0)
                if (f !== 'all' && count === 0) return null
                return (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors capitalize ${
                      activeFilter === f
                        ? 'bg-sky-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {f} {count > 0 && <span className="ml-1 opacity-70">{count}</span>}
                  </button>
                )
              })}
            </div>
          )}

          {/* Issues list */}
          {filteredIssues.length > 0 ? (
            <div className="space-y-3">
              {filteredIssues.map((issue, i) => (
                <HealthIssueCard
                  key={i}
                  issue={issue}
                  projectId={projectId}
                  activeOrgId={activeOrgId}
                  onTaskCreated={onTaskCreated}
                />
              ))}
            </div>
          ) : result.issues.length === 0 ? (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <p className="text-sm text-emerald-300">No issues detected — codebase is healthy!</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectOverviewPage({
  params,
}: {
  params: { projectId: string }
}) {
  const activeOrgId = useOrgStore((s) => s.activeOrgId)
  const [project, setProject] = useState<Project | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [tasks, setTasks] = useState<AITask[]>([])
  const [recentActivity, setRecentActivity] = useState<ActivityLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [reanalyzing, setReanalyzing] = useState(false)
  const [issueRefresh, setIssueRefresh] = useState(0)

  useEffect(() => {
    if (!activeOrgId) { setLoading(false); return }
    setLoading(true)
    Promise.allSettled([
      projectsApi.getById(params.projectId, activeOrgId),
      issuesApi.list(params.projectId, activeOrgId),
      aiTasksApi.list(activeOrgId, params.projectId),
      activityApi.list(activeOrgId, params.projectId),
    ]).then(([projectRes, issuesRes, tasksRes, activityRes]) => {
      if (projectRes.status === 'fulfilled') setProject(projectRes.value.data as Project)
      if (issuesRes.status === 'fulfilled') setIssues((issuesRes.value.data as Issue[]) ?? [])
      if (tasksRes.status === 'fulfilled') setTasks((tasksRes.value.data as AITask[]) ?? [])
      if (activityRes.status === 'fulfilled')
        setRecentActivity(((activityRes.value.data as ActivityLogEntry[]) ?? []).slice(0, 5))
    }).finally(() => setLoading(false))
  }, [activeOrgId, params.projectId, issueRefresh])

  const handleReanalyze = async () => {
    if (!activeOrgId) return
    setReanalyzing(true)
    try {
      await projectsApi.reanalyze(params.projectId, activeOrgId)
      const res = await projectsApi.getById(params.projectId, activeOrgId)
      setProject(res.data as Project)
    } catch (e) {
      console.error('Reanalyze failed', e)
    } finally {
      setReanalyzing(false)
    }
  }

  const openIssues = issues.filter((i) => ['OPEN', 'ANALYZING', 'OPTIONS_READY', 'PLAN_READY'].includes(i.status))
  const activeTasks = tasks.filter((t) => ACTIVE_TASK_STATUSES.includes(t.status))
  const statusCfg = project ? STATUS_CONFIG[project.status] ?? STATUS_CONFIG.PENDING_ANALYSIS : null
  const StatusIcon = statusCfg?.icon ?? Clock

  if (!activeOrgId || loading) {
    return (
      <div className="space-y-0">
        <ProjectTabs projectId={params.projectId} activeTab="overview" />
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-gray-700" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      <ProjectTabs projectId={params.projectId} activeTab="overview" />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: 'Open Issues', value: openIssues.length, icon: AlertCircle, color: 'text-amber-400' },
            { label: 'Active AI Tasks', value: activeTasks.length, icon: Bot, color: 'text-violet-400' },
            { label: 'Total Issues', value: issues.length, icon: GitBranch, color: 'text-sky-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-xl border border-white/5 bg-gray-900 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="mt-1 text-3xl font-bold text-white">{value}</p>
                </div>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Health Check — full width */}
        {activeOrgId && (
          <HealthCheckPanel
            projectId={params.projectId}
            activeOrgId={activeOrgId}
            onTaskCreated={() => setIssueRefresh(v => v + 1)}
          />
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Project info */}
          <div className="rounded-xl border border-white/5 bg-gray-900 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-100">Project Info</h2>
              <button
                onClick={handleReanalyze}
                disabled={reanalyzing}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-gray-400 hover:border-white/20 hover:text-gray-200 disabled:opacity-60 transition-colors"
              >
                {reanalyzing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                Re-analyze
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {[
                ['Status', statusCfg ? (
                  <span key="s" className={`flex items-center gap-1.5 ${statusCfg.color}`}>
                    <StatusIcon className={`h-3.5 w-3.5 ${project?.status === 'ANALYZING' ? 'animate-spin' : ''}`} />
                    {statusCfg.label}
                  </span>
                ) : '—'],
                ['Repository', project?.githubRepoFullName ?? '—'],
                ['Language', project?.primaryLanguage ?? '—'],
                ['Default branch', project?.defaultBranch ?? '—'],
                ['Created', project ? new Date(project.createdAt).toLocaleDateString('en-US') : '—'],
              ].map(([label, value]) => (
                <div key={label as string} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-200">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div className="rounded-xl border border-white/5 bg-gray-900 p-5">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-gray-600" />
              <h2 className="text-sm font-semibold text-gray-100">Recent Activity</h2>
            </div>
            <div className="mt-4">
              {recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bot className="h-8 w-8 text-gray-700" />
                  <p className="mt-2 text-xs text-gray-600">No activity yet</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {recentActivity.map((log) => (
                    <li key={log.id}>
                      <p className="text-sm text-gray-300">{log.friendlyMessage}</p>
                      <p className="mt-0.5 text-xs text-gray-700">
                        {new Date(log.createdAt).toLocaleString('en-US')}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Recent issues from health check */}
        {openIssues.length > 0 && (
          <div className="rounded-xl border border-white/5 bg-gray-900 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-100">Open Issues</h2>
              <Link
                href={`/projects/${params.projectId}/issues`}
                className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="space-y-2">
              {openIssues.slice(0, 5).map(issue => (
                <Link
                  key={issue.id}
                  href={`/projects/${params.projectId}/issues/${issue.id}`}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-gray-900/50 px-3 py-2.5 hover:border-white/10 transition-colors"
                >
                  <p className="text-sm text-gray-200 truncate">{issue.title}</p>
                  <span className="ml-3 flex-shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-300 border border-amber-500/20">
                    {issue.status}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
