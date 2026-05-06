"use client";

// Read & switch the active tenant. The value is mirrored to localStorage /
// sessionStorage by `tenantStorage`, and the API client auto-injects the
// resulting `X-Tenant-ID` header on every authenticated request.

import { useCallback, useEffect, useState } from "react";

import { tenantStorage } from "./tenant-storage";

export function useTenant(): {
  tenantId: string | null;
  setTenant: (id: string | null, opts?: { remember?: boolean }) => void;
  clearTenant: () => void;
} {
  const [tenantId, setTenantId] = useState<string | null>(null);

  // Hydrate from storage on mount + react to cross-tab changes.
  useEffect(() => {
    setTenantId(tenantStorage.get());
    return tenantStorage.subscribe(() => {
      setTenantId(tenantStorage.get());
    });
  }, []);

  const setTenant = useCallback((id: string | null, opts: { remember?: boolean } = {}) => {
    tenantStorage.set(id, opts);
    setTenantId(id);
  }, []);

  const clearTenant = useCallback(() => {
    tenantStorage.clear();
    setTenantId(null);
  }, []);

  return { tenantId, setTenant, clearTenant };
}
