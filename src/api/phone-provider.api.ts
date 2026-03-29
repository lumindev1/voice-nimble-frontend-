import { apiClient } from './client';

export interface PhoneNumber {
  number: string;
  sid: string;
  friendlyName: string;
  isDefault: boolean;
  capabilities: { voice: boolean; sms: boolean };
  purchasedAt: string;
}

export interface PhoneProvider {
  _id: string;
  shopId: string;
  shopDomain: string;
  provider: 'twilio' | 'telnyx' | 'vonage';
  accountSid: string;
  isConnected: boolean;
  connectedAt?: string;
  phoneNumbers: PhoneNumber[];
  createdAt: string;
  updatedAt: string;
}

export interface AvailableNumber {
  number: string;
  friendlyName: string;
  region: string;
  capabilities: { voice: boolean; sms: boolean };
  monthlyPrice: string;
}

export const phoneProviderApi = {
  getAll: () =>
    apiClient.get<{ success: boolean; providers: PhoneProvider[] }>('/phone-providers'),

  connect: (data: { provider: string; accountSid: string; authToken: string }) =>
    apiClient.post<{ success: boolean; provider: PhoneProvider; message: string }>('/phone-providers/connect', data),

  disconnect: (providerId: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/phone-providers/${providerId}`),

  searchNumbers: (providerId: string, country: string, type = 'local') =>
    apiClient.get<{ success: boolean; numbers: AvailableNumber[] }>(
      `/phone-providers/${providerId}/search-numbers?country=${country}&type=${type}`,
    ),

  buyNumber: (providerId: string, phoneNumber: string) =>
    apiClient.post<{ success: boolean; message: string; provider: PhoneProvider }>(
      `/phone-providers/${providerId}/buy-number`,
      { phoneNumber },
    ),

  releaseNumber: (providerId: string, numberSid: string) =>
    apiClient.post<{ success: boolean; message: string }>(
      `/phone-providers/${providerId}/release-number`,
      { numberSid },
    ),

  setDefault: (providerId: string, numberSid: string) =>
    apiClient.post<{ success: boolean; message: string; provider: PhoneProvider }>(
      `/phone-providers/${providerId}/set-default`,
      { numberSid },
    ),
};
