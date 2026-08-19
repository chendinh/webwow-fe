"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { User, Building, Github } from "lucide-react";

interface SettingsTabsProps {
  activeTab: "profile" | "organization" | "github";
}

const tabs = [
  { key: "profile", label: "Hồ sơ", icon: User, path: "/settings/profile" },
  { key: "organization", label: "Tổ chức", icon: Building, path: "/settings/organization" },
  { key: "github", label: "GitHub", icon: Github, path: "/settings/github" },
] as const;

export function SettingsTabs({ activeTab }: SettingsTabsProps) {
  return (
    <div className="border-b border-white/5 bg-gray-900/50">
      <nav className="flex gap-0.5 px-6 -mb-px">
        {tabs.map(({ key, label, icon: Icon, path }) => (
          <Link
            key={key}
            href={path}
            className={cn(
              "inline-flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors",
              activeTab === key
                ? "border-sky-400 text-sky-300"
                : "border-transparent text-gray-500 hover:border-white/20 hover:text-gray-300"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
