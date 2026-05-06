// Sessions API module — /api/v1/sessions.

import { apiClient } from "./client";
import type { SessionData } from "./types";

export const sessionsApi = {
  list(): Promise<SessionData[]> {
    return apiClient.get<SessionData[]>("/api/v1/sessions");
  },

  revoke(sessionId: string): Promise<void> {
    return apiClient.delete<void>(`/api/v1/sessions/${sessionId}`);
  },

  revokeAll(): Promise<{ revoked_count: number }> {
    return apiClient.post("/api/v1/sessions/revoke-all");
  },

  getConfig(tenantId: string): Promise<{ session_timeout_minutes: number }> {
    return apiClient.get(`/api/v1/sessions/config`, { query: { tenant_id: tenantId } });
  },

  updateConfig(tenantId: string, sessionTimeoutMinutes: number): Promise<{ session_timeout_minutes: number }> {
    return apiClient.put(
      `/api/v1/sessions/config`,
      { session_timeout_minutes: sessionTimeoutMinutes },
      { query: { tenant_id: tenantId } },
    );
  },
};
