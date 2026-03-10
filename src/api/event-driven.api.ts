import { apiClient } from './client';

export type TriggerEvent = 'order_placed' | 'order_fulfilled' | 'order_cancelled' | 'payment_received' | 'custom_webhook';

export interface EventDrivenConfig {
  _id: string;
  name: string;
  triggerEvent: TriggerEvent;
  templateId: string | { _id: string; name: string };
  agentId?: string | { _id: string; agentName: string; callType: string };
  fromNumber?: string;
  isActive: boolean;
  callCount: number;
  createdAt: string;
}

export const eventDrivenApi = {
  getAll: () =>
    apiClient.get<{ success: boolean; configs: EventDrivenConfig[] }>('/event-driven'),

  get: (id: string) =>
    apiClient.get<{ success: boolean; config: EventDrivenConfig }>(`/event-driven/${id}`),

  create: (data: {
    name: string;
    triggerEvent: TriggerEvent;
    templateId: string;
    agentId?: string;
    fromNumber?: string;
  }) =>
    apiClient.post<{ success: boolean; config: EventDrivenConfig }>('/event-driven', data),

  update: (id: string, data: Partial<EventDrivenConfig>) =>
    apiClient.put<{ success: boolean; config: EventDrivenConfig }>(`/event-driven/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<{ success: boolean }>(`/event-driven/${id}`),

  toggle: (id: string) =>
    apiClient.post<{ success: boolean; config: EventDrivenConfig }>(`/event-driven/${id}/toggle`),
};
