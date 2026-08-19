import { apiClient } from "./client";

export interface AITask {
  id: string;
  organizationId: string;
  projectId: string;
  issueId: string;
  status: string;
  currentStep: string | null;
  branchName: string | null;
  filesChanged: string[];
  testResult: { passed: boolean; output: string; attemptNumber: number } | null;
  buildResult: {
    preflightIssues?: string;
    autoFixed?: boolean;
    requiresUserApproval?: boolean;
    errorSummary?: string;
  } | null;
  reviewSummary: string | null;
  actualTokens: number;
  actualCost: number;
  preflightApproved: boolean;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
  failedAt: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  eventType: string;
  agentType: string | null;
  tokensUsed: number | null;
  estimatedCost: number | null;
  durationMs: number | null;
  friendlyMessage: string;
  technicalDetail: unknown;
  oldStatus: string | null;
  newStatus: string | null;
  actorId: string | null;
  createdAt: string;
}

export const aiTasksApi = {
  list: (organizationId: string, projectId?: string) => {
    const params = new URLSearchParams({ organizationId });
    if (projectId) params.set("projectId", projectId);
    return apiClient.get<AITask[]>(`/api/api/ai-tasks?${params.toString()}`);
  },

  getById: (taskId: string, organizationId: string) =>
    apiClient.get<AITask>(`/api/api/ai-tasks/${taskId}?organizationId=${organizationId}`),

  getLogs: (taskId: string, organizationId: string) =>
    apiClient.get<ActivityLog[]>(`/api/api/ai-tasks/${taskId}/logs?organizationId=${organizationId}`),

  cancel: (taskId: string, organizationId: string) =>
    apiClient.post<AITask>(`/api/api/ai-tasks/${taskId}/cancel?organizationId=${organizationId}`),

  resume: (taskId: string, organizationId: string) =>
    apiClient.post<AITask>(`/api/api/ai-tasks/${taskId}/resume?organizationId=${organizationId}`),
};
