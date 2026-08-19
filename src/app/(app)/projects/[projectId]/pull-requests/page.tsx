"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectTabs } from "@/components/layout/project-tabs";
import { GitPullRequest, ExternalLink, Loader } from "lucide-react";
import { projectsApi } from "@/lib/api/projects.api";
import { useOrgStore } from "@/stores/org.store";

interface PullRequest {
  id: string;
  number: number;
  title: string;
  state: string;
  htmlUrl: string;
  branchName: string;
  createdAt: string;
  mergedAt: string | null;
  closedAt: string | null;
  taskId: string | null;
}

const PR_STATUS_LABELS: Record<string, string> = {
  open: "Đang mở",
  merged: "Đã merge",
  closed: "Đã đóng",
};

const PR_STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "success" | "destructive"
> = {
  open: "default",
  merged: "success",
  closed: "destructive",
};

export default function ProjectPullRequestsPage({
  params,
}: {
  params: { projectId: string };
}) {
  const activeOrgId = useOrgStore((s) => s.activeOrgId);
  const [prs, setPrs] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeOrgId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    // Pull requests are fetched via project analysis data or a dedicated endpoint
    // Using getAnalysis to retrieve any PR data embedded in project analysis
    projectsApi
      .getById(params.projectId, activeOrgId)
      .then((res) => {
        // Check if the project data has embedded pull requests
        const project = res.data as { pullRequests?: PullRequest[] };
        if (project.pullRequests) {
          setPrs(project.pullRequests);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeOrgId, params.projectId]);

  return (
    <div className="flex flex-col h-full">
      <ProjectTabs projectId={params.projectId} activeTab="pull-requests" />
      <div className="flex-1 p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Pull Requests</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Các Pull Request được tạo tự động bởi AI.
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
        ) : prs.length === 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <GitPullRequest className="h-14 w-14 text-gray-300" />
                <h3 className="mt-4 text-base font-medium text-gray-900">
                  Chưa có Pull Request nào
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Pull Requests sẽ được tự động tạo khi AI hoàn thành một task.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-gray-100">
                {prs.map((pr) => (
                  <li key={pr.id} className="flex items-start gap-4 px-5 py-4">
                    <GitPullRequest className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          #{pr.number} {pr.title}
                        </p>
                        <Badge
                          variant={PR_STATUS_VARIANTS[pr.state] ?? "secondary"}
                          className="text-xs flex-shrink-0"
                        >
                          {PR_STATUS_LABELS[pr.state] ?? pr.state}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Branch: {pr.branchName}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(pr.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                    {pr.htmlUrl && (
                      <a
                        href={pr.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
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
