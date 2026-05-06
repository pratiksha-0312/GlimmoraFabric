// SMS-based MFA — /api/v1/auth/mfa/sms/*. Separate from authApi's TOTP MFA.

import { apiClient } from "./client";

export interface SmsOtpSendResult {
  // In development the backend echoes the OTP for testing; in production
  // this field is absent.
  otp?: string;
}

export const smsMfaApi = {
  // Generate and send an SMS OTP to the supplied phone number for the
  // currently-authenticated user.
  sendOtp(phoneNumber: string): Promise<SmsOtpSendResult> {
    return apiClient.post<SmsOtpSendResult>("/api/v1/auth/mfa/sms", { phone_number: phoneNumber });
  },

  // Verify the 6-digit code returned by the user. Resolves with `verified:true`
  // on success; the surrounding catch handles the 4xx for invalid codes.
  verify(code: string): Promise<{ verified: boolean }> {
    return apiClient.post<{ verified: boolean }>("/api/v1/auth/mfa/sms/verify", { code });
  },
};
