// Auth API module — wraps /api/v1/auth endpoints from the FastAPI backend.

import { apiClient } from "./client";
import type { AuthUser, MfaEnrollData, TokenPair } from "./types";

// ---- Login / signup --------------------------------------------------------

export interface LoginInput {
  email: string;
  password: string;
  mfa_code?: string;
}

export type LoginResult = TokenPair;

export const authApi = {
  login(input: LoginInput): Promise<LoginResult> {
    return apiClient.post<LoginResult>("/api/v1/auth/login", input, { skipAuth: true });
  },

  signup(input: { email: string; password: string; full_name?: string }): Promise<AuthUser & { verification_token?: string }> {
    return apiClient.post("/api/v1/auth/signup", input, { skipAuth: true });
  },

  refresh(refresh_token: string): Promise<TokenPair> {
    return apiClient.post<TokenPair>("/api/v1/auth/refresh", { refresh_token }, { skipAuth: true });
  },

  logout(refresh_token?: string): Promise<void> {
    return apiClient.post<void>("/api/v1/auth/logout", { refresh_token });
  },

  me(): Promise<AuthUser> {
    return apiClient.get<AuthUser>("/api/v1/auth/me");
  },

  myTenants(): Promise<{ items: { tenant_id: string; role_in_tenant: string; name: string; code: string }[] }> {
    return apiClient.get("/api/v1/auth/me/tenants", { tenantId: null });
  },

  updateProfile(input: { full_name?: string }): Promise<AuthUser> {
    return apiClient.put<AuthUser>("/api/v1/auth/me", input);
  },

  // ---- Email verification --------------------------------------------------

  verifyEmail(token: string): Promise<AuthUser> {
    return apiClient.post<AuthUser>("/api/v1/auth/verify-email", { token }, { skipAuth: true });
  },

  // ---- Password management -------------------------------------------------

  forgotPassword(email: string): Promise<{ reset_token?: string }> {
    return apiClient.post("/api/v1/auth/password/forgot", { email }, { skipAuth: true });
  },

  resetPassword(input: { token: string; new_password: string }): Promise<void> {
    return apiClient.post<void>("/api/v1/auth/password/reset", input, { skipAuth: true });
  },

  changePassword(input: { current_password: string; new_password: string }): Promise<void> {
    return apiClient.put<void>("/api/v1/auth/password/change", input);
  },

  // ---- MFA -----------------------------------------------------------------

  mfaEnroll(): Promise<MfaEnrollData> {
    return apiClient.post<MfaEnrollData>("/api/v1/auth/mfa/enroll");
  },

  mfaVerify(code: string): Promise<{ mfa_enabled: boolean }> {
    return apiClient.post("/api/v1/auth/mfa/verify", { code });
  },

  mfaRecoveryCodes(): Promise<{ recovery_codes: string[] }> {
    return apiClient.post("/api/v1/auth/mfa/recovery-codes");
  },

  mfaDisable(password: string): Promise<{ mfa_enabled: boolean }> {
    return apiClient.delete("/api/v1/auth/mfa/disable", { body: { password } } as never);
  },

  // ---- Permissions ---------------------------------------------------------

  checkPermission(input: { action: string; resource: string; resource_id?: string }): Promise<{ allowed: boolean; reason: string }> {
    return apiClient.post("/api/v1/auth/check-permission", input);
  },
};
