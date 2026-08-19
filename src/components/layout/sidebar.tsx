'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FolderGit2,
  BarChart2,
  Settings,
  LogOut,
  ChevronRight,
  MessageSquare,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useAuth } from '@/lib/hooks/use-auth'
import { cn } from '@/lib/utils/cn'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/consult', label: 'Quick Request', icon: MessageSquare },
  { href: '/projects', label: 'Projects', icon: FolderGit2 },
  { href: '/usage', label: 'Usage', icon: BarChart2 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)
  const { logout } = useAuth()

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-white/5 bg-gray-900">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-white/5 px-5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight">
            <span className="bg-gradient-to-r from-sky-300 to-sky-500 bg-clip-text text-transparent">
              WebWow
            </span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(href + '/')
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-sky-500/10 text-sky-300'
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-100'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 flex-shrink-0',
                      active ? 'text-sky-400' : 'text-gray-500 group-hover:text-gray-300'
                    )}
                  />
                  {label}
                  {active && (
                    <ChevronRight className="ml-auto h-3.5 w-3.5 text-sky-400/60" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User footer */}
      <div className="border-t border-white/5 px-3 py-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          {/* Avatar */}
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-xs font-bold text-sky-300 ring-1 ring-sky-500/30">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-200">
              {user?.name ?? 'User'}
            </p>
            <p className="truncate text-xs text-gray-600">
              {user?.email ?? ''}
            </p>
          </div>
          {/* Logout */}
          <button
            onClick={logout}
            className="ml-auto flex-shrink-0 rounded-md p-1.5 text-gray-600 hover:bg-white/5 hover:text-gray-300 transition-colors"
            title="Log out"
            aria-label="Log out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
