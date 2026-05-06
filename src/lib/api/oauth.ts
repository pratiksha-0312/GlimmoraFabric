// OAuth API module — /api/v1/auth/oauth.

import { apiClient } from "./client";
import type { OAuthProvider, TokenPair, AuthUser } from "./types";

export interface OAuthAccount {
  id: string;
  provider: string;
  provider_user_id: string;
  provider_email: string | null;
  created_at: string;
}

export const oauthApi = {
  listProviders(): Promise<OAuthProvider[]> {
    return apiClient.get<OAuthProvider[]>("/api/v1/auth/oauth/providers", { skipAuth: true });
  },

  // Returns the upstream authorization URL the browser should be redirected to.
  startLogin(provider: string, redirectUri?: string): Promise<{ authorization_url: string; state: string }> {
    return apiClient.get(`/api/v1/auth/oauth/${provider}`, {
      skipAuth: true,
      query: { redirect_uri: redirectUri },
    });
  },

  handleCallback(provider: string, code: string, state: string): Promise<{
    token: TokenPair;
    user: AuthUser;
    is_new_user: boolean;
  }> {
    return apiClient.get(`/api/v1/auth/oauth/${provider}/callback`, {
      skipAuth: true,
      query: { code, state },
    });
  },

  startLink(provider: string): Promise<{ authorization_url: string; state: string }> {
    return apiClient.post("/api/v1/auth/oauth/link", { provider });
  },

  listLinkedAccounts(): Promise<OAuthAccount[]> {
    return apiClient.get<OAuthAccount[]>("/api/v1/auth/oauth/accounts");
  },

  unlink(provider: string): Promise<void> {
    return apiClient.delete<void>(`/api/v1/auth/oauth/accounts/${provider}`);
  },
};
