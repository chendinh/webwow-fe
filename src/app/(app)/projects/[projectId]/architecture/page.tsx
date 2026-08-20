"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectTabs } from "@/components/layout/project-tabs";
import { Button } from "@/components/ui/button";
import {
  Network,
  Loader,
  RefreshCw,
  CheckCircle,
  Circle,
  XCircle,
} from "lucide-react";
import { knowledgeApi } from "@/lib/api/knowledge.api";
import { useOrgStore } from "@/stores/org.store";

// ─── Constants ────────────────────────────────────────────────────────────────

const KNOWLEDGE_DOCUMENTS = [
  "OVERVIEW.md",
  "PROJECT.md",
  "ARCHITECTURE.md",
  "MODULES.md",
  "API.md",
  "DATABASE.md",
  "DEPENDENCIES.md",
  "CONVENTIONS.md",
  "BUSINESS_RULES.md",
  "FILE_INDEX.md",
] as const;

const ANALYSIS_STEPS = [
  "Kiểm tra repository...",
  "Đọc AI manifest...",
  "Phát hiện thay đổi...",
  "Phân tích với AI...",
  "Cập nhật tài liệu...",
  "Hoàn tất",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectArchitecturePage({
  params,
}: {
  params: { projectId: string };
}) {
  const activeOrgId = useOrgStore((s) => s.activeOrgId);
  const [isTriggering, setIsTriggering] = useState(false);

  const { data: statusResponse, isLoading } = useQuery({
    queryKey: ["knowledge-status", params.projectId, activeOrgId],
    queryFn: () => knowledgeApi.getStatus(params.projectId, activeOrgId!),
    refetchInterval: (query) => {
      const analysisStatus = query.state.data?.data?.analysisStatus;
      return analysisStatus === "RUNNING" ? 3000 : false;
    },
    enabled: !!activeOrgId,
  });

  const status = statusResponse?.data;
  const analysisStatus = status?.analysisStatus;
  const isRunning = analysisStatus === "RUNNING";

  const handleAnalyze = async () => {
    if (!activeOrgId || isRunning) return;
    setIsTriggering(true);
    try {
      await knowledgeApi.analyze(params.projectId, activeOrgId);
    } catch (e) {
      console.error("Analyze failed", e);
    } finally {
      setIsTriggering(false);
    }
  };

  const handleForceAnalyze = async () => {
    if (!activeOrgId || isRunning) return;
    setIsTriggering(true);
    try {
      await knowledgeApi.forceAnalyze(params.projectId, activeOrgId);
    } catch (e) {
      console.error("Force analyze failed", e);
    } finally {
      setIsTriggering(false);
    }
  };

  const isButtonDisabled = isRunning || isTriggering;

  return (
    <div className="flex flex-col h-full">
      <ProjectTabs projectId={params.projectId} activeTab="architecture" />
      <div className="flex-1 p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Kiến trúc AI
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                AI phân tích codebase và duy trì tài liệu kiến trúc trên branch{" "}
                <code className="text-xs bg-gray-100 px-1 rounded">
                  ai/architecture
                </code>
                .
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleAnalyze}
                disabled={isButtonDisabled}
              >
                {isButtonDisabled ? (
                  <Loader className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="h-3 w-3 mr-1" />
                )}
                Phân tích lại
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleForceAnalyze}
                disabled={isButtonDisabled}
              >
                {isButtonDisabled ? (
                  <Loader className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="h-3 w-3 mr-1" />
                )}
                Phân tích lại toàn bộ
              </Button>
            </div>
          </div>

          {/* No org */}
          {!activeOrgId ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-gray-500">
                Chưa có tổ chức.
              </CardContent>
            </Card>
          ) : isLoading ? (
            <div className="flex justify-center py-16">
              <Loader className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {/* RUNNING — progress steps */}
              {isRunning && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Loader className="h-4 w-4 animate-spin text-blue-500" />
                      Đang phân tích...
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-2">
                      {ANALYSIS_STEPS.map((step, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <Loader className="h-3.5 w-3.5 animate-spin text-blue-400 flex-shrink-0" />
                          {step}
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              )}

              {/* FAILED — error state */}
              {analysisStatus === "FAILED" && (
                <Card className="border-red-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-red-700">
                          Phân tích thất bại
                        </p>
                        <p className="text-sm text-red-600 mt-1">
                          {status?.lastErrorMessage ||
                            "Phân tích thất bại. Vui lòng thử lại."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* PENDING / no data — initial state */}
              {(!analysisStatus || analysisStatus === "PENDING") && (
                <Card>
                  <CardContent className="p-0">
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <Network className="h-16 w-16 text-gray-300" />
                      <h3 className="mt-4 text-base font-medium text-gray-900">
                        Chưa có kiến trúc AI
                      </h3>
                      <p className="mt-2 text-sm text-gray-500 max-w-sm">
                        AI sẽ phân tích codebase và tạo tài liệu kiến trúc trên
                        branch{" "}
                        <code className="text-xs bg-gray-100 px-1 rounded">
                          ai/architecture
                        </code>
                        .
                      </p>
                      <Button
                        className="mt-6"
                        size="sm"
                        onClick={handleAnalyze}
                        disabled={isButtonDisabled}
                      >
                        {isButtonDisabled ? (
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                        ) : null}
                        Bắt đầu phân tích
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* COMPLETE / PARTIAL — document grid + results */}
              {(analysisStatus === "COMPLETE" ||
                analysisStatus === "PARTIAL") && (
                <>
                  {/* Up-to-date banner */}
                  {analysisStatus === "COMPLETE" &&
                    status?.alreadyUpToDate === true && (
                      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <p className="text-sm text-green-700">
                          Kiến trúc dự án đã được cập nhật. Không cần gọi AI.
                        </p>
                      </div>
                    )}

                  {/* Results panel */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Thông tin phân tích</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Trạng thái</span>
                        <span
                          className={`font-medium ${
                            analysisStatus === "COMPLETE"
                              ? "text-green-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {analysisStatus === "COMPLETE"
                            ? "Hoàn tất"
                            : "Một phần"}
                        </span>
                      </div>
                      {status?.lastAnalyzedCommit && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Commit</span>
                          <code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                            {status.lastAnalyzedCommit.slice(0, 7)}
                          </code>
                        </div>
                      )}
                      {status?.lastAnalyzedAt && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Phân tích lúc</span>
                          <span className="font-medium">
                            {new Date(status.lastAnalyzedAt).toLocaleString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Knowledge branch</span>
                        <code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                          ai/architecture
                        </code>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Document status grid */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Tài liệu kiến trúc
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                        {KNOWLEDGE_DOCUMENTS.map((doc) => {
                          const docStatus =
                            status?.documents?.[doc]?.status ?? null;
                          return (
                            <div
                              key={doc}
                              className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                            >
                              {docStatus === "complete" ? (
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              ) : docStatus === "not_applicable" ? (
                                <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                              )}
                              <span className="text-xs font-mono text-gray-700">
                                {doc}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
