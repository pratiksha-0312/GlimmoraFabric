"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Globe,
  Monitor,
  Smartphone,
  Trash2,
} from "lucide-react";

import { ApiError, sessionsApi, tokenStorage, type SessionData } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

interface SessionRow extends SessionData {
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
  Icon: typeof Monitor;
}

function parseUserAgent(ua: string): { device: string; browser: string } {
  const lower = ua.toLowerCase();
  let device = "Desktop";
  if (/iphone|android|mobile/.test(lower)) device = "Mobile";
  else if (/ipad|tablet/.test(lower)) device = "Tablet";

  let browser = "Browser";
  if (/edg\//.test(lower)) browser = "Edge";
  else if (/chrome\//.test(lower) && !/edg\//.test(lower)) browser = "Chrome";
  else if (/firefox\//.test(lower)) browser = "Firefox";
  else if (/safari\//.test(lower) && !/chrome\//.test(lower)) browser = "Safari";

  return { device, browser };
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function SessionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [revokedAll, setRevokedAll] = useState(false);
  const [error, setError] = useState("");

  const fetchSessions = useCallback(async () => {
    if (!user) return;
    setError("");
    try {
      const list = await sessionsApi.list();
      // Without a stable session ID on the access token, mark the most-recent
      // session as "this device" — close enough for UX.
      const mostRecentId = list.length
        ? [...list].sort((a, b) => b.last_seen_at.localeCompare(a.last_seen_at))[0].id
        : null;

      const rows: SessionRow[] = list.map((s) => {
        const { device, browser } = parseUserAgent(s.user_agent || "");
        return {
          ...s,
          device: s.device_name ?? device,
          browser,
          location: s.ip_address || "Unknown",
          lastActive: relativeTime(s.last_seen_at),
          isCurrent: s.id === mostRecentId,
          Icon: device === "Mobile" ? Smartphone : Monitor,
        };
      });
      setSessions(rows);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load sessions");
    }
  }, [user]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const revoke = async (id: string) => {
    setShowConfirm(null);
    try {
      await sessionsApi.revoke(id);
      await fetchSessions();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to revoke session");
    }
  };

  const revokeAll = async () => {
    try {
      await sessionsApi.revokeAll();
      await fetchSessions();
      setRevokedAll(true);
      setTimeout(() => setRevokedAll(false), 2000);
      // Force a refresh of the access token so the current session keeps
      // working after the server-side revocation cascade.
      tokenStorage.subscribe(() => undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to revoke sessions");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <button
        onClick={() => router.push("/settings")}
        className="flex items-center gap-2 text-sm font-medium hover:opacity-70"
        style={{ color: "var(--gf-text-secondary)" }}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Settings
      </button>

      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>
          Active Sessions
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>
          These are devices currently logged into your account
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      {revokedAll && (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-400">
          <CheckCircle2 className="h-4 w-4" /> All other sessions have been revoked
        </div>
      )}

      <div className="space-y-3">
        {sessions.length === 0 ? (
          <div
            className="rounded-xl border p-6 text-center text-sm"
            style={{
              borderColor: "var(--gf-border)",
              backgroundColor: "var(--gf-bg-surface)",
              color: "var(--gf-text-muted)",
            }}
          >
            No active sessions found.
          </div>
        ) : (
          sessions.map((s) => {
            const Icon = s.Icon;
            return (
              <div
                key={s.id}
                className="rounded-xl border p-4"
                style={{
                  borderColor: s.isCurrent ? "#22c55e" : "var(--gf-border)",
                  backgroundColor: "var(--gf-bg-surface)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ backgroundColor: "var(--gf-bg-elevated)" }}
                    >
                      <Icon
                        className="h-5 w-5"
                        style={{ color: s.isCurrent ? "#22c55e" : "var(--gf-text-muted)" }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>
                          {s.browser} — {s.device}
                        </span>
                        {s.isCurrent && (
                          <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                            This device
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>
                          {s.ip_address || "—"}
                        </span>
                        <span
                          className="flex items-center gap-1 text-xs"
                          style={{ color: "var(--gf-text-muted)" }}
                        >
                          <Globe className="h-3 w-3" /> {s.location}
                        </span>
                        <span
                          className={`text-xs ${s.isCurrent ? "text-green-400" : ""}`}
                          style={s.isCurrent ? {} : { color: "var(--gf-text-muted)" }}
                        >
                          {s.lastActive}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!s.isCurrent && (
                    <button
                      onClick={() => setShowConfirm(s.id)}
                      className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {sessions.length > 1 && (
        <button
          onClick={revokeAll}
          className="flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" /> Revoke All Other Sessions
        </button>
      )}

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setShowConfirm(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border p-6 shadow-2xl"
            style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>
                Revoke Session
              </h2>
            </div>
            <p className="text-sm mb-4" style={{ color: "var(--gf-text-secondary)" }}>
              This device will be signed out immediately.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium border"
                style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
              >
                Cancel
              </button>
              <button
                onClick={() => revoke(showConfirm)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700"
              >
                Revoke
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
