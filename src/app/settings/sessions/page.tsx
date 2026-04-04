"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Monitor, Smartphone, Globe, Trash2, AlertTriangle, CheckCircle2,
} from "lucide-react";

interface Session {
  id: string; device: string; browser: string; ip: string; location: string;
  lastActive: string; isCurrent: boolean; icon: typeof Monitor;
}

const SESSIONS: Session[] = [
  { id: "s1", device: "Windows 11", browser: "Chrome 124", ip: "192.168.1.105", location: "Mumbai, India", lastActive: "Now", isCurrent: true, icon: Monitor },
  { id: "s2", device: "macOS 14", browser: "Safari 17", ip: "10.0.0.42", location: "Bangalore, India", lastActive: "2 hours ago", isCurrent: false, icon: Monitor },
  { id: "s3", device: "iPhone 15", browser: "Safari Mobile", ip: "172.16.0.89", location: "Delhi, India", lastActive: "1 day ago", isCurrent: false, icon: Smartphone },
];

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState(SESSIONS);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [revokedAll, setRevokedAll] = useState(false);

  const revoke = (id: string) => {
    setSessions((s) => s.filter((x) => x.id !== id));
    setShowConfirm(null);
  };

  const revokeAll = () => {
    setSessions((s) => s.filter((x) => x.isCurrent));
    setRevokedAll(true);
    setTimeout(() => setRevokedAll(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <button onClick={() => router.push("/settings")}
        className="flex items-center gap-2 text-sm font-medium hover:opacity-70"
        style={{ color: "var(--gf-text-secondary)" }}>
        <ArrowLeft className="h-4 w-4" /> Back to Settings
      </button>

      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Active Sessions</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>
          These are devices currently logged into your account
        </p>
      </div>

      {revokedAll && (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-400">
          <CheckCircle2 className="h-4 w-4" /> All other sessions have been revoked
        </div>
      )}

      <div className="space-y-3">
        {sessions.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.id} className="rounded-xl border p-4"
              style={{
                borderColor: s.isCurrent ? "#22c55e" : "var(--gf-border)",
                backgroundColor: "var(--gf-bg-surface)",
              }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                    <Icon className="h-5 w-5" style={{ color: s.isCurrent ? "#22c55e" : "var(--gf-text-muted)" }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>
                        {s.browser} — {s.device}
                      </span>
                      {s.isCurrent && (
                        <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-400">This device</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{s.ip}</span>
                      <span className="flex items-center gap-1 text-xs" style={{ color: "var(--gf-text-muted)" }}>
                        <Globe className="h-3 w-3" /> {s.location}
                      </span>
                      <span className={`text-xs ${s.isCurrent ? "text-green-400" : ""}`}
                        style={s.isCurrent ? {} : { color: "var(--gf-text-muted)" }}>
                        {s.lastActive}
                      </span>
                    </div>
                  </div>
                </div>
                {!s.isCurrent && (
                  <button onClick={() => setShowConfirm(s.id)}
                    className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10">
                    Revoke
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {sessions.length > 1 && (
        <button onClick={revokeAll}
          className="flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10">
          <Trash2 className="h-4 w-4" /> Revoke All Other Sessions
        </button>
      )}

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowConfirm(null)}>
          <div className="w-full max-w-sm rounded-2xl border p-6 shadow-2xl"
            style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Revoke Session</h2>
            </div>
            <p className="text-sm mb-4" style={{ color: "var(--gf-text-secondary)" }}>This device will be signed out immediately.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConfirm(null)} className="rounded-lg px-4 py-2 text-sm font-medium border"
                style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
              <button onClick={() => revoke(showConfirm)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700">Revoke</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
