import { apiClient } from './client';

export interface NotificationSettings {
  notificationEmail: string;
  isEmailVerified: boolean;
  sendPerCallNotification: boolean;
  sendDailySummary: boolean;
  dailySummaryTime: string;
  sendWeeklyReport: boolean;
  weeklyReportDay: number;
  sendMonthlyReport: boolean;
  monthlyReportDay: number;
  includeTranscript: boolean;
  includeRecordingLink: boolean;
  includeSentimentAnalysis: boolean;
}

export const notificationsApi = {
  get: () =>
    apiClient.get<{ success: boolean; settings: NotificationSettings }>('/notifications'),
  update: (data: Partial<NotificationSettings>) =>
    apiClient.put<{ success: boolean; settings: NotificationSettings }>('/notifications', data),
  sendVerification: () => apiClient.post('/notifications/send-verification'),
};
