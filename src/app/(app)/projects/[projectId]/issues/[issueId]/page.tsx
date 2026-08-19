"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/layout/topbar";
import {
  ArrowLeft,
  DollarSign,
  CheckCircle,
  Circle,
  Loader,
  AlertTriangle,
} from "lucide-react";
import { issuesApi, Issue } from "@/lib/api/issues.api";
import { approvalsApi } from "@/lib/api/approvals.api";
import { useOrgStore } from "@/stores/org.store";

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" }
> = {
  OPEN: { label: "Đang mở", variant: "default" },
  ANALYZING: { label: "Đang phân tích", variant: "warning" },
  PLAN_READY: { label: "Kế hoạch sẵn sàng", variant: "warning" },
  APPROVED: { label: "Đã phê duyệt", variant: "success" },
  IN_PROGRESS: { label: "Đang thực hiện", variant: "default" },
  DONE: { label: "Hoàn thành", variant: "success" },
  REJECTED: { label: "Đã từ chối", variant: "destructive" },
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

const PRIORITY_LABELS: Record<string, string> = {
  CRITICAL: "Khẩn cấp",
  HIGH: "Cao",
  MEDIUM: "Trung bình",
  LOW: "Thấp",
};

const TIMELINE_STEPS = [
  { status: "OPEN", label: "Issue được tạo" },
  { status: "ANALYZING", label: "AI đang phân tích" },
  { status: "PLAN_READY", label: "Kế hoạch sẵn sàng" },
  { status: "APPROVED", label: "Phê duyệt" },
  { status: "IN_PROGRESS", label: "Đang thực hiện" },
  { status: "DONE", label: "Hoàn thành" },
];

const STATUS_ORDER = ["OPEN", "ANALYZING", "PLAN_READY", "APPROVED", "IN_PROGRESS", "DONE"];

function getStepState(stepStatus: string, currentStatus: string) {
  const stepIdx = STATUS_ORDER.indexOf(stepStatus);
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  if (currentStatus === "REJECTED") {
    return stepIdx === 0 ? "done" : "inactive";
  }
  if (stepIdx < currentIdx) return "done";
  if (stepIdx === currentIdx) return "active";
  return "inactive";
}

export default function IssueDetailPage({
  params,
}: {
  params: { projectId: string; issueId: string };
}) {
  const router = useRouter();
  const activeOrgId = useOrgStore((s) => s.activeOrgId);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchIssue = async () => {
    if (!activeOrgId) return;
    try {
      const res = await issuesApi.getById(params.projectId, params.issueId, activeOrgId);
      setIssue(res.data as Issue);
    } catch (e) {
      console.error("Failed to fetch issue", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!activeOrgId) {
      setLoading(false);
      return;
    }
    fetchIssue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOrgId, params.issueId]);

  const handleApprove = async () => {
    if (!activeOrgId || !issue) return;
    setApproving(true);
    setActionError(null);
    try {
      await approvalsApi.approve(issue.id, activeOrgId);
      await fetchIssue();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Phê duyệt thất bại.";
      setActionError(msg);
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!activeOrgId || !issue || !rejectReason.trim()) return;
    setRejecting(true);
    setActionError(null);
    try {
      await approvalsApi.reject(issue.id, activeOrgId, rejectReason.trim());
      router.push(`/projects/${params.projectId}/issues`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Từ chối thất bại.";
      setActionError(msg);
      setRejecting(false);
    }
  };

  if (!activeOrgId) {
    return (
      <div className="flex flex-col h-full">
        <Topbar title="Chi tiết Issue" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-500">Chưa có tổ chức.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <Topbar title="Chi tiết Issue" />
        <div className="flex-1 flex justify-center items-center">
          <Loader className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="flex flex-col h-full">
        <Topbar title="Chi tiết Issue" />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <AlertTriangle className="h-12 w-12 text-gray-300" />
          <p className="text-sm text-gray-500">Không tìm thấy issue.</p>
          <Link href={`/projects/${params.projectId}/issues`}>
            <Button variant="outline" size="sm">
              Quay lại
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[issue.status] ?? STATUS_CONFIG.OPEN;

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Chi tiết Issue" />
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Link
              href={`/projects/${params.projectId}/issues`}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Quay lại danh sách
            </Link>
            <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">{issue.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="secondary">
                      {TYPE_LABELS[issue.type] ?? issue.type}
                    </Badge>
                    <Badge
                      variant={
                        issue.priority === "CRITICAL"
                          ? "destructive"
                          : issue.priority === "HIGH"
                          ? "warning"
                          : "secondary"
                      }
                    >
                      {PRIORITY_LABELS[issue.priority] ?? issue.priority}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      Tạo lúc: {new Date(issue.createdAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {issue.description}
                  </p>
                </CardContent>
              </Card>

              {/* AI Diagnosis */}
              {issue.aiDiagnosis && (
                <Card>
                  <CardHeader>
                    <CardTitle>Phân tích AI</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {issue.aiDiagnosis}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Implementation Plan */}
              {issue.implementationPlan ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Kế hoạch thực hiện</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {issue.implementationPlan}
                    </p>
                  </CardContent>
                </Card>
              ) : issue.status === "ANALYZING" ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Kế hoạch AI</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-gray-500 italic">
                      <Loader className="h-4 w-4 animate-spin" />
                      AI đang phân tích yêu cầu và sẽ tạo kế hoạch chi tiết trong vài phút...
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Approval panel — shown when status is PLAN_READY */}
              {issue.status === "PLAN_READY" && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-base">Phê duyệt kế hoạch</CardTitle>
                    <p className="text-xs text-gray-600">
                      AI đã phân tích xong. Vui lòng xem xét kế hoạch và phê duyệt để tiếp tục.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {actionError && (
                      <p className="text-xs text-red-600">{actionError}</p>
                    )}
                    {!showRejectForm ? (
                      <>
                        <Button
                          className="w-full"
                          size="sm"
                          onClick={handleApprove}
                          disabled={approving}
                        >
                          {approving ? (
                            <Loader className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Phê duyệt
                        </Button>
                        <Button
                          variant="destructive"
                          className="w-full"
                          size="sm"
                          onClick={() => setShowRejectForm(true)}
                        >
                          Từ chối
                        </Button>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <textarea
                          rows={3}
                          placeholder="Lý do từ chối..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                        />
                        <Button
                          variant="destructive"
                          className="w-full"
                          size="sm"
                          onClick={handleReject}
                          disabled={rejecting || !rejectReason.trim()}
                        >
                          {rejecting && <Loader className="h-3 w-3 animate-spin mr-1" />}
                          Xác nhận từ chối
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          size="sm"
                          onClick={() => setShowRejectForm(false)}
                        >
                          Hủy
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Cost estimate */}
              {(issue.estimatedCost != null || issue.estimatedTokens != null) && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <CardTitle className="text-base">Ước tính chi phí</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {issue.estimatedTokens != null && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Token AI</span>
                        <span className="font-medium">
                          ~{issue.estimatedTokens.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {issue.estimatedMinutes != null && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Thời gian ước tính</span>
                        <span className="font-medium">~{issue.estimatedMinutes} phút</span>
                      </div>
                    )}
                    {issue.estimatedCost != null && (
                      <div className="flex justify-between text-sm font-medium border-t pt-2">
                        <span className="text-gray-700">Chi phí dự kiến</span>
                        <span className="text-green-600">
                          ${issue.estimatedCost.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tiến trình</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3">
                    {TIMELINE_STEPS.map(({ status, label }) => {
                      const state = getStepState(status, issue.status);
                      return (
                        <li key={status} className="flex items-center gap-3">
                          {state === "done" ? (
                            <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />
                          ) : state === "active" ? (
                            <CheckCircle className="h-4 w-4 flex-shrink-0 text-blue-500" />
                          ) : (
                            <Circle className="h-4 w-4 flex-shrink-0 text-gray-300" />
                          )}
                          <span
                            className={`text-sm ${
                              state === "active"
                                ? "font-medium text-blue-700"
                                : state === "done"
                                ? "text-gray-700"
                                : "text-gray-400"
                            }`}
                          >
                            {label}
                          </span>
                        </li>
                      );
                    })}
                    {issue.status === "REJECTED" && (
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
                        <span className="text-sm font-medium text-red-700">Đã từ chối</span>
                      </li>
                    )}
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
