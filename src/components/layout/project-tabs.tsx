'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import {
  LayoutDashboard,
  AlertCircle,
  Bot,
  GitPullRequest,
  Network,
  Activity,
} from 'lucide-react'

interface ProjectTabsProps {
  projectId: string
  activeTab:
    | 'overview'
    | 'issues'
    | 'architecture'
    | 'ai-tasks'
    | 'pull-requests'
    | 'activity'
}

const tabs = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard, path: 'overview' },
  { key: 'issues', label: 'Issues', icon: AlertCircle, path: 'issues' },
  { key: 'architecture', label: 'Architecture', icon: Network, path: 'architecture' },
  { key: 'ai-tasks', label: 'AI Tasks', icon: Bot, path: 'ai-tasks' },
  { key: 'pull-requests', label: 'Pull Requests', icon: GitPullRequest, path: 'pull-requests' },
  { key: 'activity', label: 'Activity', icon: Activity, path: 'activity' },
] as const

export function ProjectTabs({ projectId, activeTab }: ProjectTabsProps) {
  return (
    <div className="border-b border-white/5 bg-gray-900/50">
      <nav className="flex gap-0.5 px-5 -mb-px">
        {tabs.map(({ key, label, icon: Icon, path }) => (
          <Link
            key={key}
            href={`/projects/${projectId}/${path}`}
            className={cn(
              'inline-flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors',
              activeTab === key
                ? 'border-sky-400 text-sky-300'
                : 'border-transparent text-gray-500 hover:border-white/20 hover:text-gray-300'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
