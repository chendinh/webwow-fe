"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectTabs } from "@/components/layout/project-tabs";
import { Activity, Loader } from "lucide-react";
import { activityApi, ActivityLogEntry } from "@/lib/api/activity.api";
import { useOrgStore } from "@/stores/org.store";

const EVENT_TYPE_LABELS: Record<string, string> = {
  ISSUE_CREATED: "Issue được tạo",
  ISSUE_STATUS_CHANGED: "Trạng thái issue thay đổi",
  TASK_CREATED: "AI Task được tạo",
  TASK_STATUS_CHANGED: "Trạng thái task thay đổi",
  TASK_COMPLETED: "AI Task hoàn thành",
  TASK_FAILED: "AI Task thất bại",
  PR_CREATED: "Pull Request được tạo",
  PROJECT_ANALYZED: "Dự án được phân tích",
};

export default function ProjectActivityPage({
  params,
}: {
  params: { projectId: string };
}) {
  const activeOrgId = useOrgStore((s) => s.activeOrgId);
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeOrgId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    activityApi
      .list(activeOrgId, params.projectId)
      .then((res) => setLogs((res.data as ActivityLogEntry[]) ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeOrgId, params.projectId]);

  return (
    <div className="flex flex-col h-full">
      <ProjectTabs projectId={params.projectId} activeTab="activity" />
      <div className="flex-1 p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Nhật ký hoạt động</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Tất cả hoạt động xảy ra trong dự án theo thời gian thực.
          </p>
        </div>

        {!activeOrgId ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-gray-500">
              Chưa có tổ chức.
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="flex justify-center py-16">
            <Loader className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : logs.length === 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Activity className="h-14 w-14 text-gray-300" />
                <h3 className="mt-4 text-base font-medium text-gray-900">
                  Chưa có hoạt động nào
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Các sự kiện như tạo issue, chạy AI task, và tạo PR sẽ xuất hiện ở đây.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <li key={log.id} className="flex items-start gap-4 px-5 py-4">
                    <div className="mt-0.5 flex-shrink-0">
                      <Activity className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-800">{log.friendlyMessage}</p>
                      {log.oldStatus && log.newStatus && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {log.oldStatus} → {log.newStatus}
                        </p>
                      )}
                      {log.tokensUsed != null && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Tokens: {log.tokensUsed.toLocaleString()}
                          {log.estimatedCost != null && ` · $${log.estimatedCost.toFixed(4)}`}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-xs text-gray-400 text-right">
                      {new Date(log.createdAt).toLocaleString("vi-VN")}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
