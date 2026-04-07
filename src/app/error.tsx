"use client";

import { ServerCrash } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: "var(--gf-bg-base)" }}>
      <div className="text-center max-w-md">
        <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full mb-6" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}>
          <ServerCrash className="h-10 w-10 text-red-500" />
        </div>

        <p className="text-6xl font-extrabold mb-2 text-red-500">
          500
        </p>
        <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--gf-text-primary)" }}>
          Server Error
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--gf-text-secondary)" }}>
          Something went wrong on our end. Our team has been notified and is working to fix the issue.
        </p>

        <div className="rounded-xl border p-5 mb-6" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>Error Code</p>
              <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--gf-text-primary)" }}>500</p>
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>Status</p>
              <p className="text-sm font-semibold mt-0.5 text-red-500">Internal Server Error</p>
            </div>
            {error.digest && (
              <div className="col-span-2">
                <p className="text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>Error ID</p>
                <p className="text-xs font-mono mt-0.5" style={{ color: "var(--gf-text-secondary)" }}>{error.digest}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors bg-red-600 hover:bg-red-700"
          >
            Try Again
          </button>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors"
            style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}
          >
            Go to Dashboard
          </a>
        </div>

        <p className="text-xs mt-6" style={{ color: "var(--gf-text-muted)" }}>
          If this persists, contact{" "}
          <a href="mailto:support@glimmora.com" className="font-medium underline" style={{ color: "var(--gf-accent)" }}>
            support@glimmora.com
          </a>
        </p>
      </div>
    </div>
  );
}
