import { apiClient } from "./client";

export const approvalsApi = {
  approve: (issueId: string, organizationId: string, ipAddress?: string) =>
    apiClient.post(
      `/issues/${issueId}/approve?organizationId=${organizationId}`,
      { ipAddress }
    ),
  reject: (issueId: string, organizationId: string, reason: string) =>
    apiClient.post(
      `/issues/${issueId}/reject?organizationId=${organizationId}`,
      { reason }
    ),
};
