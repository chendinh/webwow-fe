"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProjectTabs } from "@/components/layout/project-tabs";
import {
  Network,
  Loader2,
  RefreshCw,
  CheckCircle,
  CheckCircle2,
  Circle,
  XCircle,
} from "lucide-react";
import { knowledgeApi } from "@/lib/api/knowledge.api";
import { useOrgStore } from "@/stores/org.store";
import { cn } from "@/lib/utils/cn";

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
  const [forceOverride, setForceOverride] = useState(false);

  const { data: statusResponse, isLoading, refetch } = useQuery({
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
  const isRunning = analysisStatus === "RUNNING" && !forceOverride;

  const handleAnalyze = async () => {
    if (!activeOrgId) return;
    setIsTriggering(true);
    setForceOverride(false);
    try {
      await knowledgeApi.analyze(params.projectId, activeOrgId);
      await refetch();
    } catch (e) {
      console.error("Analyze failed", e);
    } finally {
      setIsTriggering(false);
    }
  };

  const handleForceAnalyze = async () => {
    if (!activeOrgId) return;
    setIsTriggering(true);
    setForceOverride(true);
    try {
      await knowledgeApi.forceAnalyze(params.projectId, activeOrgId);
      setForceOverride(false);
      await refetch();
    } catch (e) {
      console.error("Force analyze failed", e);
      setForceOverride(false);
    } finally {
      setIsTriggering(false);
    }
  };

  const isAnalyzeDisabled = isRunning || isTriggering;
  const isForceDisabled = isTriggering;

  return (
    <div className="flex flex-col h-full">
      <ProjectTabs projectId={params.projectId} activeTab="architecture" />
      <div className="flex-1 p-6">
        <div className="space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">
                Kiến trúc AI
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                AI phân tích codebase và duy trì tài liệu kiến trúc trên branch{" "}
                <code className="text-xs bg-white/10 text-sky-400 px-1 rounded">
                  ai/architecture
                </code>
                .
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzeDisabled}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzeDisabled && !isForceDisabled ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                Phân tích lại
              </button>
              <button
                onClick={handleForceAnalyze}
                disabled={isForceDisabled}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isForceDisabled ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                Phân tích lại toàn bộ
              </button>
            </div>
          </div>

          {/* No org */}
          {!activeOrgId ? (
            <div className="rounded-xl border border-white/5 bg-gray-900 p-8 text-center text-sm text-gray-600">
              Chưa có tổ chức.
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-gray-700" />
            </div>
          ) : (
            <>
              {/* RUNNING — progress steps */}
              {isRunning && (
                <div className="rounded-xl border border-white/5 bg-gray-900">
                  <div className="flex items-center gap-2 border-b border-white/5 px-5 py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
                    <h3 className="text-sm font-semibold text-gray-100">Đang phân tích...</h3>
                  </div>
                  <ol className="p-5 space-y-2.5">
                    {ANALYSIS_STEPS.map((step, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-sm text-gray-500"
                      >
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-500/60 flex-shrink-0" />
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* FAILED — error state */}
              {analysisStatus === "FAILED" && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-300">
                        Phân tích thất bại
                      </p>
                      <p className="text-sm text-red-400/80 mt-1">
                        {status?.lastErrorMessage ||
                          "Phân tích thất bại. Vui lòng thử lại."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* PENDING / no data — initial state */}
              {(!analysisStatus || analysisStatus === "PENDING") && (
                <div className="rounded-xl border border-white/5 bg-gray-900">
                  <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                    <Network className="h-14 w-14 text-gray-700" />
                    <h3 className="mt-4 text-base font-medium text-gray-200">
                      Chưa có kiến trúc AI
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 max-w-sm">
                      AI sẽ phân tích codebase và tạo tài liệu kiến trúc trên
                      branch{" "}
                      <code className="text-xs bg-white/10 text-sky-400 px-1 rounded">
                        ai/architecture
                      </code>
                      .
                    </p>
                    <button
                      className="mt-6 flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      onClick={handleAnalyze}
                      disabled={isAnalyzeDisabled}
                    >
                      {isAnalyzeDisabled && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      Bắt đầu phân tích
                    </button>
                  </div>
                </div>
              )}

              {/* COMPLETE / PARTIAL — document grid + results */}
              {(analysisStatus === "COMPLETE" || analysisStatus === "PARTIAL") && (
                <>
                  {/* Up-to-date banner */}
                  {analysisStatus === "COMPLETE" && status?.alreadyUpToDate === true && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <p className="text-sm text-emerald-400">
                        Kiến trúc dự án đã được cập nhật. Không cần gọi AI.
                      </p>
                    </div>
                  )}

                  {/* Results panel */}
                  <div className="rounded-xl border border-white/5 bg-gray-900">
                    <div className="border-b border-white/5 px-5 py-4">
                      <h3 className="text-sm font-semibold text-gray-100">Thông tin phân tích</h3>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Trạng thái</span>
                        <span
                          className={cn(
                            "font-medium",
                            analysisStatus === "COMPLETE"
                              ? "text-emerald-400"
                              : "text-amber-400"
                          )}
                        >
                          {analysisStatus === "COMPLETE" ? "Hoàn tất" : "Một phần"}
                        </span>
                      </div>
                      {status?.lastAnalyzedCommit && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Commit</span>
                          <code className="font-mono text-xs bg-white/5 text-gray-300 px-1.5 py-0.5 rounded">
                            {status.lastAnalyzedCommit.slice(0, 7)}
                          </code>
                        </div>
                      )}
                      {status?.lastAnalyzedAt && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Phân tích lúc</span>
                          <span className="font-medium text-gray-300">
                            {new Date(status.lastAnalyzedAt).toLocaleString("vi-VN")}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Knowledge branch</span>
                        <code className="font-mono text-xs bg-white/5 text-sky-400 px-1.5 py-0.5 rounded">
                          ai/architecture
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* Document status grid */}
                  <div className="rounded-xl border border-white/5 bg-gray-900">
                    <div className="border-b border-white/5 px-5 py-4">
                      <h3 className="text-sm font-semibold text-gray-100">Tài liệu kiến trúc</h3>
                    </div>
                    <div className="p-5">
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                        {KNOWLEDGE_DOCUMENTS.map((doc) => {
                          const docStatus = status?.documents?.[doc]?.status ?? null;
                          return (
                            <div
                              key={doc}
                              className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
                            >
                              {docStatus === "complete" ? (
                                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                              ) : docStatus === "not_applicable" ? (
                                <Circle className="h-4 w-4 text-gray-600 flex-shrink-0" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                              )}
                              <span className="text-xs font-mono text-gray-400">
                                {doc}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
