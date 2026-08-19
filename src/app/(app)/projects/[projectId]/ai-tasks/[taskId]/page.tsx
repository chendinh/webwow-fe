"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
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
    return <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />;
  if (currentStatus === "CANCELLED" && stateKey === "CANCELLED")
    return <XCircle className="h-5 w-5 text-gray-500 flex-shrink-0" />;
  if (stateKey === "COMPLETED" && currentStatus === "COMPLETED")
    return <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />;

  const currentIdx = AI_TASK_STATES.findIndex((s) => s.key === currentStatus);
  const thisIdx = AI_TASK_STATES.findIndex((s) => s.key === stateKey);

  if (stateKey === currentStatus) {
    if (ACTIVE_STATUSES.includes(currentStatus))
      return (
        <Loader className="h-5 w-5 text-sky-400 flex-shrink-0 animate-spin" />
      );
    return <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />;
  }

  if (thisIdx >= 0 && currentIdx >= 0 && thisIdx < currentIdx)
    return <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />;

  return <Circle className="h-5 w-5 text-gray-700 flex-shrink-0" />;
}

function ActivityLogItem({ log }: { log: ActivityLog }) {
  const [showDetail, setShowDetail] = useState(false);
  const hasTechnicalDetail =
    log.technicalDetail !== null && log.technicalDetail !== undefined;

  return (
    <div className="py-3 border-b border-white/5 last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-gray-300">{log.friendlyMessage}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-500">
              {new Date(log.createdAt).toLocaleTimeString("vi-VN")}
            </span>
            {log.eventType && (
              <Badge variant="secondary" className="text-xs py-0 px-1.5">
                {log.eventType}
              </Badge>
            )}
            {log.oldStatus && log.newStatus && (
              <span className="text-xs text-gray-500">
                {log.oldStatus} → {log.newStatus}
              </span>
            )}
          </div>
        </div>
        {hasTechnicalDetail && (
          <button
            onClick={() => setShowDetail((v) => !v)}
            className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-0.5 flex-shrink-0 transition-colors"
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
        <pre className="mt-2 text-xs bg-white/5 border border-white/10 p-2 rounded-lg overflow-x-auto text-gray-400 max-h-40 overflow-y-auto">
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
        <Loader className="h-8 w-8 animate-spin text-gray-600" />
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

  const currentStatusLabel = STATUS_LABELS[task.status] ?? task.status;
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
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Quay lại AI Tasks
            </Link>
            <Badge variant={getStatusBadgeVariant(task.status)}>
              {currentStatusLabel}
            </Badge>
          </div>

          {/* Task summary */}
          <div className="rounded-xl border border-white/5 bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-100">Task #{task.id.slice(0, 8)}</h2>
            {task.currentStep && (
              <p className="text-sm text-gray-500 mt-1">{task.currentStep}</p>
            )}
            <div className="mt-4 text-sm text-gray-400 space-y-1.5">
              {task.branchName && (
                <p>
                  <span className="font-medium text-gray-300">Branch:</span>{" "}
                  <code className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-xs text-sky-300">
                    {task.branchName}
                  </code>
                </p>
              )}
              {task.filesChanged.length > 0 && (
                <p>
                  <span className="font-medium text-gray-300">Files thay đổi:</span>{" "}
                  {task.filesChanged.length} files
                </p>
              )}
              {task.durationMs != null && (
                <p>
                  <span className="font-medium text-gray-300">Thời gian:</span>{" "}
                  {Math.round(task.durationMs / 60000)} phút
                </p>
              )}
              {task.actualTokens > 0 && (
                <p>
                  <span className="font-medium text-gray-300">Tokens đã dùng:</span>{" "}
                  {task.actualTokens.toLocaleString()}
                </p>
              )}
              {task.failureReason && (
                <p className="text-red-400">
                  <span className="font-medium">Lý do thất bại:</span>{" "}
                  {task.failureReason}
                </p>
              )}
            </div>
          </div>

          {/* WAITING_APPROVAL panel */}
          {task.status === "WAITING_APPROVAL" && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-amber-300">
                <AlertTriangle className="h-5 w-5" />
                Phát hiện lỗi build trong project gốc
              </h2>
              <div className="mt-3 space-y-3">
                {task.buildResult?.errorSummary && (
                  <p className="text-sm text-amber-200">
                    {task.buildResult.errorSummary}
                  </p>
                )}
                {task.buildResult?.preflightIssues && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-amber-300 hover:text-amber-200 font-medium transition-colors">
                      Xem chi tiết lỗi
                    </summary>
                    <pre className="mt-2 bg-black/20 border border-amber-500/20 p-2 rounded-lg overflow-x-auto max-h-48 overflow-y-auto text-gray-300 whitespace-pre-wrap">
                      {task.buildResult.preflightIssues}
                    </pre>
                  </details>
                )}
                <div className="flex items-center gap-3 pt-1">
                  <Button
                    onClick={handleResume}
                    disabled={resuming}
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-400 text-white border-0"
                  >
                    {resuming && (
                      <Loader className="h-3 w-3 animate-spin mr-1" />
                    )}
                    Xác nhận &amp; tiếp tục
                  </Button>
                  <p className="text-xs text-amber-400">
                    AI sẽ cố gắng thực hiện task dù project có lỗi.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          {!Object.keys(TERMINAL_STATES).includes(task.status) ||
          task.status === "COMPLETED" ? (
            <div className="rounded-xl border border-white/5 bg-gray-900 p-6">
              <h2 className="text-lg font-semibold text-gray-100">Timeline trạng thái</h2>
              <p className="text-sm text-gray-500 mt-1">
                Theo dõi tiến trình thực hiện của AI Task.
              </p>
              <ol className="relative mt-5">
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
                                ? "bg-emerald-500/50"
                                : isActive
                                ? "bg-sky-500/30"
                                : "bg-white/5"
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
                                ? "text-sky-300"
                                : isPast || isDone
                                ? "text-gray-200"
                                : "text-gray-600"
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
                              : "text-gray-700"
                          }`}
                        >
                          {description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : null}

          {/* Activity log */}
          {logs.length > 0 && (
            <div className="rounded-xl border border-white/5 bg-gray-900 p-6">
              <h2 className="text-lg font-semibold text-gray-100">Nhật ký hoạt động</h2>
              <p className="text-sm text-gray-500 mt-1">
                {logs.length} sự kiện được ghi nhận
              </p>
              <div className="mt-4">
                {logs.map((log) => (
                  <ActivityLogItem key={log.id} log={log} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
