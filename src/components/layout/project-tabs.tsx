"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { LayoutDashboard, AlertCircle, Bot, GitPullRequest, Network, Activity } from "lucide-react";

interface ProjectTabsProps {
  projectId: string;
  activeTab: "overview" | "issues" | "architecture" | "ai-tasks" | "pull-requests" | "activity";
}

const tabs = [
  { key: "overview", label: "Tổng quan", icon: LayoutDashboard, path: "overview" },
  { key: "issues", label: "Issues", icon: AlertCircle, path: "issues" },
  { key: "architecture", label: "Kiến trúc", icon: Network, path: "architecture" },
  { key: "ai-tasks", label: "AI Tasks", icon: Bot, path: "ai-tasks" },
  { key: "pull-requests", label: "Pull Requests", icon: GitPullRequest, path: "pull-requests" },
  { key: "activity", label: "Hoạt động", icon: Activity, path: "activity" },
] as const;

export function ProjectTabs({ projectId, activeTab }: ProjectTabsProps) {
  return (
    <div className="border-b border-gray-200 bg-white px-6">
      <nav className="flex gap-1 -mb-px">
        {tabs.map(({ key, label, icon: Icon, path }) => (
          <Link
            key={key}
            href={`/projects/${projectId}/${path}`}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
