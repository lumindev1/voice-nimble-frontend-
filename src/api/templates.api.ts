import { apiClient } from './client';

export interface CallTemplate {
  _id: string;
  name: string;
  type: 'static' | 'ai';
  aiContentType?: 'text' | 'audio';
  text?: string;
  audioUrl?: string;
  createdAt: string;
}

export const templatesApi = {
  getAll: () =>
    apiClient.get<{ success: boolean; templates: CallTemplate[] }>('/templates'),

  get: (id: string) =>
    apiClient.get<{ success: boolean; template: CallTemplate }>(`/templates/${id}`),

  create: (data: Omit<CallTemplate, '_id' | 'createdAt'>) =>
    apiClient.post<{ success: boolean; template: CallTemplate }>('/templates', data),

  update: (id: string, data: Partial<CallTemplate>) =>
    apiClient.put<{ success: boolean; template: CallTemplate }>(`/templates/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<{ success: boolean }>(`/templates/${id}`),
};
