"use client";

import { useState } from "react";
import { MailX, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * Public email unsubscribe landing page.
 * Accessible without authentication at /unsubscribe/:token
 */

export function UnsubscribePage({ token }: { token: string }) {
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [loading, setLoading] = useState(false);

  const handleUnsubscribe = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications/unsubscribe/${encodeURIComponent(token)}`);
      const data = await res.json();
      setStatus(res.ok && data.valid ? "success" : "error");
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  if (status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: "var(--gf-bg-base)" }}>
        <div className="text-center max-w-md">
          <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full mb-6" style={{ backgroundColor: "rgba(34,197,94,0.1)" }}>
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--gf-text-primary)" }}>Unsubscribed</h1>
          <p className="text-sm mb-6" style={{ color: "var(--gf-text-secondary)" }}>
            You&apos;ve been successfully unsubscribed from email notifications. You can re-enable them anytime from your notification preferences.
          </p>
          <div className="rounded-xl border p-5 mb-6" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Token</p>
            <p className="text-sm font-mono mt-0.5" style={{ color: "var(--gf-text-secondary)" }}>{token}</p>
          </div>
          <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: "var(--gf-accent)" }}>
            <ArrowLeft className="h-4 w-4" />Back to Glimmora Fabric
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: "var(--gf-bg-base)" }}>
      <div className="text-center max-w-md">
        <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full mb-6" style={{ backgroundColor: "var(--gf-accent-bg)" }}>
          <MailX className="h-10 w-10" style={{ color: "var(--gf-accent)" }} />
        </div>

        <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--gf-text-primary)" }}>Unsubscribe</h1>
        <p className="text-sm mb-6" style={{ color: "var(--gf-text-secondary)" }}>
          You&apos;re about to unsubscribe from Glimmora Fabric email notifications. You will still receive critical security alerts.
        </p>

        <div className="rounded-xl border p-5 mb-6 text-left" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <p className="text-xs font-medium mb-3" style={{ color: "var(--gf-text-muted)" }}>You will stop receiving:</p>
          <div className="space-y-2">
            {["Product updates & announcements", "Weekly digest emails", "Team activity notifications", "Billing reminders"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <MailX className="h-3.5 w-3.5 text-red-500" />
                <span className="text-sm" style={{ color: "var(--gf-text-primary)" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-lg p-3 mb-6" style={{ backgroundColor: "rgba(245,158,11,0.08)" }}>
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
          <p className="text-xs text-left" style={{ color: "var(--gf-text-secondary)" }}>
            Critical security alerts (login attempts, password changes) will continue to be delivered regardless of this preference.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleUnsubscribe}
            disabled={loading}
            className="w-full rounded-lg px-5 py-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "Processing..." : "Confirm Unsubscribe"}
          </button>
          <Link href="/login" className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>
            Cancel — take me back
          </Link>
        </div>
      </div>
    </div>
  );
}
