import { apiClient } from './client';

export interface Skill {
  skillId: string;
  name: string;
  isEnabled: boolean;
  isDefault: boolean;
}

export const skillsApi = {
  list: () => apiClient.get<{ success: boolean; skills: Skill[] }>('/skills'),
  update: (skills: Skill[]) =>
    apiClient.put<{ success: boolean; skills: Skill[] }>('/skills', { skills }),
  toggle: (skillId: string) =>
    apiClient.put<{ success: boolean; skill: Skill }>(`/skills/${skillId}/toggle`),
};
