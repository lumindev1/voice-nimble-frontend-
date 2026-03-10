import { apiClient } from './client';

export interface DashboardData {
  totalCalls: number;
  recentCalls: number;
  averageDuration: number;
  todayCalls: number;
  todayPositive: number;
  todayNegative: number;
  dailyTrend: Array<{
    date: string;
    calls: number;
    duration: number;
    positive: number;
    negative: number;
  }>;
}

export const analyticsApi = {
  getDashboard: () =>
    apiClient.get<{ success: boolean; dashboard: DashboardData }>('/analytics/dashboard'),
  getDaily: (date?: string) =>
    apiClient.get(`/analytics/daily${date ? `?date=${date}` : ''}`),
  getWeekly: () => apiClient.get('/analytics/weekly'),
  getMonthly: (month?: string) =>
    apiClient.get(`/analytics/monthly${month ? `?month=${month}` : ''}`),
};
