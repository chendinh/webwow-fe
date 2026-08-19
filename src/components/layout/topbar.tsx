'use client'

import { useRouter } from 'next/navigation'
import { ChevronDown, LogOut, User, Building2, Bell } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useAuthStore } from '@/stores/auth.store'
import { useOrgStore } from '@/stores/org.store'
import { useAuth } from '@/lib/hooks/use-auth'

interface TopbarProps {
  title?: string
}

export function Topbar({ title }: TopbarProps = {}) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const activeOrgSlug = useOrgStore((s) => s.activeOrgSlug)
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
    <header className="flex h-14 items-center justify-between border-b border-white/5 bg-gray-900 px-6">
      {/* Left */}
      <div className="flex items-center gap-3">
        {title && (
          <h1 className="text-sm font-semibold text-gray-100">{title}</h1>
        )}

        {/* Org selector */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-500">
              <Building2 className="h-3.5 w-3.5 text-gray-500" />
              <span>{activeOrgSlug ?? 'Select org'}</span>
              <ChevronDown className="h-3 w-3 text-gray-600" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-[180px] rounded-xl border border-white/10 bg-gray-900 py-1 shadow-xl"
              sideOffset={4}
            >
              {activeOrgSlug && (
                <DropdownMenu.Item
                  className="flex cursor-default select-none items-center px-3 py-2 text-sm text-gray-300 outline-none"
                  disabled
                >
                  <Building2 className="mr-2 h-4 w-4 text-sky-400" />
                  <span className="font-medium">{activeOrgSlug}</span>
                </DropdownMenu.Item>
              )}
              <DropdownMenu.Separator className="my-1 h-px bg-white/5" />
              <DropdownMenu.Item
                className="flex cursor-pointer select-none items-center px-3 py-2 text-sm text-gray-400 outline-none data-[highlighted]:bg-white/5 data-[highlighted]:text-gray-100"
                onSelect={() => router.push('/settings/organization')}
              >
                Manage organization
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notification bell — placeholder for future */}
        <button
          className="rounded-lg p-1.5 text-gray-600 hover:bg-white/5 hover:text-gray-300 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        {/* User menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-500">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/20 text-xs font-bold text-sky-300 ring-1 ring-sky-500/30">
                {initials}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-medium leading-tight text-gray-200">
                  {user?.name ?? 'User'}
                </p>
                <p className="max-w-[120px] truncate text-[10px] leading-tight text-gray-600">
                  {user?.email ?? ''}
                </p>
              </div>
              <ChevronDown className="h-3 w-3 text-gray-600" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-[200px] rounded-xl border border-white/10 bg-gray-900 py-1 shadow-xl"
              align="end"
              sideOffset={4}
            >
              <div className="border-b border-white/5 px-3 py-2">
                <p className="text-sm font-medium text-gray-200">
                  {user?.name ?? 'User'}
                </p>
                <p className="truncate text-xs text-gray-600">{user?.email ?? ''}</p>
              </div>

              <DropdownMenu.Item
                className="flex cursor-pointer select-none items-center px-3 py-2 text-sm text-gray-400 outline-none data-[highlighted]:bg-white/5 data-[highlighted]:text-gray-100"
                onSelect={() => router.push('/settings/profile')}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="my-1 h-px bg-white/5" />

              <DropdownMenu.Item
                className="flex cursor-pointer select-none items-center px-3 py-2 text-sm text-red-400 outline-none data-[highlighted]:bg-red-500/10 data-[highlighted]:text-red-300"
                onSelect={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  )
}
