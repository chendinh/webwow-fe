'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { useAuthStore } from '@/stores/auth.store'

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/consult': 'Quick Request',
  '/projects': 'Projects',
  '/usage': 'Usage & Billing',
  '/settings': 'Settings',
  '/settings/profile': 'Profile',
  '/settings/organization': 'Organization',
  '/settings/github': 'GitHub',
  '/settings/tokens': 'API Tokens',
}

function getTitle(pathname: string): string {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname]
  if (pathname.includes('/issues/new')) return 'New Issue'
  if (pathname.includes('/issues/')) return 'Issue Detail'
  if (pathname.includes('/issues')) return 'Issues'
  if (pathname.includes('/ai-tasks/')) return 'AI Task Detail'
  if (pathname.includes('/ai-tasks')) return 'AI Tasks'
  if (pathname.includes('/architecture')) return 'Architecture'
  if (pathname.includes('/activity')) return 'Activity'
  if (pathname.includes('/pull-requests')) return 'Pull Requests'
  if (pathname.includes('/overview')) return 'Overview'
  if (pathname.includes('/projects/new')) return 'New Project'
  if (pathname.includes('/projects/')) return 'Project'
  return 'WebWow'
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const accessToken = useAuthStore((s) => s.accessToken)

  useEffect(() => {
    if (!accessToken) {
      router.replace('/login')
    }
  }, [accessToken, router])

  if (!accessToken) return null

  return <>{children}</>
}

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const title = getTitle(pathname ?? '')

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-6 text-gray-100">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  )
}
