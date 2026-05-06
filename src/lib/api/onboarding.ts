// Onboarding wizard — /api/v1/onboarding/*.

import { apiClient } from "./client";

export interface OnboardingResult {
  tenant_id: string;
  org_id: string;
  status: string;
}

export type OnboardingStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface OnboardingProgress {
  current_step: string;
  completed_steps: string[];
  status: OnboardingStatus;
  progress_percentage: number;
}

export interface UpdateProgressInput {
  current_step: string;
  completed_steps?: string[];
  status?: OnboardingStatus;
}

export const onboardingApi = {
  start(input: {
    tenant_id: string;
    organization: { name: string; industry?: string; size?: string };
  }): Promise<OnboardingResult> {
    return apiClient.post<OnboardingResult>("/api/v1/onboarding", input);
  },

  getProgress(): Promise<OnboardingProgress> {
    return apiClient.get<OnboardingProgress>("/api/v1/onboarding/progress");
  },

  updateProgress(input: UpdateProgressInput): Promise<OnboardingProgress> {
    return apiClient.put<OnboardingProgress>("/api/v1/onboarding/progress", input);
  },
};
