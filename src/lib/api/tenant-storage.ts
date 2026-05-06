// Tracks the user's active tenant. The backend's TenantContextMiddleware
// requires `X-Tenant-ID` on most endpoints, so the API client auto-injects
// it from this store. Persisted alongside the auth session.

const TENANT_KEY = "glimmora_active_tenant";

let listeners = new Set<() => void>();

function isBrowser() {
  return typeof window !== "undefined";
}

function notify() {
  listeners.forEach((l) => l());
}

export const tenantStorage = {
  get(): string | null {
    if (!isBrowser()) return null;
    return (
      window.localStorage.getItem(TENANT_KEY) ??
      window.sessionStorage.getItem(TENANT_KEY)
    );
  },

  set(tenantId: string | null, opts: { remember?: boolean } = {}): void {
    if (!isBrowser()) return;
    if (tenantId === null) {
      window.localStorage.removeItem(TENANT_KEY);
      window.sessionStorage.removeItem(TENANT_KEY);
    } else {
      const target = opts.remember ? window.localStorage : window.sessionStorage;
      const other = opts.remember ? window.sessionStorage : window.localStorage;
      target.setItem(TENANT_KEY, tenantId);
      other.removeItem(TENANT_KEY);
    }
    notify();
  },

  clear(): void {
    if (!isBrowser()) return;
    window.localStorage.removeItem(TENANT_KEY);
    window.sessionStorage.removeItem(TENANT_KEY);
    notify();
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    if (isBrowser()) {
      const onStorage = (e: StorageEvent) => {
        if (e.key === TENANT_KEY) listener();
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
