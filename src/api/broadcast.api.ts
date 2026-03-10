import { apiClient } from './client';

export interface Broadcast {
  _id: string;
  title: string;
  templateId: string | { _id: string; name: string; type: string };
  agentId?: string;
  contactIds: string[];
  tags: string[];
  scheduledAt?: string;
  timezone: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  totalContacts: number;
  calledCount: number;
  successCount: number;
  failedCount: number;
  createdAt: string;
}

export const broadcastApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    apiClient.get<{ success: boolean; broadcasts: Broadcast[]; pagination: { page: number; limit: number; total: number; pages: number } }>('/broadcast', { params }),

  get: (id: string) =>
    apiClient.get<{ success: boolean; broadcast: Broadcast }>(`/broadcast/${id}`),

  create: (data: {
    title: string;
    templateId: string;
    agentId?: string;
    tags?: string[];
    contactIds?: string[];
    scheduledAt?: string;
    timezone?: string;
  }) =>
    apiClient.post<{ success: boolean; broadcast: Broadcast }>('/broadcast', data),

  delete: (id: string) =>
    apiClient.delete<{ success: boolean }>(`/broadcast/${id}`),

  cancel: (id: string) =>
    apiClient.post<{ success: boolean; broadcast: Broadcast }>(`/broadcast/${id}/cancel`),
};
