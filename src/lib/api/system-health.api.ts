import { apiClient } from './client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SystemIssue {
  id: string;
  errorType: string;
  errorMessage: string;
  framework: string | null;
  occurrences: number;
  lastSeen: string; // ISO date string
  status: 'open' | 'resolved';
  solution: string | null;
  organizationId: string;
  projectId: string | null;
  taskId: string | null;
  createdAt: string;
}

export interface FailurePattern {
  id: string;
  errorType: string;
  framework: string | null;
  solution: string;
  occurrences: number;
  successRate: number;
  lastApplied: string;
  createdAt: string;
}

export interface IssueStats {
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  resolutionRate: number;
  totalThisWeek: number;
  mostCommonErrorType: string | null;
  avgFixAttempts: number;
  byErrorType: Array<{ errorType: string; count: number }>;
  byFramework: Array<{ framework: string; count: number }>;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const systemHealthApi = {
  getIssues: (
    organizationId: string,
    params?: { status?: 'open' | 'resolved'; errorType?: string; framework?: string },
  ) => {
    const query = new URLSearchParams({ organizationId });
    if (params?.status) query.set('status', params.status);
    if (params?.errorType) query.set('errorType', params.errorType);
    if (params?.framework) query.set('framework', params.framework);
    return apiClient.get<SystemIssue[]>(`/system/issues?${query.toString()}`);
  },

  getStats: (organizationId: string) =>
    apiClient.get<IssueStats>(`/system/issues/stats?organizationId=${organizationId}`),

  resolveIssue: (id: string, solution: string) =>
    apiClient.post<{ success: true; message: string }>(
      `/system/issues/${id}/resolve`,
      { solution },
    ),

  getPatterns: () => apiClient.get<FailurePattern[]>('/system/patterns'),
};
