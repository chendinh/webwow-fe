import { apiClient } from "./client";

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    emailVerified: boolean;
  };
}

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<LoginResponse>("/auth/login", { email, password }),

  register: (email: string, password: string, name?: string) =>
    apiClient.post<LoginResponse>("/auth/register", { email, password, name }),

  logout: (refreshToken: string) =>
    apiClient.post("/auth/logout", { refreshToken }),

  refresh: (refreshToken: string) =>
    apiClient.post<{ accessToken: string }>("/auth/refresh", { refreshToken }),

  forgotPassword: (email: string) =>
    apiClient.post("/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post("/auth/reset-password", { token, password }),
};
