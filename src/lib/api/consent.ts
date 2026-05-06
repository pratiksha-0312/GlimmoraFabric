// Consent records — /api/v1/consent/*.

import { apiClient } from "./client";

export interface ConsentItem {
  purpose: string;
  granted: boolean;
}

export const consentApi = {
  get(): Promise<{ items: ConsentItem[] }> {
    return apiClient.get("/api/v1/consent/");
  },

  put(items: ConsentItem[]): Promise<{ items: ConsentItem[] }> {
    return apiClient.put("/api/v1/consent/", { items });
  },
};
