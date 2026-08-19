import { apiClient } from "./client";

export interface ActivityLogEntry {
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
  projectId: string | null;
  issueId: string | null;
  taskId: string | null;
}

export const activityApi = {
  list: (organizationId: string, projectId?: string) => {
    const params = new URLSearchParams({ organizationId });
    if (projectId) params.set("projectId", projectId);
    return apiClient.get<ActivityLogEntry[]>(`/api/api/activity?${params.toString()}`);
  },
  listByTask: (taskId: string, organizationId: string) =>
    apiClient.get<ActivityLogEntry[]>(
      `/api/api/ai-tasks/${taskId}/logs?organizationId=${organizationId}`
    ),
};
