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
      `/api/api/projects/${projectId}/issues?organizationId=${organizationId}`,
      data
    ),

  list: (projectId: string, organizationId: string) =>
    apiClient.get(
      `/api/api/projects/${projectId}/issues?organizationId=${organizationId}`
    ),

  getById: (projectId: string, issueId: string, organizationId: string) =>
    apiClient.get(
      `/api/api/projects/${projectId}/issues/${issueId}?organizationId=${organizationId}`
    ),

  update: (
    projectId: string,
    issueId: string,
    organizationId: string,
    data: UpdateIssueDto
  ) =>
    apiClient.patch(
      `/api/api/projects/${projectId}/issues/${issueId}?organizationId=${organizationId}`,
      data
    ),

  delete: (projectId: string, issueId: string, organizationId: string) =>
    apiClient.delete(
      `/api/api/projects/${projectId}/issues/${issueId}?organizationId=${organizationId}`
    ),

  addComment: (projectId: string, issueId: string, organizationId: string, content: string) =>
    apiClient.post(
      `/api/api/projects/${projectId}/issues/${issueId}/comments?organizationId=${organizationId}`,
      { content }
    ),

  listComments: (projectId: string, issueId: string, organizationId: string) =>
    apiClient.get(
      `/api/api/projects/${projectId}/issues/${issueId}/comments?organizationId=${organizationId}`
    ),
};
