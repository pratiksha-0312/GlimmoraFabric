"use client";

import { useState, useCallback, createContext, useContext, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

/**
 * Promise-based Confirmation Dialog.
 *
 * Setup — wrap your app (or a subtree) with <ConfirmProvider>:
 *   <ConfirmProvider>{children}</ConfirmProvider>
 *
 * Usage:
 *   const confirm = useConfirm();
 *   const ok = await confirm({ title: "Delete?", description: "This cannot be undone." });
 *   if (ok) { // proceed }
 *
 *   // With custom variant:
 *   await confirm({ title: "Are you sure?", confirmLabel: "Yes, remove", variant: "danger" });
 */

interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within a <ConfirmProvider>");
  return ctx;
}

interface InternalState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InternalState | null>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => {
      setState({ ...options, resolve });
    });
  }, []);

  const handleClose = (result: boolean) => {
    state?.resolve(result);
    setState(null);
  };

  const variant = state?.variant ?? "danger";
  const iconBg = variant === "danger" ? "bg-red-500/15" : variant === "warning" ? "bg-amber-500/15" : "var(--gf-accent-bg)";
  const iconColor = variant === "danger" ? "text-red-500" : variant === "warning" ? "text-amber-500" : "";
  const btnBg = variant === "danger" ? "bg-red-600 hover:bg-red-700" : variant === "warning" ? "bg-amber-600 hover:bg-amber-700" : "";

  return (
    <ConfirmContext value={confirm}>
      {children}

      {state && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60" onClick={() => handleClose(false)}>
          <div
            className="w-full max-w-md rounded-2xl border p-6 shadow-2xl"
            style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBg}`}>
                <AlertTriangle className={`h-5 w-5 ${iconColor}`} style={variant === "default" ? { color: "var(--gf-accent)" } : undefined} />
              </div>
              <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>
                {state.title ?? "Are you sure?"}
              </h2>
            </div>

            {state.description && (
              <p className="text-sm mb-6" style={{ color: "var(--gf-text-secondary)" }}>{state.description}</p>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => handleClose(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium border hover:opacity-80"
                style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
              >
                {state.cancelLabel ?? "Cancel"}
              </button>
              <button
                onClick={() => handleClose(true)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${btnBg}`}
                style={variant === "default" ? { backgroundColor: "var(--gf-accent)" } : undefined}
              >
                {state.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext>
  );
}
