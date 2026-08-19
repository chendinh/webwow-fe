"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle,
  Circle,
  Loader,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { aiTasksApi, AITask, ActivityLog } from "@/lib/api/ai-tasks.api";
import { useOrgStore } from "@/stores/org.store";

// Real AITaskStatus values in order for timeline display
const AI_TASK_STATES = [
  {
    key: "QUEUED",
    label: "Chờ xử lý",
    description: "Task đang chờ trong hàng đợi",
  },
  {
    key: "PREPARING",
    label: "Chuẩn bị sandbox",
    description: "Đang khởi tạo môi trường thực thi",
  },
  {
    key: "CODING",
    label: "Tạo mã nguồn",
    description: "AI đang viết code",
  },
  {
    key: "TESTING",
    label: "Chạy kiểm thử",
    description: "Đang thực thi test suite",
  },
  {
    key: "FIXING",
    label: "Sửa lỗi",
    description: "AI đang sửa các lỗi phát sinh",
  },
  {
    key: "REVIEWING",
    label: "Review code",
    description: "Đang xem xét chất lượng code",
  },
  {
    key: "CREATING_PR",
    label: "Tạo Pull Request",
    description: "Đang tạo PR trên GitHub",
  },
  {
    key: "COMPLETED",
    label: "Hoàn thành",
    description: "Task đã hoàn thành thành công",
  },
];

// Terminal / special states not in the linear flow
const TERMINAL_STATES: Record<string, string> = {
  FAILED: "Thất bại",
  CANCELLED: "Đã hủy",
  WAITING_APPROVAL: "Chờ xác nhận",
};

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

const ACTIVE_STATUSES = [
  "QUEUED",
  "PREPARING",
  "CODING",
  "TESTING",
  "FIXING",
  "REVIEWING",
  "CREATING_PR",
];

function getStatusBadgeVariant(
  status: string
): "default" | "secondary" | "success" | "warning" | "destructive" {
  if (status === "COMPLETED") return "success";
  if (status === "FAILED" || status === "CANCELLED") return "destructive";
  if (status === "WAITING_APPROVAL") return "warning";
  if (ACTIVE_STATUSES.includes(status)) return "default";
  return "secondary";
}

function StateIcon({
  stateKey,
  currentStatus,
}: {
  stateKey: string;
  currentStatus: string;
}) {
  if (currentStatus === "FAILED" && stateKey === "FAILED")
    return <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />;
  if (currentStatus === "CANCELLED" && stateKey === "CANCELLED")
    return <XCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />;
  if (stateKey === "COMPLETED" && currentStatus === "COMPLETED")
    return <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />;

  const currentIdx = AI_TASK_STATES.findIndex((s) => s.key === currentStatus);
  const thisIdx = AI_TASK_STATES.findIndex((s) => s.key === stateKey);

  if (stateKey === currentStatus) {
    if (ACTIVE_STATUSES.includes(currentStatus))
      return (
        <Loader className="h-5 w-5 text-blue-500 flex-shrink-0 animate-spin" />
      );
    return <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />;
  }

  if (thisIdx >= 0 && currentIdx >= 0 && thisIdx < currentIdx)
    return <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />;

  return <Circle className="h-5 w-5 text-gray-300 flex-shrink-0" />;
}

