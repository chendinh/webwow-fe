'use client'

import { useEffect, useState } from 'react'
import {
  GitBranch,
  Bot,
  AlertCircle,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
} from 'lucide-react'
import { projectsApi } from '@/lib/api/projects.api'
import { issuesApi, Issue } from '@/lib/api/issues.api'
import { aiTasksApi, AITask } from '@/lib/api/ai-tasks.api'
import { activityApi, ActivityLogEntry } from '@/lib/api/activity.api'
import { useOrgStore } from '@/stores/org.store'
import { ProjectTabs } from '@/components/layout/project-tabs'

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

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  ACTIVE: { label: 'Active', color: 'text-emerald-400', icon: CheckCircle2 },
  ANALYZING: { label: 'Analyzing', color: 'text-sky-400', icon: Loader2 },
  PENDING_ANALYSIS: { label: 'Pending', color: 'text-amber-400', icon: Clock },
  ANALYSIS_FAILED: { label: 'Failed', color: 'text-red-400', icon: XCircle },
  ARCHIVED: { label: 'Archived', color: 'text-gray-600', icon: Clock },
}

const ACTIVE_TASK_STATUSES = ['QUEUED', 'PREPARING', 'CODING', 'TESTING', 'FIXING', 'REVIEWING', 'CREATING_PR']

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
  }, [activeOrgId, params.projectId])

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

  const openIssues = issues.filter((i) => ['OPEN', 'ANALYZING', 'PLAN_READY'].includes(i.status))
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
                {reanalyzing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                Re-analyze
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {[
                ['Status', statusCfg ? (
                  <span key="status" className={`flex items-center gap-1.5 ${statusCfg.color}`}>
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
      </div>
    </div>
  )
}
