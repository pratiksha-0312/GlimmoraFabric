// Generic backend response envelope used by the FastAPI services.
// The Python API returns shape:
//   { success: bool, message: string, data: T | null, error: string | null, request_id: string }

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  error: string | null;
  request_id: string;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  requestId?: string;

  constructor(message: string, opts: { status: number; code?: string; requestId?: string }) {
    super(message);
    this.name = "ApiError";
    this.status = opts.status;
    this.code = opts.code;
    this.requestId = opts.requestId;
  }
}

// ---- Domain types (mirrored from backend Pydantic schemas) -----------------

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  mfa_enabled: boolean;
  last_login: string | null;
  created_at: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  mfa_required?: boolean;
}

export interface MfaEnrollData {
  secret: string;
  qr_uri: string;
  recovery_codes: string[];
}

export interface SessionData {
  id: string;
  ip_address: string;
  user_agent: string;
  device_fingerprint: string | null;
  device_name: string | null;
  is_active: boolean;
  created_at: string;
  last_seen_at: string;
}

export interface OAuthProvider {
  provider: string;
  configured: boolean;
  authorize_url: string;
}
