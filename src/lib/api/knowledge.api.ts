import { apiClient } from './client';

// ─── Types ────────────────────────────────────────────────────────────────────

export type KnowledgeDocumentStatus = 'complete' | 'not_applicable' | 'failed';
export type KnowledgeAnalysisStatus = 'PENDING' | 'RUNNING' | 'COMPLETE' | 'PARTIAL' | 'FAILED';

export interface KnowledgeStatusResponse {
  analysisStatus: KnowledgeAnalysisStatus;
  lastAnalyzedCommit: string | null;
  lastAnalyzedAt: string | null;
  lastErrorMessage: string | null;
  alreadyUpToDate?: boolean;
  documents?: Record<string, { status: KnowledgeDocumentStatus }>;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const knowledgeApi = {
  analyze: (projectId: string, organizationId: string) =>
    apiClient.post<{ message: string }>(
      `/projects/${projectId}/knowledge/analyze?organizationId=${organizationId}`,
    ),

  forceAnalyze: (projectId: string, organizationId: string) =>
    apiClient.post<{ message: string }>(
      `/projects/${projectId}/knowledge/force-analyze?organizationId=${organizationId}`,
    ),

  getStatus: (projectId: string, organizationId: string) =>
    apiClient.get<KnowledgeStatusResponse>(
      `/projects/${projectId}/knowledge/status?organizationId=${organizationId}`,
    ),
};
