import { apiClient } from "./client";

export interface CreateOrganizationDto {
  name: string;
  slug?: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  githubInstallationId?: string;
}

export const organizationsApi = {
  create: (data: CreateOrganizationDto) =>
    apiClient.post("/organizations", data),

  list: () => apiClient.get("/organizations"),

  getById: (organizationId: string) =>
    apiClient.get(`/organizations/${organizationId}`),

  update: (organizationId: string, data: UpdateOrganizationDto) =>
    apiClient.patch(`/organizations/${organizationId}`, data),

  delete: (organizationId: string) =>
    apiClient.delete(`/organizations/${organizationId}`),

  getMembers: (organizationId: string) =>
    apiClient.get(`/organizations/${organizationId}/members`),

  inviteMember: (
    organizationId: string,
    email: string,
    role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER"
  ) =>
    apiClient.post(`/organizations/${organizationId}/members`, { email, role }),

  updateMemberRole: (
    organizationId: string,
    memberId: string,
    role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER"
  ) =>
    apiClient.patch(`/organizations/${organizationId}/members/${memberId}`, {
      role,
    }),

  removeMember: (organizationId: string, memberId: string) =>
    apiClient.delete(
      `/organizations/${organizationId}/members/${memberId}`
    ),
};
