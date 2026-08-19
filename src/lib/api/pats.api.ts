import { apiClient } from './client';

export interface PAT {
  id: string;
  name: string;
  tokenPrefix: string;
  scopes: string[];
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface CreatePATResponse {
  token: string;
  id: string;
  tokenPrefix: string;
  name: string;
  expiresAt: string | null;
  scopes: string[];
  createdAt: string;
}

export const patsApi = {
  list: () => apiClient.get<PAT[]>('/api/auth/tokens'),

  create: (name: string, expiresInDays?: number) =>
    apiClient.post<CreatePATResponse>('/api/auth/tokens', { name, expiresInDays }),

  revoke: (tokenId: string) => apiClient.delete(`/api/auth/tokens/${tokenId}`),
};
