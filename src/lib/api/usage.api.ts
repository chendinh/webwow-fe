import { apiClient } from "./client";

export interface UsageSummary {
  organizationId: string;
  year: number;
  month: number;
  totalTasks: number;
  totalTokens: number;
  customerCost: number;
}

export const usageApi = {
  getCurrent: (organizationId: string) =>
    apiClient.get<UsageSummary>(`/api/usage?organizationId=${organizationId}`),
  getHistory: (organizationId: string) =>
    apiClient.get<UsageSummary[]>(`/api/usage/history?organizationId=${organizationId}`),
};
