// Magic Link API module — /api/v1/auth/magic-link.

import { apiClient } from "./client";
import type { AuthUser, TokenPair } from "./types";

export const magicLinkApi = {
  request(email: string): Promise<{ magic_link_token?: string }> {
    return apiClient.post("/api/v1/auth/magic-link", { email }, { skipAuth: true });
  },

  verify(token: string): Promise<{ token: TokenPair; user: AuthUser }> {
    return apiClient.get("/api/v1/auth/magic-link/verify", {
      skipAuth: true,
      query: { token },
    });
  },
};
