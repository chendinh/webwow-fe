"use client";

import { useEffect, useState } from "react";
import { ProjectTabs } from "@/components/layout/project-tabs";
import {
  GitPullRequest, ExternalLink, Loader2, Rocket,
  GitMerge, CheckCircle2, AlertTriangle, GitBranch,
} from "lucide-react";
import { projectsApi } from "@/lib/api/projects.api";
import { useOrgStore } from "@/stores/org.store";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PullRequest {
  id: string;
  githubPrNumber: number;
  title: string;
  status: string;
  githubPrUrl: string;
  branchName: string;
  mergedAt: string | null;
  closedAt: string | null;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  githubRepoFullName: string;
  defaultBranch: string;
  pullRequests?: PullRequest[];
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  OPEN:   { label: 'Open',   color: 'text-sky-300',     bg: 'bg-sky-500/10 border-sky-500/30' },
  MERGED: { label: 'Merged', color: 'text-violet-300',  bg: 'bg-violet-500/10 border-violet-500/30' },
  CLOSED: { label: 'Closed', color: 'text-gray-400',    bg: 'bg-gray-500/10 border-gray-500/30' },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectPullRequestsPage({
  params,
}: {
  params: { projectId: string };
}) {
  const activeOrgId = useOrgStore((s) => s.activeOrgId);
  const [project, setProject] = useState<Project | null>(null);
  const [prs, setPrs] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<{ prUrl: string; prNumber: number } | null>(null);
  const [deployError, setDeployError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeOrgId) { setLoading(false); return; }
    setLoading(true);
    projectsApi
      .getById(params.projectId, activeOrgId)
      .then((res) => {
        const p = res.data as Project;
        setProject(p);
        setPrs(p.pullRequests ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeOrgId, params.projectId]);

  const handleDeploy = async () => {
    if (!activeOrgId) return;
    setDeploying(true);
    setDeployError(null);
    setDeployResult(null);
    try {
      const res = await projectsApi.deployToMain(params.projectId, activeOrgId);
      setDeployResult(res.data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setDeployError(msg ?? 'Không thể tạo deploy PR. Kiểm tra nhánh ai/main đã có thay đổi chưa.');
    } finally {
      setDeploying(false);
    }
  };

  const openPrs = prs.filter(p => p.status === 'OPEN');
  const mergedPrs = prs.filter(p => p.status === 'MERGED');

  return (
    <div className="flex flex-col h-full">
      <ProjectTabs projectId={params.projectId} activeTab="pull-requests" />

      <div className="flex-1 p-6 space-y-6">

        {/* ── Deploy to Main ── */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Rocket className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-emerald-300">Deploy to Main</h2>
              </div>
              <p className="mt-1 text-xs text-gray-400 max-w-lg">
                Tất cả các task AI đã hoàn thành được tích lũy trong nhánh staging{' '}
                <span className="font-mono text-sky-400">ai/main</span>.
                Bấm để tạo một Pull Request merge tất cả thay đổi vào{' '}
                <span className="font-mono text-emerald-400">
                  {project?.defaultBranch ?? 'main'}
                </span>.
              </p>
              <p className="mt-1 text-xs text-gray-600">
                💡 Nhiều nền tảng như Vercel, Netlify sẽ tự động deploy khi{' '}
                {project?.defaultBranch ?? 'main'} thay đổi.
              </p>
            </div>
            <button
              onClick={handleDeploy}
              disabled={deploying}
              className="flex-shrink-0 flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-60 transition-colors"
            >
              {deploying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <GitMerge className="h-4 w-4" />
              )}
              {deploying ? 'Đang tạo PR…' : 'Deploy to Main'}
            </button>
          </div>

          {/* Deploy result */}
          {deployResult && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-emerald-300 font-medium">
                  PR #{deployResult.prNumber} đã được tạo!
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Review và merge PR để deploy lên production.
                </p>
              </div>
              <a
                href={deployResult.prUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 transition-colors"
              >
                Xem PR <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {deployError && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
              <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{deployError}</p>
            </div>
          )}

          {/* Staging branch info */}
          <div className="mt-4 flex items-center gap-3 text-xs text-gray-500">
            <GitBranch className="h-3.5 w-3.5" />
            <span>
              Nhánh staging:{' '}
              <span className="font-mono text-sky-400">ai/main</span>
              {' '}→{' '}
              <span className="font-mono text-emerald-400">{project?.defaultBranch ?? 'main'}</span>
            </span>
            {mergedPrs.length > 0 && (
              <span className="text-gray-600">
                · {mergedPrs.length} task đã merge vào staging
              </span>
            )}
          </div>
        </div>

        {/* ── PR List ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">Pull Requests</h2>
            <span className="text-xs text-gray-500">{prs.length} tổng cộng</span>
          </div>

          {!activeOrgId ? (
            <div className="rounded-xl border border-white/5 bg-gray-900 p-8 text-center text-sm text-gray-500">
              Chưa có tổ chức.
            </div>
          ) : loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-gray-700" />
            </div>
          ) : prs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-16 text-center">
              <GitPullRequest className="h-12 w-12 text-gray-700" />
              <h3 className="mt-4 text-sm font-medium text-gray-400">Chưa có Pull Request nào</h3>
              <p className="mt-1 text-xs text-gray-600">
                PR sẽ được tự động tạo khi AI hoàn thành một task.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-white/5 bg-gray-900 overflow-hidden">
              {/* Open PRs first, then merged */}
              {[...openPrs, ...prs.filter(p => p.status !== 'OPEN')].map((pr) => {
                const sc = STATUS_CONFIG[pr.status] ?? STATUS_CONFIG.OPEN;
                return (
                  <div
                    key={pr.id}
                    className="flex items-start gap-4 px-5 py-4 border-b border-white/5 last:border-0"
                  >
                    <GitPullRequest className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                      pr.status === 'MERGED' ? 'text-violet-400' : 'text-gray-500'
                    }`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-gray-200 truncate">
                          #{pr.githubPrNumber} {pr.title}
                        </p>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${sc.color} ${sc.bg}`}>
                          {sc.label}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-gray-500">
                          Branch: <span className="font-mono text-sky-400">{pr.branchName}</span>
                        </span>
                        {pr.status === 'MERGED' && (
                          <span className="text-xs text-violet-400/70">
                            ✓ Merged into ai/main
                          </span>
                        )}
                        <span className="text-xs text-gray-700">
                          {new Date(pr.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>
                    {pr.githubPrUrl && (
                      <a
                        href={pr.githubPrUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 text-sky-400 hover:text-sky-300 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
