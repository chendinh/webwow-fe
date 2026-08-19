'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FolderGit2,
  Plus,
  Loader2,
  GitBranch,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { projectsApi } from '@/lib/api/projects.api'
import { useOrgStore } from '@/stores/org.store'

interface Project {
  id: string
  name: string
  description: string | null
  githubRepoFullName: string
  defaultBranch: string
  status: string
  createdAt: string
}

// Status config
const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  ACTIVE: { label: 'Active', icon: CheckCircle2, color: 'text-emerald-400' },
  ANALYZING: { label: 'Analyzing', icon: Loader2, color: 'text-sky-400' },
  PENDING_ANALYSIS: { label: 'Pending', icon: Clock, color: 'text-amber-400' },
  ANALYSIS_FAILED: { label: 'Failed', icon: XCircle, color: 'text-red-400' },
  ARCHIVED: { label: 'Archived', icon: AlertCircle, color: 'text-gray-600' },
}

function ProjectCard({ project }: { project: Project }) {
  const cfg = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.PENDING_ANALYSIS
  const StatusIcon = cfg.icon

  return (
    <Link href={`/projects/${project.id}/overview`}>
      <div className="group relative flex h-full flex-col rounded-xl border border-white/5 bg-gray-900 p-5 transition-all hover:border-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.03)]">
        {/* Status indicator */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-gray-100 group-hover:text-white transition-colors">
              {project.name}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-600">
              <GitBranch className="h-3 w-3" />
              {project.githubRepoFullName}
            </p>
          </div>
          <div className={`flex flex-none items-center gap-1 ${cfg.color}`}>
            <StatusIcon className={`h-4 w-4 ${project.status === 'ANALYZING' ? 'animate-spin' : ''}`} />
            <span className="text-xs font-medium">{cfg.label}</span>
          </div>
        </div>

        {project.description && (
          <p className="mt-3 text-sm text-gray-500 line-clamp-2">
            {project.description}
          </p>
        )}

        <div className="mt-auto pt-4 text-xs text-gray-700">
          Branch: <span className="text-gray-600">{project.defaultBranch}</span>
        </div>
      </div>
    </Link>
  )
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const activeOrgId = useOrgStore((s) => s.activeOrgId)

  useEffect(() => {
    if (!activeOrgId) {
      setLoading(false)
      return
    }
    setLoading(true)
    projectsApi
      .list(activeOrgId)
      .then((res) => setProjects((res.data as Project[]) ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [activeOrgId])

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Projects</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Connect GitHub repositories and let WebWow AI do the work
          </p>
        </div>
        <Link
          href="/projects/new"
          className="flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-400 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>

      {!activeOrgId ? (
        <div className="rounded-xl border border-white/5 bg-gray-900 p-12 text-center">
          <p className="text-sm text-gray-500">No organization found. Please create one first.</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gray-700" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-500/10">
            <FolderGit2 className="h-7 w-7 text-sky-400" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-gray-100">No projects yet</h2>
          <p className="mt-1 text-sm text-gray-500">
            Connect a GitHub repository to get started.
          </p>
          <Link
            href="/projects/new"
            className="mt-5 flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-400 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create first project
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  )
}
