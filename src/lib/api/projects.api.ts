import { apiClient } from "./client";

export interface CreateProjectDto {
  name: string;
  description?: string;
  repositoryUrl?: string;
  repositoryOwner?: string;
  repositoryName?: string;
  defaultBranch?: string;
}

export const projectsApi = {
  create: (organizationId: string, data: CreateProjectDto) =>
    apiClient.post(`/api/api/projects?organizationId=${organizationId}`, data),

  list: (organizationId: string) =>
    apiClient.get(`/api/api/projects?organizationId=${organizationId}`),

  getById: (projectId: string, organizationId: string) =>
    apiClient.get(`/api/api/projects/${projectId}?organizationId=${organizationId}`),

  getAnalysis: (projectId: string, organizationId: string) =>
    apiClient.get(
      `/api/api/projects/${projectId}/analysis?organizationId=${organizationId}`
    ),

  reanalyze: (projectId: string, organizationId: string) =>
    apiClient.post(
      `/api/api/projects/${projectId}/reanalyze?organizationId=${organizationId}`
    ),

  listRepos: (organizationId: string) =>
    apiClient.get(`/api/github/repos?organizationId=${organizationId}`),

  listBranches: (owner: string, repo: string, organizationId: string) =>
    apiClient.get(
      `/api/github/repos/${owner}/${repo}/branches?organizationId=${organizationId}`
    ),
};
