import { apiClient } from './client';

export interface Contact {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  tags: string[];
  createdAt: string;
}

export interface ContactsResponse {
  contacts: Contact[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export const contactsApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; tag?: string }) =>
    apiClient.get<{ success: boolean; contacts: Contact[]; pagination: ContactsResponse['pagination'] }>('/contacts', { params }),

  create: (data: { name: string; phone: string; email?: string; tags?: string[] }) =>
    apiClient.post<{ success: boolean; contact: Contact }>('/contacts', data),

  update: (id: string, data: Partial<Contact>) =>
    apiClient.put<{ success: boolean; contact: Contact }>(`/contacts/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<{ success: boolean }>(`/contacts/${id}`),

  bulkDelete: (ids: string[]) =>
    apiClient.delete<{ success: boolean }>('/contacts/bulk', { data: { ids } }),

  import: (contacts: Array<{ name: string; phone: string; email?: string; tags?: string[] }>) =>
    apiClient.post<{ success: boolean; count: number }>('/contacts/import', { contacts }),

  getTags: () =>
    apiClient.get<{ success: boolean; tags: string[] }>('/contacts/tags'),
};
