"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Topbar } from "@/components/layout/topbar";
import { ProjectTabs } from "@/components/layout/project-tabs";
import {
  Bot,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
} from "lucide-react";
import { aiTasksApi, AITask } from "@/lib/api/ai-tasks.api";
import { useOrgStore } from "@/stores/org.store";

const ACTIVE_STATUSES = [
  "QUEUED",
  "PREPARING",
  "CODING",
  "TESTING",
  "FIXING",
  "REVIEWING",
  "CREATING_PR",
];

const STATUS_LABELS: Record<string, string> = {
  QUEUED: "Chờ xử lý",
  ANALYZING: "Đang phân tích",
  PLANNING: "Lập kế hoạch",
  PREPARING: "Chuẩn bị",
  CODING: "Đang viết code",
  TESTING: "Đang kiểm tra",
  FIXING: "Đang sửa lỗi",
  REVIEWING: "Đang review",
  CREATING_PR: "Tạo Pull Request",
  COMPLETED: "Hoàn thành",
  FAILED: "Thất bại",
  CANCELLED: "Đã hủy",
  WAITING_APPROVAL: "Chờ xác nhận",
  APPROVED: "Đã phê duyệt",
};

function getStatusBadgeVariant(
  status: string
): "default" | "secondary" | "success" | "warning" | "destructive" {
  if (status === "COMPLETED") return "success";
  if (status === "FAILED" || status === "CANCELLED") return "destructive";
  if (status === "WAITING_APPROVAL") return "warning";
  if (ACTIVE_STATUSES.includes(status)) return "default";
  return "secondary";
}

function getStatusIcon(status: string) {
  if (status === "COMPLETED")
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  if (status === "FAILED" || status === "CANCELLED")
    return <XCircle className="h-4 w-4 text-red-500" />;
  if (status === "WAITING_APPROVAL")
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  if (ACTIVE_STATUSES.includes(status))
    return <Loader className="h-4 w-4 text-blue-500 animate-spin" />;
  return <Clock className="h-4 w-4 text-gray-400" />;
}

export default function ProjectAITasksPage({
  params,
}: {
  params: { projectId: string };
}) {
  const [tasks, setTasks] = useState<AITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumingId, setResumingId] = useState<string | null>(null);
  const activeOrgId = useOrgStore((s) => s.activeOrgId ?? "");

  const fetchTasks = useCallback(async () => {
    if (!activeOrgId) return;
    try {
      const res = await aiTasksApi.list(activeOrgId, params.projectId);
      setTasks(res.data);
    } catch (e) {
      console.error("Failed to fetch AI tasks", e);
    } finally {
      setLoading(false);
    }
  }, [activeOrgId, params.projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Auto-refresh every 10 seconds when active tasks exist
  useEffect(() => {
    const hasActiveTasks = tasks.some((t) => ACTIVE_STATUSES.includes(t.status));
    if (!hasActiveTasks) return;
    const interval = setInterval(fetchTasks, 10000);
    return () => clearInterval(interval);
  }, [tasks, fetchTasks]);

  const handleResume = async (taskId: string) => {
    if (!activeOrgId) return;
    setResumingId(taskId);
    try {
      await aiTasksApi.resume(taskId, activeOrgId);
      await fetchTasks();
    } catch (e) {
      console.error("Failed to resume task", e);
    } finally {
      setResumingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Topbar title="AI Tasks" />
      <ProjectTabs projectId={params.projectId} activeTab="ai-tasks" />
      <div className="flex-1 p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Danh sách AI Tasks
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Theo dõi các tác vụ AI đang thực hiện cho dự án.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : tasks.length === 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Bot className="h-14 w-14 text-gray-300" />
                <h3 className="mt-4 text-base font-medium text-gray-900">
                  Chưa có AI task nào
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  AI tasks sẽ được tự động tạo khi bạn phê duyệt một issue.
                </p>
                <Link
                  href={`/projects/${params.projectId}/issues`}
                  className="mt-4 text-sm text-blue-600 hover:underline"
                >
                  Xem danh sách issues →
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <Card
                key={task.id}
                className="hover:shadow-sm transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {getStatusIcon(task.status)}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            Task #{task.id.slice(0, 8)}
                          </span>
                          <Badge
                            variant={getStatusBadgeVariant(task.status)}
                            className="text-xs"
                          >
                            {STATUS_LABELS[task.status] ?? task.status}
                          </Badge>
                        </div>
                        {task.currentStep && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            {task.currentStep}
                          </p>
                        )}
                        {task.status === "WAITING_APPROVAL" &&
                          task.buildResult?.errorSummary && (
                            <p className="text-xs text-yellow-700 mt-1 bg-yellow-50 px-2 py-1 rounded">
                              ⚠️ {task.buildResult.errorSummary}
                            </p>
                          )}
                        {task.durationMs != null && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            Thời gian: {Math.round(task.durationMs / 60000)} phút
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {task.status === "WAITING_APPROVAL" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          disabled={resumingId === task.id}
                          onClick={() => handleResume(task.id)}
                        >
                          {resumingId === task.id ? (
                            <Loader className="h-3 w-3 animate-spin mr-1" />
                          ) : null}
                          Xem lỗi &amp; tiếp tục
                        </Button>
                      )}
                      <Link
                        href={`/projects/${params.projectId}/ai-tasks/${task.id}`}
                      >
                        <Button size="sm" variant="outline" className="text-xs">
                          Chi tiết
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
