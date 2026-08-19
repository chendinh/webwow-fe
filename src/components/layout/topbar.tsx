"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, User, Building2 } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useAuthStore } from "@/stores/auth.store";
import { useOrgStore } from "@/stores/org.store";

interface TopbarProps {
  /** Optional page title — kept for backward-compatibility with existing page imports. */
  title?: string;
}

export function Topbar({ title }: TopbarProps = {}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const activeOrgSlug = useOrgStore((s) => s.activeOrgSlug);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "U";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Left: optional page title + active org selector */}
      <div className="flex items-center gap-4">
        {title && (
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        )}

        {/* Active org selector dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              <Building2 className="h-4 w-4 text-gray-500" />
              <span>{activeOrgSlug ?? "Chọn tổ chức"}</span>
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-[180px] rounded-md border border-gray-200 bg-white py-1 shadow-lg"
              sideOffset={4}
            >
              {activeOrgSlug && (
                <DropdownMenu.Item
                  className="flex cursor-default select-none items-center px-3 py-2 text-sm text-gray-700 outline-none data-[highlighted]:bg-gray-50"
                  disabled
                >
                  <Building2 className="mr-2 h-4 w-4 text-blue-600" />
                  <span className="font-medium">{activeOrgSlug}</span>
                </DropdownMenu.Item>
              )}
              <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />
              <DropdownMenu.Item
                className="flex cursor-pointer select-none items-center px-3 py-2 text-sm text-gray-700 outline-none data-[highlighted]:bg-gray-50"
                onSelect={() => router.push("/settings/organization")}
              >
                Quản lý tổ chức
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {/* Right: user menu dropdown */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900 leading-tight">
                {user?.name ?? "User"}
              </p>
              <p className="text-xs text-gray-500 leading-tight max-w-[140px] truncate">
                {user?.email ?? ""}
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="z-50 min-w-[200px] rounded-md border border-gray-200 bg-white py-1 shadow-lg"
            align="end"
            sideOffset={4}
          >
            {/* User info header */}
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">
                {user?.name ?? "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email ?? ""}</p>
            </div>

            <DropdownMenu.Item
              className="flex cursor-pointer select-none items-center px-3 py-2 text-sm text-gray-700 outline-none data-[highlighted]:bg-gray-50"
              onSelect={() => router.push("/settings/profile")}
            >
              <User className="mr-2 h-4 w-4" />
              Hồ sơ cá nhân
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />

            <DropdownMenu.Item
              className="flex cursor-pointer select-none items-center px-3 py-2 text-sm text-red-600 outline-none data-[highlighted]:bg-red-50"
              onSelect={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </header>
  );
}
