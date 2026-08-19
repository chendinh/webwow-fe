"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/layout/topbar";
import { FolderOpen, Plus, Loader } from "lucide-react";
import { projectsApi } from "@/lib/api/projects.api";
import { useOrgStore } from "@/stores/org.store";

interface Project {
  id: string;
  name: string;
  description: string | null;
  githubRepoFullName: string;
  defaultBranch: string;
  status: string;
  createdAt: string;
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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const activeOrgId = useOrgStore((s) => s.activeOrgId);

  useEffect(() => {
    if (!activeOrgId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    projectsApi
      .list(activeOrgId)
      .then((res) => setProjects((res.data as Project[]) ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeOrgId]);

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Dự án" />
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Tất cả dự án</h2>
            <p className="text-sm text-gray-500 mt-1">
              Quản lý các dự án phần mềm của bạn
            </p>
          </div>
          <Link href="/projects/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo dự án
            </Button>
          </Link>
        </div>

        {!activeOrgId ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-gray-500">
              Chưa có tổ chức. Vui lòng tạo tổ chức trước.
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="flex justify-center py-16">
            <Loader className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FolderOpen className="h-14 w-14 text-gray-300" />
                <h3 className="mt-4 text-base font-medium text-gray-900">
                  Chưa có dự án nào
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Bắt đầu bằng cách kết nối một repository GitHub.
                </p>
                <Link href="/projects/new" className="mt-4">
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo dự án đầu tiên
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Link key={p.id} href={`/projects/${p.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {p.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {p.githubRepoFullName}
                        </p>
                        {p.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {p.description}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={STATUS_VARIANTS[p.status] ?? "secondary"}
                        className="text-xs flex-shrink-0"
                      >
                        {STATUS_LABELS[p.status] ?? p.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">
                      Branch: {p.defaultBranch}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
