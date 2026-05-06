// SSO — /api/v1/auth/sso/*. SAML & OIDC tenant configuration.
//
// Public endpoints (no auth):
//   - GET /saml/metadata?tenant_id=...
//   - POST /saml/acs                 (form-encoded, called by IdP)
//   - GET /oidc/.well-known?tenant_id=...
//
// Authenticated (admin only):
//   - GET /saml/login?tenant_id=...  -> returns redirect URL
//   - POST /configure?tenant_id=...
//   - GET /config/{tenant_id}
//   - DELETE /config/{tenant_id}

import { apiClient } from "./client";

export type SSOProtocol = "saml" | "oidc";

export interface SSOConfig {
  id: string;
  tenant_id: string;
  protocol: SSOProtocol;
  idp_entity_id: string;
  idp_sso_url: string;
  sp_entity_id: string;
  sp_acs_url: string;
  oidc_client_id: string | null;
  oidc_discovery_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConfigureSSOInput {
  protocol?: SSOProtocol;
  idp_entity_id?: string;
  idp_sso_url?: string;
  // The IdP's signing certificate (PEM). Stored on the SP for assertion
  // verification — never echoed back in responses.
  idp_certificate?: string;
  oidc_client_id?: string | null;
  // Encrypted on save; never returned. Pass to update.
  oidc_client_secret?: string | null;
  oidc_discovery_url?: string | null;
}

export interface SAMLLoginResponse {
  redirect_url: string;
}

// OIDC discovery document — keep loose so we don't break on extra fields.
export type OIDCDiscovery = Record<string, unknown>;

export const ssoApi = {
  // ---- SAML (public) -------------------------------------------------------

  // Returns the SP metadata XML the IdP needs to complete trust setup.
  // Use `raw: true` because the response is XML, not the JSON envelope.
  samlMetadata(tenantId: string): Promise<Response> {
    return apiClient.get<Response>(`/api/v1/auth/sso/saml/metadata`, {
      query: { tenant_id: tenantId },
      skipAuth: true,
      tenantId: null,
      raw: true,
    });
  },

  // Returns the OIDC discovery document for the tenant.
  oidcDiscovery(tenantId: string): Promise<OIDCDiscovery> {
    return apiClient.get<OIDCDiscovery>(`/api/v1/auth/sso/oidc/.well-known`, {
      query: { tenant_id: tenantId },
      skipAuth: true,
      tenantId: null,
    });
  },

  // ---- SAML (authenticated) ------------------------------------------------

  // Kick off SAML SSO. Caller should `window.location.assign(redirect_url)`.
  startSamlLogin(tenantId: string): Promise<SAMLLoginResponse> {
    return apiClient.get<SAMLLoginResponse>(`/api/v1/auth/sso/saml/login`, {
      query: { tenant_id: tenantId },
      skipAuth: true,
      tenantId: null,
    });
  },

  // ---- Tenant SSO configuration -------------------------------------------

  configure(tenantId: string, input: ConfigureSSOInput): Promise<SSOConfig> {
    return apiClient.post<SSOConfig>(`/api/v1/auth/sso/configure`, input, {
      query: { tenant_id: tenantId },
      tenantId: null,
    });
  },

  get(tenantId: string): Promise<SSOConfig | null> {
    return apiClient.get<SSOConfig | null>(`/api/v1/auth/sso/config/${tenantId}`, {
      tenantId: null,
    });
  },

  disable(tenantId: string): Promise<void> {
    return apiClient.delete<void>(`/api/v1/auth/sso/config/${tenantId}`, { tenantId: null });
  },
};
