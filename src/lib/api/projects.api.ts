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
    apiClient.post(`/projects?organizationId=${organizationId}`, data),

  list: (organizationId: string) =>
    apiClient.get(`/projects?organizationId=${organizationId}`),

  getById: (projectId: string, organizationId: string) =>
    apiClient.get(`/projects/${projectId}?organizationId=${organizationId}`),

  getAnalysis: (projectId: string, organizationId: string) =>
    apiClient.get(
      `/projects/${projectId}/analysis?organizationId=${organizationId}`
    ),

  reanalyze: (projectId: string, organizationId: string) =>
    apiClient.post(
      `/projects/${projectId}/reanalyze?organizationId=${organizationId}`
    ),

  listRepos: (organizationId: string) =>
    apiClient.get(`/github/repos?organizationId=${organizationId}`),

  listBranches: (owner: string, repo: string, organizationId: string) =>
    apiClient.get(
      `/github/repos/${owner}/${repo}/branches?organizationId=${organizationId}`
    ),
};
