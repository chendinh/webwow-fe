"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectTabs } from "@/components/layout/project-tabs";
import { Button } from "@/components/ui/button";
import { Network, Loader, RefreshCw } from "lucide-react";
import { projectsApi } from "@/lib/api/projects.api";
import { useOrgStore } from "@/stores/org.store";

interface ProjectAnalysis {
  id: string;
  primaryLanguage: string | null;
  frameworks: string[];
  dependencies: string[];
  services: string[];
  apiEndpoints: number | null;
  summary: string | null;
  analyzedAt: string;
}

export default function ProjectArchitecturePage({
  params,
}: {
  params: { projectId: string };
}) {
  const activeOrgId = useOrgStore((s) => s.activeOrgId);
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    if (!activeOrgId) return;
    setError(null);
    try {
      const res = await projectsApi.getAnalysis(params.projectId, activeOrgId);
      setAnalysis(res.data as ProjectAnalysis);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status !== 404) {
        setError("Không thể tải dữ liệu phân tích.");
      }
      // 404 means not analyzed yet — that's fine
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!activeOrgId) {
      setLoading(false);
      return;
    }
    fetchAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOrgId, params.projectId]);

  const handleReanalyze = async () => {
    if (!activeOrgId) return;
    setReanalyzing(true);
    try {
      await projectsApi.reanalyze(params.projectId, activeOrgId);
      // Poll briefly then reload
      setTimeout(() => {
        fetchAnalysis().finally(() => setReanalyzing(false));
      }, 3000);
    } catch (e) {
      console.error("Reanalyze failed", e);
      setReanalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ProjectTabs projectId={params.projectId} activeTab="architecture" />
      <div className="flex-1 p-6">
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Sơ đồ kiến trúc</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                AI phân tích và trực quan hóa kiến trúc hệ thống từ codebase.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReanalyze}
              disabled={reanalyzing || loading}
            >
              {reanalyzing ? (
                <Loader className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1" />
              )}
              Phân tích lại
            </Button>
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
          ) : error ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-red-500">
                {error}
              </CardContent>
            </Card>
          ) : !analysis ? (
            <Card>
              <CardContent className="p-0">
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Network className="h-16 w-16 text-gray-300" />
                  <h3 className="mt-4 text-base font-medium text-gray-900">
                    Chưa có dữ liệu kiến trúc
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 max-w-sm">
                    AI sẽ tự động phân tích codebase và tạo sơ đồ kiến trúc sau khi dự án
                    được kết nối và đồng bộ.
                  </p>
                  <Button className="mt-4" size="sm" onClick={handleReanalyze} disabled={reanalyzing}>
                    {reanalyzing ? (
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    Bắt đầu phân tích
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Summary */}
              {analysis.summary && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tổng quan kiến trúc</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {analysis.summary}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Stats */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-gray-900">
                      {analysis.services?.length ?? 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {analysis.services?.length > 0
                        ? analysis.services.join(", ")
                        : "Không phát hiện microservice"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Dependencies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-gray-900">
                      {analysis.dependencies?.length ?? 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {analysis.frameworks?.length > 0
                        ? `Frameworks: ${analysis.frameworks.join(", ")}`
                        : "Thư viện và phụ thuộc"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">APIs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-gray-900">
                      {analysis.apiEndpoints ?? 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Endpoints được phát hiện</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tech stack */}
              {(analysis.primaryLanguage || (analysis.frameworks?.length > 0)) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tech Stack</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysis.primaryLanguage && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Ngôn ngữ chính</span>
                        <span className="font-medium">{analysis.primaryLanguage}</span>
                      </div>
                    )}
                    {analysis.frameworks?.length > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Frameworks</span>
                        <span className="font-medium">{analysis.frameworks.join(", ")}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Phân tích lúc</span>
                      <span className="font-medium">
                        {new Date(analysis.analyzedAt).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
