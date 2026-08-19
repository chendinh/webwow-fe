import { apiClient } from "./client";

export interface CreateIssueDto {
  title: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  type?: "BUG" | "FEATURE" | "TASK" | "IMPROVEMENT";
  assigneeId?: string;
}

export interface UpdateIssueDto extends Partial<CreateIssueDto> {
  status?: "OPEN" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CLOSED";
}

export const issuesApi = {
  create: (projectId: string, organizationId: string, data: CreateIssueDto) =>
    apiClient.post(
      `/issues?projectId=${projectId}&organizationId=${organizationId}`,
      data
    ),

  list: (projectId: string, organizationId: string) =>
    apiClient.get(
      `/issues?projectId=${projectId}&organizationId=${organizationId}`
    ),

  getById: (issueId: string, organizationId: string) =>
    apiClient.get(`/issues/${issueId}?organizationId=${organizationId}`),

  update: (
    issueId: string,
    organizationId: string,
    data: UpdateIssueDto
  ) =>
    apiClient.patch(
      `/issues/${issueId}?organizationId=${organizationId}`,
      data
    ),

  delete: (issueId: string, organizationId: string) =>
    apiClient.delete(`/issues/${issueId}?organizationId=${organizationId}`),

  addComment: (issueId: string, organizationId: string, content: string) =>
    apiClient.post(
      `/issues/${issueId}/comments?organizationId=${organizationId}`,
      { content }
    ),

  listComments: (issueId: string, organizationId: string) =>
    apiClient.get(
      `/issues/${issueId}/comments?organizationId=${organizationId}`
    ),
};
