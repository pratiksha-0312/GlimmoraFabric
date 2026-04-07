"use client";

import { AlertOctagon } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div
          className="flex min-h-screen items-center justify-center px-4"
          style={{ backgroundColor: "#0a0e1a", color: "#e2e8f0" }}
        >
          <div className="text-center max-w-md">
            <div
              className="flex h-20 w-20 mx-auto items-center justify-center rounded-full mb-6"
              style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
            >
              <AlertOctagon className="h-10 w-10" style={{ color: "#ef4444" }} />
            </div>

            <p className="text-6xl font-extrabold mb-2" style={{ color: "#ef4444" }}>
              500
            </p>
            <h1 className="text-3xl font-bold mb-3" style={{ color: "#e2e8f0" }}>
              Critical Error
            </h1>
            <p className="text-sm mb-6" style={{ color: "#94a3b8" }}>
              A critical application error occurred. Our team has been automatically notified and is investigating the issue.
            </p>

            <div
              className="rounded-xl border p-5 mb-6"
              style={{ borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.03)" }}
            >
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-xs font-medium" style={{ color: "#64748b" }}>Error Type</p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: "#e2e8f0" }}>Critical</p>
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: "#64748b" }}>Status</p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: "#ef4444" }}>Application Failure</p>
                </div>
                {error.digest && (
                  <div className="col-span-2">
                    <p className="text-xs font-medium" style={{ color: "#64748b" }}>Error ID</p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "#94a3b8", fontFamily: "monospace" }}
                    >
                      {error.digest}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: "#ef4444" }}
              >
                Try Again
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors"
                style={{ borderColor: "rgba(255,255,255,0.1)", color: "#94a3b8" }}
              >
                Back to Home
              </a>
            </div>

            <p className="text-xs mt-6" style={{ color: "#64748b" }}>
              If this persists, contact{" "}
              <a href="mailto:support@glimmora.com" className="font-medium underline" style={{ color: "#f59e0b" }}>
                support@glimmora.com
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
