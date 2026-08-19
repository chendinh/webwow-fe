"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Topbar } from "@/components/layout/topbar";
import { FolderOpen, Bot, AlertCircle, Activity, Loader } from "lucide-react";
import { projectsApi } from "@/lib/api/projects.api";
import { aiTasksApi, AITask } from "@/lib/api/ai-tasks.api";
import { issuesApi, Issue } from "@/lib/api/issues.api";
import { activityApi, ActivityLogEntry } from "@/lib/api/activity.api";
import { useOrgStore } from "@/stores/org.store";

const ACTIVE_TASK_STATUSES = [
  "QUEUED",
  "PREPARING",
  "CODING",
  "TESTING",
  "FIXING",
  "REVIEWING",
  "CREATING_PR",
];

export default function DashboardPage() {
  const activeOrgId = useOrgStore((s) => s.activeOrgId);
  const [projectCount, setProjectCount] = useState<number>(0);
  const [activeTaskCount, setActiveTaskCount] = useState<number>(0);
  const [pendingIssueCount, setPendingIssueCount] = useState<number>(0);
  const [recentActivity, setRecentActivity] = useState<ActivityLogEntry[]>([]);
  const [recentTasks, setRecentTasks] = useState<AITask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeOrgId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const fetchAll = async () => {
      try {
        const [projectsRes, tasksRes, activityRes] = await Promise.allSettled([
          projectsApi.list(activeOrgId),
          aiTasksApi.list(activeOrgId),
          activityApi.list(activeOrgId),
        ]);

        if (projectsRes.status === "fulfilled") {
          const projects = (projectsRes.value.data as { id: string }[]) ?? [];
          setProjectCount(projects.length);

          // Fetch issues for all projects to count pending ones
          if (projects.length > 0) {
            const issueResults = await Promise.allSettled(
              projects.map((p) => issuesApi.list(p.id, activeOrgId))
            );
            const allIssues = issueResults
              .filter((r) => r.status === "fulfilled")
              .flatMap((r) =>
                r.status === "fulfilled"
                  ? ((r.value.data as Issue[]) ?? [])
                  : []
              );
            const pending = allIssues.filter(
              (issue) =>
                issue.status === "OPEN" ||
                issue.status === "ANALYZING" ||
                issue.status === "PLAN_READY"
            );
            setPendingIssueCount(pending.length);
          }
        }

        if (tasksRes.status === "fulfilled") {
          const tasks = (tasksRes.value.data as AITask[]) ?? [];
          const active = tasks.filter((t) =>
            ACTIVE_TASK_STATUSES.includes(t.status)
          );
          setActiveTaskCount(active.length);
          setRecentTasks(tasks.slice(0, 5));
        }

        if (activityRes.status === "fulfilled") {
          const logs = (activityRes.value.data as ActivityLogEntry[]) ?? [];
          setRecentActivity(logs.slice(0, 10));
        }
      } catch (e) {
        console.error("Dashboard fetch error", e);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [activeOrgId]);

  const stats = [
    {
      label: "Dự án đang hoạt động",
      value: projectCount.toString(),
      icon: FolderOpen,
      color: "text-blue-600",
    },
    {
      label: "AI Tasks đang chạy",
      value: activeTaskCount.toString(),
      icon: Bot,
      color: "text-purple-600",
    },
    {
      label: "Issues đang mở",
      value: pendingIssueCount.toString(),
      icon: AlertCircle,
      color: "text-orange-500",
    },
    {
      label: "Hoạt động gần đây",
      value: recentActivity.length.toString(),
      icon: Activity,
      color: "text-green-600",
    },
  ];

  if (!activeOrgId) {
    return (
      <div className="flex flex-col h-full">
        <Topbar title="Dashboard" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-500">Chưa có tổ chức. Vui lòng tạo tổ chức trước.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Dashboard" />
      <div className="flex-1 p-6 space-y-6">
        {/* Stats grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    {loading ? (
                      <Loader className="h-6 w-6 animate-spin text-gray-300 mt-1" />
                    ) : (
                      <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
                    )}
                  </div>
                  <Icon className={`h-8 w-8 ${color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Activity className="h-12 w-12 text-gray-300" />
                <p className="mt-3 text-sm text-gray-500">
                  Chưa có hoạt động nào. Hãy tạo dự án đầu tiên của bạn!
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {recentActivity.map((log) => (
                  <li key={log.id} className="py-3 flex items-start gap-3">
                    <Activity className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-gray-800">{log.friendlyMessage}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(log.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent AI Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>AI Tasks gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : recentTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bot className="h-10 w-10 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">Chưa có AI task nào</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {recentTasks.map((task) => (
                  <li key={task.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Bot className="h-4 w-4 text-purple-500 flex-shrink-0" />
                      <span className="text-sm text-gray-800 truncate">
                        Task #{task.id.slice(0, 8)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">{task.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
