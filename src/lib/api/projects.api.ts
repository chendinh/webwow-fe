import { apiClient } from "./client";

export interface CreateProjectDto {
  name: string;
  description?: string;
  repositoryUrl?: string;
  repositoryOwner?: string;
  repositoryName?: string;
  defaultBranch?: string;
}

export interface HealthIssue {
  category: 'build' | 'lint' | 'type' | 'security' | 'dependency' | 'config';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  detail: string;
  filePath?: string;
  line?: number;
  suggestedFix?: string;
  canAutoFix: boolean;
}

export interface HealthCheckResult {
  projectId: string;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  issues: HealthIssue[];
  summary: string;
  scannedAt: string;
  durationMs: number;
}

export const projectsApi = {
  create: (organizationId: string, data: CreateProjectDto) =>
    apiClient.post(`/api/projects?organizationId=${organizationId}`, data),

  list: (organizationId: string) =>
    apiClient.get(`/api/projects?organizationId=${organizationId}`),

  getById: (projectId: string, organizationId: string) =>
    apiClient.get(`/api/projects/${projectId}?organizationId=${organizationId}`),

  getAnalysis: (projectId: string, organizationId: string) =>
    apiClient.get(
      `/api/projects/${projectId}/analysis?organizationId=${organizationId}`
    ),

  reanalyze: (projectId: string, organizationId: string) =>
    apiClient.post(
      `/api/projects/${projectId}/reanalyze?organizationId=${organizationId}`
    ),

  triggerHealthCheck: (projectId: string, organizationId: string) =>
    apiClient.post(
      `/api/projects/${projectId}/health-check?organizationId=${organizationId}`
    ),

  getHealthCheck: (projectId: string, organizationId: string) =>
    apiClient.get<{
      status: string | null;
      result: HealthCheckResult | null;
      checkedAt: string | null;
    }>(`/api/projects/${projectId}/health-check?organizationId=${organizationId}`),

  deployToMain: (projectId: string, organizationId: string) =>
    apiClient.post<{ prUrl: string; prNumber: number }>(
      `/api/projects/${projectId}/deploy-to-main?organizationId=${organizationId}`
    ),

  listRepos: (organizationId: string) =>
    apiClient.get(`/api/github/repos?organizationId=${organizationId}`),

  listBranches: (owner: string, repo: string, organizationId: string) =>
    apiClient.get(
      `/api/github/repos/${owner}/${repo}/branches?organizationId=${organizationId}`
    ),
};
