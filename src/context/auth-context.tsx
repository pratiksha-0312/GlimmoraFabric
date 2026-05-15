"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  ApiError,
  apiClient,
  authApi,
  tenantStorage,
  tokenStorage,
  type AuthUser as BackendAuthUser,
  type TokenPair,
} from "@/lib/api";
import { normalizeRole, type UserRole } from "@/lib/roles";

// ---------------------------------------------------------------------------
// Public types — keep the shape the rest of the app already consumes.
// ---------------------------------------------------------------------------

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  tenantId?: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
}

interface LoginResult {
  user: AuthUser | null;
  mfaRequired: boolean;
  // Short-lived token returned when MFA is required; pass it back to completeMfa().
  mfaPendingToken?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isReady: boolean;

  // Email/password login. Returns whether MFA is required.
  login: (email: string, password: string, remember?: boolean) => Promise<LoginResult>;
  // Complete MFA after a partial login.
  completeMfaLogin: (input: { email: string; password: string; mfaCode: string; remember?: boolean }) => Promise<AuthUser>;
  // OAuth / magic-link flows already received the full token pair — install it.
  setSession: (input: { tokens: TokenPair; user: BackendAuthUser; remember?: boolean }) => AuthUser;
  // Refresh the current user from the backend.
  refreshProfile: () => Promise<AuthUser | null>;
  logout: () => Promise<void>;
}

// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function fromBackend(user: BackendAuthUser, tenantId?: string): AuthUser {
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    role: normalizeRole(user.role),
    tenantId,
    emailVerified: user.email_verified,
    mfaEnabled: user.mfa_enabled,
  };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Hydrate from storage + verify with backend on mount.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const cachedUser = tokenStorage.getUser();
      if (cachedUser) {
        setUser(fromBackend(cachedUser));
      }

      // Even if no access token in memory, the refresh token may still be valid.
      if (tokenStorage.getRefreshToken()) {
        const newAccess = await apiClient.refresh();
        if (newAccess) {
          try {
            const fresh = await authApi.me();
            if (!cancelled) {
              tokenStorage.updateUser(fresh);
              setUser(fromBackend(fresh));
            }
          } catch {
            tokenStorage.clear();
            if (!cancelled) setUser(null);
          }
        } else {
          tokenStorage.clear();
          if (!cancelled) setUser(null);
        }
      }

      if (!cancelled) setIsReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Sync state when storage changes (e.g., another tab logs out).
  useEffect(() => {
    const unsub = tokenStorage.subscribe(() => {
      const cached = tokenStorage.getUser();
      setUser(cached ? fromBackend(cached) : null);
    });
    return unsub;
  }, []);

  // ---- Login ---------------------------------------------------------------

  const login = useCallback(
    async (email: string, password: string, remember = false): Promise<LoginResult> => {
      const tokens = await authApi.login({ email, password });

      if (tokens.mfa_required) {
        return { user: null, mfaRequired: true, mfaPendingToken: tokens.access_token };
      }

      tokenStorage.setSession({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        // Temporary user so the access-token guard works; we replace below.
        user: {
          id: "",
          email,
          full_name: "",
          role: "user",
          is_active: true,
          email_verified: false,
          mfa_enabled: false,
          last_login: null,
          created_at: new Date().toISOString(),
        },
        remember,
      });

      const profile = await authApi.me();
      tokenStorage.updateUser(profile);
      const next = fromBackend(profile);
      setUser(next);
      try {
        const { items } = await authApi.myTenants();
        if (items?.[0]) tenantStorage.set(items[0].tenant_id, { remember });
        else tenantStorage.clear();
      } catch { /* non-fatal */ }
      return { user: next, mfaRequired: false };
    },
    [],
  );

  const completeMfaLogin = useCallback(
    async (input: { email: string; password: string; mfaCode: string; remember?: boolean }): Promise<AuthUser> => {
      const tokens = await authApi.login({
        email: input.email,
        password: input.password,
        mfa_code: input.mfaCode,
      });

      if (tokens.mfa_required || !tokens.refresh_token) {
        throw new ApiError("MFA verification did not complete", { status: 401 });
      }

      tokenStorage.setSession({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        user: {
          id: "",
          email: input.email,
          full_name: "",
          role: "user",
          is_active: true,
          email_verified: false,
          mfa_enabled: true,
          last_login: null,
          created_at: new Date().toISOString(),
        },
        remember: input.remember ?? false,
      });

      const profile = await authApi.me();
      tokenStorage.updateUser(profile);
      const next = fromBackend(profile);
      setUser(next);
      try {
        const { items } = await authApi.myTenants();
        if (items?.[0]) tenantStorage.set(items[0].tenant_id, { remember: input.remember ?? false });
        else tenantStorage.clear();
      } catch { /* non-fatal */ }
      return next;
    },
    [],
  );

  // OAuth / magic-link already returned tokens + user — install them directly.
  const setSession = useCallback(
    (input: { tokens: TokenPair; user: BackendAuthUser; remember?: boolean }): AuthUser => {
      tokenStorage.setSession({
        accessToken: input.tokens.access_token,
        refreshToken: input.tokens.refresh_token,
        user: input.user,
        remember: input.remember ?? false,
      });
      const next = fromBackend(input.user);
      setUser(next);
      return next;
    },
    [],
  );

  const refreshProfile = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const fresh = await authApi.me();
      tokenStorage.updateUser(fresh);
      const next = fromBackend(fresh);
      setUser(next);
      return next;
    } catch {
      return null;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    const refreshToken = tokenStorage.getRefreshToken() ?? undefined;
    // Clear local state immediately so callers that don't await still see
    // an unauthenticated context before navigating. Also drop the active
    // tenant so it doesn't leak into the next user's session on this device.
    tokenStorage.clear();
    tenantStorage.clear();
    setUser(null);
    try {
      // Best-effort revocation on the server.
      await authApi.logout(refreshToken);
    } catch {
      // Already cleared locally — ignore network errors.
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isReady,
      login,
      completeMfaLogin,
      setSession,
      refreshProfile,
      logout,
    }),
    [user, isReady, login, completeMfaLogin, setSession, refreshProfile, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return context;
}
