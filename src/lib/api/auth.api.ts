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
    apiClient.post<LoginResponse>("/api/auth/login", { email, password }),

  register: (email: string, password: string, name?: string) =>
    apiClient.post<LoginResponse>("/api/auth/register", { email, password, name }),

  logout: (refreshToken: string) =>
    apiClient.post("/api/auth/logout", { refreshToken }),

  refresh: (refreshToken: string) =>
    apiClient.post<{ accessToken: string }>("/api/auth/refresh", { refreshToken }),

  forgotPassword: (email: string) =>
    apiClient.post("/api/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post("/api/auth/reset-password", { token, password }),

  tokenLogin: (token: string) =>
    apiClient.post<LoginResponse>("/api/auth/token-login", { token }),
};
