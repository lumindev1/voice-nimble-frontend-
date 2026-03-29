import { apiClient } from './client';

export interface AgentConfig {
  _id: string;
  agentName: string;
  callType: 'inbound' | 'outbound';
  primaryLanguage: string;
  voiceGender: 'male' | 'female' | 'neutral';
  voiceId: string;
  voiceSpeed: number;
  ttsVendor: 'google' | 'elevenlabs';
  sttVendor: 'google';
  phoneNumber?: string;
  phoneNumberSid?: string;
  bringYourOwnNumber: boolean;
  byonPhoneNumber?: string;
  countryCode: string;
  stateCode?: string;
  legalBusinessName: string;
  businessDomain: string;
  agentRole: string;
  greetingMessage: string;
  goalDescription: string;
  informationToCollect: string[];
  extraInformationToShare: string;
  topicsToAvoid: string[];
  humanHandoffNumber?: string;
  isActive: boolean;
  isConfigured: boolean;
  createdAt: string;
}

export interface AgentVoice {
  id: string;
  name: string;
  language: string;
  gender: string;
  vendor?: string;
}

export const agentApi = {
  getAll: () =>
    apiClient.get<{ success: boolean; agents: AgentConfig[] }>('/agent'),

  get: (id: string) =>
    apiClient.get<{ success: boolean; agent: AgentConfig }>(`/agent/${id}`),

  create: (data: Partial<AgentConfig>) =>
    apiClient.post<{ success: boolean; agent: AgentConfig }>('/agent', data),

  update: (id: string, data: Partial<AgentConfig>) =>
    apiClient.put<{ success: boolean; agent: AgentConfig }>(`/agent/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<{ success: boolean }>(`/agent/${id}`),

  activate: (id: string) =>
    apiClient.post<{ success: boolean; agent: AgentConfig; message: string }>(`/agent/${id}/activate`),

  deactivate: (id: string) =>
    apiClient.post<{ success: boolean; agent: AgentConfig; message: string }>(`/agent/${id}/deactivate`),

  getVoices: () =>
    apiClient.get<{ success: boolean; voices: AgentVoice[] }>('/agent/voices'),

  getPhoneNumbers: () =>
    apiClient.get<{ success: boolean; phoneNumbers: string[] }>('/agent/phone-numbers'),

  provisionNumber: (agentId: string, phoneNumber: string) =>
    apiClient.post<{ success: boolean; phoneNumber: string; sid: string }>(`/agent/${agentId}/provision-number`, { phoneNumber }),
};
