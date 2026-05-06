// Token storage with cross-tab sync. Refresh token & user persist; access token is in memory.
//
// Strategy:
//   - access_token: in memory only (volatile) — re-issued via refresh on page load
//   - refresh_token + user: localStorage (remember me) OR sessionStorage (single tab)
//   - storage event listeners keep tabs in sync

import type { AuthUser } from "./types";

const REFRESH_KEY = "glimmora_refresh_token";
const USER_KEY = "glimmora_user";
const REMEMBER_KEY = "glimmora_remember";

let inMemoryAccessToken: string | null = null;
let listeners: Set<() => void> = new Set();

function notify() {
  listeners.forEach((l) => l());
}

function isBrowser() {
  return typeof window !== "undefined";
}

function getStore(remember: boolean | null): Storage | null {
  if (!isBrowser()) return null;
  if (remember === null) return null;
  return remember ? window.localStorage : window.sessionStorage;
}

function detectRemember(): boolean | null {
  if (!isBrowser()) return null;
  if (window.localStorage.getItem(REFRESH_KEY)) return true;
  if (window.sessionStorage.getItem(REFRESH_KEY)) return false;
  return null;
}

export const tokenStorage = {
  getAccessToken(): string | null {
    return inMemoryAccessToken;
  },

  setAccessToken(token: string | null): void {
    inMemoryAccessToken = token;
    notify();
  },

  getRefreshToken(): string | null {
    if (!isBrowser()) return null;
    return (
      window.localStorage.getItem(REFRESH_KEY) ??
      window.sessionStorage.getItem(REFRESH_KEY)
    );
  },

  getUser(): AuthUser | null {
    if (!isBrowser()) return null;
    const raw =
      window.localStorage.getItem(USER_KEY) ??
      window.sessionStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  setSession(opts: { accessToken: string; refreshToken: string; user: AuthUser; remember: boolean }): void {
    if (!isBrowser()) return;
    inMemoryAccessToken = opts.accessToken;

    const target = opts.remember ? window.localStorage : window.sessionStorage;
    const other = opts.remember ? window.sessionStorage : window.localStorage;

    target.setItem(REFRESH_KEY, opts.refreshToken);
    target.setItem(USER_KEY, JSON.stringify(opts.user));
    target.setItem(REMEMBER_KEY, opts.remember ? "1" : "0");
    other.removeItem(REFRESH_KEY);
    other.removeItem(USER_KEY);
    other.removeItem(REMEMBER_KEY);

    notify();
  },

  updateUser(user: AuthUser): void {
    if (!isBrowser()) return;
    const remember = detectRemember();
    const store = getStore(remember);
    if (!store) return;
    store.setItem(USER_KEY, JSON.stringify(user));
    notify();
  },

  rotateTokens(opts: { accessToken: string; refreshToken: string }): void {
    if (!isBrowser()) return;
    inMemoryAccessToken = opts.accessToken;
    const remember = detectRemember();
    const store = getStore(remember);
    if (store) store.setItem(REFRESH_KEY, opts.refreshToken);
    notify();
  },

  clear(): void {
    inMemoryAccessToken = null;
    if (!isBrowser()) return;
    [window.localStorage, window.sessionStorage].forEach((s) => {
      s.removeItem(REFRESH_KEY);
      s.removeItem(USER_KEY);
      s.removeItem(REMEMBER_KEY);
    });
    notify();
  },

  // Subscribe to local + cross-tab changes. Returns an unsubscribe function.
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    if (isBrowser()) {
      const onStorage = (e: StorageEvent) => {
        if (e.key === USER_KEY || e.key === REFRESH_KEY) listener();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    }
    return () => listeners.delete(listener);
  },
};