function ActivityLogItem({ log }: { log: ActivityLog }) {
  const [showDetail, setShowDetail] = useState(false);
  const hasTechnicalDetail =
    log.technicalDetail !== null && log.technicalDetail !== undefined;

  return (
    <div className="py-3 border-b last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-gray-800">{log.friendlyMessage}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-400">
              {new Date(log.createdAt).toLocaleTimeString("vi-VN")}
            </span>
            {log.eventType && (
              <Badge variant="secondary" className="text-xs py-0 px-1.5">
                {log.eventType}
              </Badge>
            )}
            {log.oldStatus && log.newStatus && (
              <span className="text-xs text-gray-400">
                {log.oldStatus} → {log.newStatus}
              </span>
            )}
          </div>
        </div>
        {hasTechnicalDetail && (
          <button
            onClick={() => setShowDetail((v) => !v)}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-0.5 flex-shrink-0"
          >
            Chi tiết
            {showDetail ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
        )}
      </div>
      {showDetail && hasTechnicalDetail && (
        <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto text-gray-600 max-h-40 overflow-y-auto">
          {JSON.stringify(log.technicalDetail, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default function AITaskDetailPage({
  params,
}: {
  params: { projectId: string; taskId: string };
}) {
  const [task, setTask] = useState<AITask | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [resuming, setResuming] = useState(false);
  const activeOrgId = useOrgStore((s) => s.activeOrgId ?? "");

  const fetchData = useCallback(async () => {
    if (!activeOrgId) return;
    try {
      const [taskRes, logsRes] = await Promise.all([
        aiTasksApi.getById(params.taskId, activeOrgId),
        aiTasksApi.getLogs(params.taskId, activeOrgId),
      ]);
      setTask(taskRes.data);
      setLogs(logsRes.data);
    } catch (e) {
      console.error("Failed to fetch task data", e);
    } finally {
      setLoading(false);
    }
  }, [activeOrgId, params.taskId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-poll when task is active
  useEffect(() => {
    if (!task) return;
    const isActive =
      ACTIVE_STATUSES.includes(task.status) ||
      task.status === "WAITING_APPROVAL";
    if (!isActive) return;
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [task, fetchData]);

  const handleResume = async () => {
    if (!activeOrgId || !task) return;
    setResuming(true);
    try {
      await aiTasksApi.resume(task.id, activeOrgId);
      await fetchData();
    } catch (e) {
      console.error("Failed to resume task", e);
    } finally {
      setResuming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-500">Không tìm thấy task.</p>
      </div>
    );
  }

  const currentStatusLabel =
    STATUS_LABELS[task.status] ?? task.status;
  const isTerminal =
    task.status === "COMPLETED" ||
    task.status === "FAILED" ||
    task.status === "CANCELLED";

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Back + status header */}
          <div className="flex items-center justify-between">
            <Link
              href={`/projects/${params.projectId}/ai-tasks`}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Quay lại AI Tasks
            </Link>
            <Badge variant={getStatusBadgeVariant(task.status)}>
              {currentStatusLabel}
            </Badge>
          </div>

          {/* Task summary */}
          <Card>
            <CardHeader>
              <CardTitle>Task #{task.id.slice(0, 8)}</CardTitle>
              {task.currentStep && (
                <p className="text-sm text-gray-500">{task.currentStep}</p>
              )}
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-1">
              {task.branchName && (
                <p>
                  <span className="font-medium">Branch:</span>{" "}
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                    {task.branchName}
                  </code>
                </p>
              )}
              {task.filesChanged.length > 0 && (
                <p>
                  <span className="font-medium">Files thay đổi:</span>{" "}
                  {task.filesChanged.length} files
                </p>
              )}
              {task.durationMs != null && (
                <p>
                  <span className="font-medium">Thời gian:</span>{" "}
                  {Math.round(task.durationMs / 60000)} phút
                </p>
              )}
              {task.actualTokens > 0 && (
                <p>
                  <span className="font-medium">Tokens đã dùng:</span>{" "}
                  {task.actualTokens.toLocaleString()}
                </p>
              )}
              {task.failureReason && (
                <p className="text-red-600">
                  <span className="font-medium">Lý do thất bại:</span>{" "}
                  {task.failureReason}
                </p>
              )}
            </CardContent>
          </Card>

          {/* WAITING_APPROVAL panel */}
          {task.status === "WAITING_APPROVAL" && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-5 w-5" />
                  Phát hiện lỗi build trong project gốc
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {task.buildResult?.errorSummary && (
                  <p className="text-sm text-yellow-700">
                    {task.buildResult.errorSummary}
                  </p>
                )}
                {task.buildResult?.preflightIssues && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-yellow-700 hover:text-yellow-900 font-medium">
                      Xem chi tiết lỗi
                    </summary>
                    <pre className="mt-2 bg-white border border-yellow-200 p-2 rounded overflow-x-auto max-h-48 overflow-y-auto text-gray-600 whitespace-pre-wrap">
                      {task.buildResult.preflightIssues}
                    </pre>
                  </details>
                )}
                <div className="flex items-center gap-3 pt-1">
                  <Button
                    onClick={handleResume}
                    disabled={resuming}
                    size="sm"
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    {resuming && (
                      <Loader className="h-3 w-3 animate-spin mr-1" />
                    )}
                    Xác nhận &amp; tiếp tục
                  </Button>
                  <p className="text-xs text-yellow-600">
                    AI sẽ cố gắng thực hiện task dù project có lỗi.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          {!Object.keys(TERMINAL_STATES).includes(task.status) ||
          task.status === "COMPLETED" ? (
            <Card>
              <CardHeader>
                <CardTitle>Timeline trạng thái</CardTitle>
                <p className="text-sm text-gray-500">
                  Theo dõi tiến trình thực hiện của AI Task.
                </p>
              </CardHeader>
              <CardContent>
                <ol className="relative">
                  {AI_TASK_STATES.map(({ key, label, description }, idx) => {
                    const currentIdx = AI_TASK_STATES.findIndex(
                      (s) => s.key === task.status
                    );
                    const thisIdx = idx;
                    const isActive = key === task.status;
                    const isPast = currentIdx >= 0 && thisIdx < currentIdx;
                    const isDone =
                      task.status === "COMPLETED" && key === "COMPLETED";

                    return (
                      <li key={key} className="flex gap-4 pb-6 last:pb-0">
                        <div className="flex flex-col items-center">
                          <StateIcon
                            stateKey={key}
                            currentStatus={task.status}
                          />
                          {idx < AI_TASK_STATES.length - 1 && (
                            <div
                              className={`w-0.5 flex-1 mt-1 ${
                                isPast || isDone
                                  ? "bg-green-300"
                                  : isActive
                                  ? "bg-blue-200"
                                  : "bg-gray-200"
                              }`}
                              style={{ minHeight: "20px" }}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pb-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-medium ${
                                isActive
                                  ? "text-blue-700"
                                  : isPast || isDone
                                  ? "text-gray-700"
                                  : "text-gray-400"
                              }`}
                            >
                              {label}
                            </span>
                            {isActive && !isTerminal && (
                              <Badge variant="default" className="text-xs">
                                Hiện tại
                              </Badge>
                            )}
                          </div>
                          <p
                            className={`text-xs mt-0.5 ${
                              isActive || isPast || isDone
                                ? "text-gray-500"
                                : "text-gray-300"
                            }`}
                          >
                            {description}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </CardContent>
            </Card>
          ) : null}

          {/* Activity log */}
          {logs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Nhật ký hoạt động</CardTitle>
                <p className="text-sm text-gray-500">
                  {logs.length} sự kiện được ghi nhận
                </p>
              </CardHeader>
              <CardContent className="p-0 px-6">
                {logs.map((log) => (
                  <ActivityLogItem key={log.id} log={log} />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
