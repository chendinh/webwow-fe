"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/layout/topbar";
import { ProjectTabs } from "@/components/layout/project-tabs";
import { GitBranch, Bot, AlertCircle, Loader, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { projectsApi } from "@/lib/api/projects.api";
import { issuesApi, Issue } from "@/lib/api/issues.api";
import { aiTasksApi, AITask } from "@/lib/api/ai-tasks.api";
import { activityApi, ActivityLogEntry } from "@/lib/api/activity.api";
import { useOrgStore } from "@/stores/org.store";

interface Project {
  id: string;
  name: string;
  description: string | null;
  githubRepoFullName: string;
  defaultBranch: string;
  status: string;
  createdAt: string;
  primaryLanguage: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING_ANALYSIS: "Chờ phân tích",
  ANALYZING: "Đang phân tích",
  ANALYSIS_FAILED: "Phân tích thất bại",
  ACTIVE: "Hoạt động",
  ARCHIVED: "Đã lưu trữ",
};

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "success" | "destructive" | "warning"
> = {
  ACTIVE: "success",
  ANALYZING: "default",
  PENDING_ANALYSIS: "secondary",
  ANALYSIS_FAILED: "destructive",
  ARCHIVED: "secondary",
};

const ACTIVE_TASK_STATUSES = ["QUEUED", "PREPARING", "CODING", "TESTING", "FIXING", "REVIEWING", "CREATING_PR"];

export default function ProjectOverviewPage({
  params,
}: {
  params: { projectId: string };
}) {
  const activeOrgId = useOrgStore((s) => s.activeOrgId);
  const [project, setProject] = useState<Project | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [tasks, setTasks] = useState<AITask[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);

  useEffect(() => {
    if (!activeOrgId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.allSettled([
      projectsApi.getById(params.projectId, activeOrgId),
      issuesApi.list(params.projectId, activeOrgId),
      aiTasksApi.list(activeOrgId, params.projectId),
      activityApi.list(activeOrgId, params.projectId),
    ])
      .then(([projectRes, issuesRes, tasksRes, activityRes]) => {
        if (projectRes.status === "fulfilled") {
          setProject(projectRes.value.data as Project);
        }
        if (issuesRes.status === "fulfilled") {
          setIssues((issuesRes.value.data as Issue[]) ?? []);
        }
        if (tasksRes.status === "fulfilled") {
          setTasks((tasksRes.value.data as AITask[]) ?? []);
        }
        if (activityRes.status === "fulfilled") {
          setRecentActivity(((activityRes.value.data as ActivityLogEntry[]) ?? []).slice(0, 5));
        }
      })
      .finally(() => setLoading(false));
  }, [activeOrgId, params.projectId]);

  const handleReanalyze = async () => {
    if (!activeOrgId) return;
    setReanalyzing(true);
    try {
      await projectsApi.reanalyze(params.projectId, activeOrgId);
      const res = await projectsApi.getById(params.projectId, activeOrgId);
      setProject(res.data as Project);
    } catch (e) {
      console.error("Reanalyze failed", e);
    } finally {
      setReanalyzing(false);
    }
  };

  const openIssues = issues.filter((i) =>
    ["OPEN", "ANALYZING", "PLAN_READY"].includes(i.status)
  );
  const activeTasks = tasks.filter((t) => ACTIVE_TASK_STATUSES.includes(t.status));

  const stats = [
    {
      label: "Issues đang mở",
      value: loading ? "—" : openIssues.length.toString(),
      icon: AlertCircle,
      color: "text-orange-500",
    },
    {
      label: "AI Tasks đang chạy",
      value: loading ? "—" : activeTasks.length.toString(),
      icon: Bot,
      color: "text-purple-600",
    },
    {
      label: "Branches",
      value: "—",
      icon: GitBranch,
      color: "text-blue-600",
    },
  ];

  if (!activeOrgId) {
    return (
      <div className="flex flex-col h-full">
        <Topbar title="Tổng quan dự án" />
        <ProjectTabs projectId={params.projectId} activeTab="overview" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-500">Chưa có tổ chức.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Tổng quan dự án" />
      <ProjectTabs projectId={params.projectId} activeTab="overview" />
      <div className="flex-1 p-6 space-y-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {stats.map(({ label, value, icon: Icon, color }) => (
                <Card key={label}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">{label}</p>
                        <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
                      </div>
                      <Icon className={`h-8 w-8 ${color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Thông tin dự án</CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleReanalyze}
                      disabled={reanalyzing}
                    >
                      {reanalyzing ? (
                        <Loader className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <RefreshCw className="h-3 w-3 mr-1" />
                      )}
                      Phân tích lại
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Trạng thái</span>
                    <Badge
                      variant={
                        project
                          ? STATUS_VARIANTS[project.status] ?? "secondary"
                          : "secondary"
                      }
                    >
                      {project ? STATUS_LABELS[project.status] ?? project.status : "—"}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Repository</span>
                    <span className="text-gray-900 font-medium text-right truncate max-w-[180px]">
                      {project?.githubRepoFullName ?? "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Ngôn ngữ chính</span>
                    <span className="text-gray-900 font-medium">
                      {project?.primaryLanguage ?? "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Branch mặc định</span>
                    <span className="text-gray-900 font-medium">
                      {project?.defaultBranch ?? "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Ngày tạo</span>
                    <span className="text-gray-900 font-medium">
                      {project
                        ? new Date(project.createdAt).toLocaleDateString("vi-VN")
                        : "—"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hoạt động gần đây</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentActivity.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Bot className="h-10 w-10 text-gray-300" />
                      <p className="mt-2 text-sm text-gray-500">Chưa có hoạt động nào</p>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {recentActivity.map((log) => (
                        <li key={log.id} className="text-sm">
                          <p className="text-gray-800">{log.friendlyMessage}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(log.createdAt).toLocaleString("vi-VN")}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
