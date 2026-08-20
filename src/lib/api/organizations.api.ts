import { apiClient } from "./client";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  usageCap: number;
  aiOutputLanguage: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationDto {
  name: string;
  slug?: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  githubInstallationId?: string;
  aiOutputLanguage?: string;
}

export const organizationsApi = {
  create: (data: CreateOrganizationDto) =>
    apiClient.post<Organization>("/api/organizations", data),

  list: () => apiClient.get<Organization[]>("/api/organizations"),

  getById: (organizationId: string) =>
    apiClient.get<Organization>(`/api/organizations/${organizationId}`),

  update: (organizationId: string, data: UpdateOrganizationDto) =>
    apiClient.patch<Organization>(`/api/organizations/${organizationId}`, data),

  delete: (organizationId: string) =>
    apiClient.delete(`/api/organizations/${organizationId}`),

  getMembers: (organizationId: string) =>
    apiClient.get(`/api/organizations/${organizationId}/members`),

  inviteMember: (
    organizationId: string,
    email: string,
    role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER"
  ) =>
    apiClient.post(`/api/organizations/${organizationId}/members`, { email, role }),

  updateMemberRole: (
    organizationId: string,
    memberId: string,
    role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER"
  ) =>
    apiClient.patch(`/api/organizations/${organizationId}/members/${memberId}`, {
      role,
    }),

  removeMember: (organizationId: string, memberId: string) =>
    apiClient.delete(
      `/api/organizations/${organizationId}/members/${memberId}`
    ),
};
