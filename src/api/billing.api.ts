import { apiClient } from './client';

export interface Plan {
  name: string;
  displayName: string;
  priceMonthly: number;
  includedMinutes: number;
  simultaneousCalls: number;
  overageRatePerMinute: number;
  hasAdvancedAnalytics: boolean;
  hasCallRecording: boolean;
  recordingRetentionDays: number;
}

export interface Subscription {
  planName: string;
  status: string;
  minutesUsed: number;
  minutesIncluded: number;
  overageMinutes: number;
  overageCost: number;
  billingCycleEnd?: string;
  simultaneousCalls: number;
  hasAdvancedAnalytics: boolean;
  hasCallRecording: boolean;
}

export const billingApi = {
  getPlans: () => apiClient.get<{ success: boolean; plans: Plan[] }>('/billing/plans'),
  getSubscription: () =>
    apiClient.get<{ success: boolean; subscription: Subscription }>('/billing/subscription'),
  subscribe: (planName: string) =>
    apiClient.post<{ success: boolean; confirmationUrl: string }>('/billing/subscribe', { planName }),
  cancel: () => apiClient.post('/billing/cancel'),
  getUsage: () => apiClient.get('/billing/usage'),
};
