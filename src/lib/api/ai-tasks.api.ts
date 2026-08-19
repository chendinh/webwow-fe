import { apiClient } from "./client";

export interface CreateAiTaskDto {
  type:
    | "CODE_GENERATION"
    | "CODE_REVIEW"
    | "BUG_FIX"
    | "REFACTOR"
    | "DOCUMENTATION"
    | "TEST_GENERATION";
  prompt: string;
  issueId?: string;
  projectId?: string;
  context?: Record<string, unknown>;
}

export const aiTasksApi = {
  create: (organizationId: string, data: CreateAiTaskDto) =>
    apiClient.post(`/ai-tasks?organizationId=${organizationId}`, data),

  list: (organizationId: string, projectId?: string) => {
    const params = new URLSearchParams({ organizationId });
    if (projectId) params.set("projectId", projectId);
    return apiClient.get(`/ai-tasks?${params.toString()}`);
  },

  getById: (taskId: string, organizationId: string) =>
    apiClient.get(`/ai-tasks/${taskId}?organizationId=${organizationId}`),

  getResult: (taskId: string, organizationId: string) =>
    apiClient.get(
      `/ai-tasks/${taskId}/result?organizationId=${organizationId}`
    ),

  retry: (taskId: string, organizationId: string) =>
    apiClient.post(
      `/ai-tasks/${taskId}/retry?organizationId=${organizationId}`
    ),

  cancel: (taskId: string, organizationId: string) =>
    apiClient.post(
      `/ai-tasks/${taskId}/cancel?organizationId=${organizationId}`
    ),
};
