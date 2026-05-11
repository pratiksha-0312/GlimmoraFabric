// Email-based MFA — /api/v1/auth/mfa/email/*. Mirrors smsMfaApi.

import { apiClient } from "./client";

export interface EmailOtpSendResult {
  // In development the backend echoes the OTP for testing; in production
  // this field is absent.
  otp?: string;
}

export const emailMfaApi = {
  // Send an email OTP to the authenticated user's registered email.
  sendOtp(): Promise<EmailOtpSendResult> {
    return apiClient.post<EmailOtpSendResult>("/api/v1/auth/mfa/email", {});
  },

  // Verify the 6-digit code returned by the user.
  verify(code: string): Promise<{ verified: boolean }> {
    return apiClient.post<{ verified: boolean }>("/api/v1/auth/mfa/email/verify", { code });
  },
};
