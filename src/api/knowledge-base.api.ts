import { apiClient } from './client';

export interface KBDocument {
  _id?: string;
  title: string;
  sourceType: 'pdf' | 'text' | 'url';
  content?: string;
  fileUrl?: string;
  sourceUrl?: string;
  createdAt: string;
}

export interface KnowledgeBase {
  _id: string;
  name: string;
  documents: KBDocument[];
  createdAt: string;
}

export const knowledgeBaseApi = {
  getAll: () =>
    apiClient.get<{ success: boolean; knowledgeBases: KnowledgeBase[] }>('/knowledge-base'),

  get: (id: string) =>
    apiClient.get<{ success: boolean; knowledgeBase: KnowledgeBase }>(`/knowledge-base/${id}`),

  create: (name: string) =>
    apiClient.post<{ success: boolean; knowledgeBase: KnowledgeBase }>('/knowledge-base', { name }),

  update: (id: string, name: string) =>
    apiClient.put<{ success: boolean; knowledgeBase: KnowledgeBase }>(`/knowledge-base/${id}`, { name }),

  delete: (id: string) =>
    apiClient.delete<{ success: boolean }>(`/knowledge-base/${id}`),

  addDocument: (kbId: string, doc: Omit<KBDocument, '_id' | 'createdAt'>) =>
    apiClient.post<{ success: boolean; knowledgeBase: KnowledgeBase }>(`/knowledge-base/${kbId}/documents`, doc),

  deleteDocument: (kbId: string, docId: string) =>
    apiClient.delete<{ success: boolean; knowledgeBase: KnowledgeBase }>(`/knowledge-base/${kbId}/documents/${docId}`),
};
