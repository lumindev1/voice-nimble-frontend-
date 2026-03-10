import { apiClient } from './client';

export interface Call {
  _id: string;
  callSid: string;
  status: string;
  callerNumber: string;
  calledNumber: string;
  duration: number;
  startedAt?: string;
  endedAt?: string;
  hasRecording: boolean;
  hasTranscript: boolean;
  wasTransferred: boolean;
  sentiment: 'positive' | 'neutral' | 'negative' | 'unknown';
  intentDetected?: string;
  createdAt: string;
}

export interface Transcript {
  _id: string;
  messages: Array<{ role: string; content: string; timestamp: string }>;
  fullText: string;
  summary?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export const callsApi = {
  list: (page = 1, limit = 20, status?: string) =>
    apiClient.get<{ success: boolean; calls: Call[]; pagination: Pagination }>(
      `/calls?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`,
    ),
  get: (id: string) => apiClient.get<{ success: boolean; call: Call }>(`/calls/${id}`),
  getTranscript: (id: string) =>
    apiClient.get<{ success: boolean; transcript: Transcript }>(`/calls/${id}/transcript`),
  getRecordingUrl: (id: string) =>
    apiClient.get<{ success: boolean; recordingUrl: string }>(`/calls/${id}/recording`),
  makeOutbound: (to: string, from?: string) =>
    apiClient.post<{ success: boolean; callSid: string }>('/calls/outbound', { to, from }),
};
