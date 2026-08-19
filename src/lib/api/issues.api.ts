import { apiClient } from "./client";

export interface CreateIssueDto {
  title: string;
  description: string;
  type: "BUG" | "FEATURE" | "REFACTOR" | "PERFORMANCE" | "SECURITY" | "DEPENDENCY" | "OTHER";
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
}

export interface ImplementationOption {
  id: string
  title: string
  plainTitle: string
  description: string
  plainDescription: string
  pros: string[]
  cons: string[]
  complexity: 'LOW' | 'MEDIUM' | 'HIGH'
  estimatedMinutes: number
  affectedFiles: string[]
  recommended: boolean
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  projectId: string;
  organizationId: string;
  createdById: string;
  aiDiagnosis: string | null;
  plainDiagnosis: string | null;
  implementationOptions: ImplementationOption[] | null;
  selectedOptionId: string | null;
  clarifyingQuestions: string[] | null;
  implementationPlan: string | null;
  estimatedTokens: number | null;
  estimatedCost: number | null;
  estimatedMinutes: number | null;
  createdAt: string;
  updatedAt: string;
}

export const issuesApi = {
  create: (projectId: string, organizationId: string, data: CreateIssueDto) =>
    apiClient.post<Issue>(
      `/api/api/projects/${projectId}/issues?organizationId=${organizationId}`,
      data
    ),

  list: (projectId: string, organizationId: string) =>
    apiClient.get<Issue[]>(
      `/api/api/projects/${projectId}/issues?organizationId=${organizationId}`
    ),

  getById: (projectId: string, issueId: string, organizationId: string) =>
    apiClient.get<Issue>(
      `/api/api/projects/${projectId}/issues/${issueId}?organizationId=${organizationId}`
    ),

  selectOption: (projectId: string, issueId: string, organizationId: string, optionId: string) =>
    apiClient.post<Issue>(
      `/api/api/projects/${projectId}/issues/${issueId}/select-option?organizationId=${organizationId}`,
      { optionId }
    ),

  delete: (projectId: string, issueId: string, organizationId: string) =>
    apiClient.delete(
      `/api/api/projects/${projectId}/issues/${issueId}?organizationId=${organizationId}`
    ),
};
