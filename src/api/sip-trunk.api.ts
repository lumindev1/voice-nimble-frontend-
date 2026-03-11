import { apiClient } from './client';

export interface SipTrunk {
  _id: string;
  shopId: string;
  shopDomain: string;
  name: string;
  description?: string;
  sipHost: string;
  sipPort: number;
  sipProtocol: 'udp' | 'tcp' | 'tls';
  sipUsername?: string;
  sipPassword?: string;
  sipRealm?: string;
  callerIdNumber: string;
  callerIdName?: string;
  jambonzCarrierSid?: string;
  jambonzGatewaySid?: string;
  isActive: boolean;
  isDefault: boolean;
  lastTestedAt?: string;
  testStatus?: 'success' | 'failed' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export const sipTrunkApi = {
  getAll: () => apiClient.get<{ success: boolean; trunks: SipTrunk[] }>('/sip-trunks'),
  getOne: (id: string) => apiClient.get<{ success: boolean; trunk: SipTrunk }>(`/sip-trunks/${id}`),
  create: (data: Partial<SipTrunk>) => apiClient.post<{ success: boolean; trunk: SipTrunk }>('/sip-trunks', data),
  update: (id: string, data: Partial<SipTrunk>) => apiClient.put<{ success: boolean; trunk: SipTrunk }>(`/sip-trunks/${id}`, data),
  delete: (id: string) => apiClient.delete<{ success: boolean }>(`/sip-trunks/${id}`),
  setDefault: (id: string) => apiClient.post<{ success: boolean; trunk: SipTrunk }>(`/sip-trunks/${id}/set-default`),
};
