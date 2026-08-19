"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/layout/topbar";
import { ProjectTabs } from "@/components/layout/project-tabs";
import { AlertCircle, Plus, Loader } from "lucide-react";
import { issuesApi, Issue } from "@/lib/api/issues.api";
import { useOrgStore } from "@/stores/org.store";

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Đang mở",
  ANALYZING: "Đang phân tích",
  PLAN_READY: "Kế hoạch sẵn sàng",
  APPROVED: "Đã phê duyệt",
  IN_PROGRESS: "Đang thực hiện",
  DONE: "Hoàn thành",
  REJECTED: "Đã từ chối",
};

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "success" | "warning" | "destructive"
> = {
  OPEN: "default",
  ANALYZING: "warning",
  PLAN_READY: "warning",
  APPROVED: "success",
  IN_PROGRESS: "default",
  DONE: "success",
  REJECTED: "destructive",
};

const TYPE_LABELS: Record<string, string> = {
  BUG: "Lỗi",
  FEATURE: "Tính năng",
  REFACTOR: "Tái cấu trúc",
  PERFORMANCE: "Hiệu năng",
  SECURITY: "Bảo mật",
  DEPENDENCY: "Thư viện",
  OTHER: "Khác",
};

const PRIORITY_VARIANTS: Record<
  string,
  "default" | "secondary" | "success" | "warning" | "destructive"
> = {
  CRITICAL: "destructive",
  HIGH: "warning",
  MEDIUM: "default",
  LOW: "secondary",
};

const PRIORITY_LABELS: Record<string, string> = {
  CRITICAL: "Khẩn cấp",
  HIGH: "Cao",
  MEDIUM: "Trung bình",
  LOW: "Thấp",
};

type FilterTab = "ALL" | "OPEN" | "IN_PROGRESS" | "DONE";

export default function ProjectIssuesPage({
  params,
}: {
  params: { projectId: string };
}) {
  const activeOrgId = useOrgStore((s) => s.activeOrgId);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("ALL");

  useEffect(() => {
    if (!activeOrgId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    issuesApi
      .list(params.projectId, activeOrgId)
      .then((res) => setIssues((res.data as Issue[]) ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeOrgId, params.projectId]);

  const filtered = issues.filter((issue) => {
    if (filter === "ALL") return true;
    if (filter === "OPEN") return ["OPEN", "ANALYZING", "PLAN_READY"].includes(issue.status);
    if (filter === "IN_PROGRESS") return ["APPROVED", "IN_PROGRESS"].includes(issue.status);
    if (filter === "DONE") return ["DONE", "REJECTED"].includes(issue.status);
    return true;
  });

  const filterTabs: { id: FilterTab; label: string }[] = [
    { id: "ALL", label: `Tất cả (${issues.length})` },
    {
      id: "OPEN",
      label: `Đang mở (${issues.filter((i) => ["OPEN", "ANALYZING", "PLAN_READY"].includes(i.status)).length})`,
    },
    {
      id: "IN_PROGRESS",
      label: `Đang xử lý (${issues.filter((i) => ["APPROVED", "IN_PROGRESS"].includes(i.status)).length})`,
    },
    {
      id: "DONE",
      label: `Đã đóng (${issues.filter((i) => ["DONE", "REJECTED"].includes(i.status)).length})`,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Issues" />
      <ProjectTabs projectId={params.projectId} activeTab="issues" />
      <div className="flex-1 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Danh sách Issues</h2>
            <p className="text-sm text-gray-500 mt-0.5">Quản lý các yêu cầu và lỗi của dự án</p>
          </div>
          <Link href={`/projects/${params.projectId}/issues/new`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo issue
            </Button>
          </Link>
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
        ) : (
          <>
            <div className="flex gap-2 flex-wrap">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    filter === tab.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <Card>
                <CardContent className="p-0">
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <AlertCircle className="h-14 w-14 text-gray-300" />
                    <h3 className="mt-4 text-base font-medium text-gray-900">Chưa có issue nào</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Tạo issue đầu tiên để bắt đầu theo dõi tiến độ.
                    </p>
                    <Link href={`/projects/${params.projectId}/issues/new`} className="mt-4">
                      <Button variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Tạo issue
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filtered.map((issue) => (
                  <Link
                    key={issue.id}
                    href={`/projects/${params.projectId}/issues/${issue.id}`}
                  >
                    <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 min-w-0">
                            <AlertCircle className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {issue.title}
                              </p>
                              {issue.description && (
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                  {issue.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-1.5">
                                <Badge variant="secondary" className="text-xs">
                                  {TYPE_LABELS[issue.type] ?? issue.type}
                                </Badge>
                                <span className="text-xs text-gray-400">
                                  {new Date(issue.createdAt).toLocaleDateString("vi-VN")}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge
                              variant={PRIORITY_VARIANTS[issue.priority] ?? "secondary"}
                              className="text-xs"
                            >
                              {PRIORITY_LABELS[issue.priority] ?? issue.priority}
                            </Badge>
                            <Badge
                              variant={STATUS_VARIANTS[issue.status] ?? "secondary"}
                              className="text-xs"
                            >
                              {STATUS_LABELS[issue.status] ?? issue.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
