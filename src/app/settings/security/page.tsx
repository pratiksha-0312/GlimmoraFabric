"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/auth-guard";
import {
  ArrowLeft, Lock, ShieldCheck, ShieldOff, Eye, EyeOff,
  CheckCircle2, AlertTriangle, Monitor, Smartphone, Mail, MessageSquare, KeyRound,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Password strength bar
// ---------------------------------------------------------------------------
function StrengthBar({ password }: { password: string }) {
  if (!password) return null;
  const checks = [
    password.length >= 8, /[A-Z]/.test(password), /[a-z]/.test(password),
    /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password),
  ];
  const passed = checks.filter(Boolean).length;
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];
  const labels = ["Weak", "Fair", "Good", "Strong"];
  const idx = passed <= 1 ? 0 : passed <= 2 ? 1 : passed <= 4 ? 2 : 3;
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex flex-1 gap-1">
        {colors.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= idx ? colors[idx] : "bg-gray-700"}`} />
        ))}
      </div>
      <span className="text-xs text-gray-400">{labels[idx]}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MFA Disable Modal
// ---------------------------------------------------------------------------
function MfaDisableModal({ method, onConfirm, onCancel }: { method: string; onConfirm: () => void; onCancel: () => void }) {
  const [pw, setPw] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-2xl"
        style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Disable {method}</h2>
        </div>
        <p className="text-sm mb-4" style={{ color: "var(--gf-text-secondary)" }}>
          This will remove {method.toLowerCase()} as an authentication method. Enter your password to confirm.
        </p>
        <input type="password" placeholder="Current password" value={pw} onChange={(e) => setPw(e.target.value)}
          className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none mb-4"
          style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium border"
            style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
          <button onClick={onConfirm} disabled={!pw}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50">
            Disable
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MFA Method types
// ---------------------------------------------------------------------------
interface MfaMethod {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  detail: string;
}

const MFA_METHODS: MfaMethod[] = [
  {
    id: "email",
    label: "Email OTP",
    description: "Receive a verification code via email",
    icon: <Mail className="h-5 w-5" />,
    detail: "su***@glimmora.com",
  },
  {
    id: "sms",
    label: "SMS OTP",
    description: "Receive a verification code via text message",
    icon: <MessageSquare className="h-5 w-5" />,
    detail: "+1 •••• •••• 42",
  },
  {
    id: "authenticator",
    label: "Authenticator App",
    description: "Use Google Authenticator, Authy, or similar",
    icon: <Smartphone className="h-5 w-5" />,
    detail: "TOTP configured",
  },
];

// ---------------------------------------------------------------------------
// Security Settings Page
// ---------------------------------------------------------------------------
const MFA_STORAGE_KEY = "glimmora_mfa_methods";

function loadMfaState(): { methods: Record<string, boolean>; recoveryCodes: boolean } {
  if (typeof window === "undefined") return { methods: { email: false, sms: false, authenticator: false }, recoveryCodes: false };
  try {
    const stored = localStorage.getItem(MFA_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return { methods: { email: false, sms: false, authenticator: false }, recoveryCodes: false };
}

function saveMfaState(methods: Record<string, boolean>, recoveryCodes: boolean) {
  localStorage.setItem(MFA_STORAGE_KEY, JSON.stringify({ methods, recoveryCodes }));
}

export default function SecuritySettingsPage() {
  const router = useRouter();
  const [section, setSection] = useState<"overview" | "change-password">("overview");
  const [enabledMethods, setEnabledMethods] = useState<Record<string, boolean>>({
    email: false,
    sms: false,
    authenticator: false,
  });
  const [hasRecoveryCodes, setHasRecoveryCodes] = useState(false);
  const [disablingMethod, setDisablingMethod] = useState<string | null>(null);

  // Load persisted MFA state on mount
  useEffect(() => {
    const state = loadMfaState();
    setEnabledMethods(state.methods);
    setHasRecoveryCodes(state.recoveryCodes);
  }, []);

  // Persist MFA state whenever it changes
  const updateMethods = useCallback((updater: (prev: Record<string, boolean>) => Record<string, boolean>) => {
    setEnabledMethods((prev) => {
      const next = updater(prev);
      const anyEnabled = Object.values(next).some(Boolean);
      saveMfaState(next, anyEnabled ? hasRecoveryCodes : false);
      return next;
    });
  }, [hasRecoveryCodes]);

  // Password form
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const anyMfaEnabled = Object.values(enabledMethods).some(Boolean);

  const handleChangePassword = async () => {
    setPwError("");
    if (!currentPw) { setPwError("Current password is required."); return; }
    if (newPw.length < 8) { setPwError("New password must be at least 8 characters."); return; }
    if (!/[A-Z]/.test(newPw) || !/[a-z]/.test(newPw) || !/[0-9]/.test(newPw) || !/[^A-Za-z0-9]/.test(newPw)) {
      setPwError("Password must include uppercase, lowercase, number, and special character."); return;
    }
    if (newPw !== confirmPw) { setPwError("Passwords do not match."); return; }
    if (newPw === currentPw) { setPwError("New password must be different from current password."); return; }

    setPwLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setPwLoading(false);
    setPwSuccess(true);
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    setTimeout(() => { setPwSuccess(false); setSection("overview"); }, 2000);
  };

  const handleDisableMethod = (methodId: string) => {
    updateMethods((prev) => {
      const next = { ...prev, [methodId]: false };
      const anyRemaining = Object.values(next).some(Boolean);
      if (!anyRemaining) setHasRecoveryCodes(false);
      saveMfaState(next, anyRemaining ? hasRecoveryCodes : false);
      return next;
    });
    setDisablingMethod(null);
  };

  const fieldStyle = {
    backgroundColor: "var(--gf-bg-base)",
    borderColor: "var(--gf-border)",
    color: "var(--gf-text-primary)",
  };

  return (
    <AuthGuard>
    <div className="space-y-6 max-w-3xl">
      <button onClick={() => router.push("/settings")}
        className="flex items-center gap-2 text-sm font-medium hover:opacity-70"
        style={{ color: "var(--gf-text-secondary)" }}>
        <ArrowLeft className="h-4 w-4" /> Back to Settings
      </button>

      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Security Settings</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>Manage your password and two-factor authentication</p>
      </div>

      {section === "overview" ? (
        <div className="space-y-4">
          {/* Password Card */}
          <div className="rounded-xl border p-6" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                  <Lock className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Password</h3>
                  <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Last changed 30 days ago</p>
                </div>
              </div>
              <button onClick={() => setSection("change-password")}
                className="rounded-lg px-4 py-2 text-sm font-medium border hover:opacity-80"
                style={{ borderColor: "var(--gf-border)", color: "var(--gf-accent)" }}>
                Change Password
              </button>
            </div>
          </div>

          {/* MFA Section */}
          <div className="rounded-xl border p-6 space-y-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                  <ShieldCheck className="h-5 w-5" style={{ color: anyMfaEnabled ? "#22c55e" : "var(--gf-text-muted)" }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Two-Factor Authentication</h3>
                  <p className="text-xs" style={{ color: anyMfaEnabled ? "#22c55e" : "var(--gf-text-muted)" }}>
                    {anyMfaEnabled
                      ? `${Object.values(enabledMethods).filter(Boolean).length} method${Object.values(enabledMethods).filter(Boolean).length > 1 ? "s" : ""} enabled`
                      : "No methods enabled"}
                  </p>
                </div>
              </div>
            </div>

            {/* Individual MFA Methods */}
            <div className="space-y-3 pt-2 border-t" style={{ borderColor: "var(--gf-border)" }}>
              {MFA_METHODS.map((method) => {
                const enabled = enabledMethods[method.id];
                return (
                  <div key={method.id} className="flex items-center justify-between rounded-lg border p-4"
                    style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: enabled ? "rgba(34,197,94,0.12)" : "var(--gf-bg-elevated)", color: enabled ? "#22c55e" : "var(--gf-text-muted)" }}>
                        {method.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>{method.label}</p>
                          {enabled && (
                            <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-semibold text-green-400">Active</span>
                          )}
                        </div>
                        <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>
                          {enabled ? method.detail : method.description}
                        </p>
                      </div>
                    </div>
                    {enabled ? (
                      <button onClick={() => setDisablingMethod(method.id)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10">
                        <ShieldOff className="h-3.5 w-3.5 inline mr-1" /> Disable
                      </button>
                    ) : (
                      <button onClick={() => router.push(`/settings/security/mfa?method=${method.id}`)}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
                        style={{ backgroundColor: "var(--gf-accent)" }}>
                        Set up
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Recovery Codes */}
            <div className="flex items-center justify-between rounded-lg border p-4"
              style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: hasRecoveryCodes ? "rgba(34,197,94,0.12)" : "var(--gf-bg-elevated)", color: hasRecoveryCodes ? "#22c55e" : "var(--gf-text-muted)" }}>
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Recovery Codes</p>
                    {hasRecoveryCodes && (
                      <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-semibold text-green-400">Saved</span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>
                    {hasRecoveryCodes ? "8 backup codes generated" : "One-time backup codes for account recovery"}
                  </p>
                </div>
              </div>
              {hasRecoveryCodes ? (
                <button onClick={() => router.push("/settings/security/mfa?method=recovery&regenerate=true")}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium border hover:opacity-80"
                  style={{ borderColor: "var(--gf-border)", color: "var(--gf-accent)" }}>
                  Regenerate
                </button>
              ) : (
                <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>
                  {anyMfaEnabled ? "Generated during MFA setup" : "Enable MFA first"}
                </span>
              )}
            </div>
          </div>

          {/* Sessions Card */}
          <div className="rounded-xl border p-6" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                  <Monitor className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Active Sessions</h3>
                  <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Manage devices logged into your account</p>
                </div>
              </div>
              <button onClick={() => router.push("/settings/sessions")}
                className="rounded-lg px-4 py-2 text-sm font-medium border hover:opacity-80"
                style={{ borderColor: "var(--gf-border)", color: "var(--gf-accent)" }}>
                View Sessions
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Change Password Form */
        <div className="rounded-xl border p-6 space-y-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Change Password</h3>

          {pwSuccess && (
            <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-400">
              <CheckCircle2 className="h-4 w-4" /> Password updated successfully!
            </div>
          )}
          {pwError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{pwError}</div>
          )}

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Current Password</label>
            <div className="relative">
              <input type={showCurrent ? "text" : "password"} value={currentPw} onChange={(e) => setCurrentPw(e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none pr-10" style={fieldStyle} />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--gf-text-muted)" }}>
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>New Password</label>
            <div className="relative">
              <input type={showNew ? "text" : "password"} value={newPw} onChange={(e) => setNewPw(e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none pr-10" style={fieldStyle} />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--gf-text-muted)" }}>
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <StrengthBar password={newPw} />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Confirm New Password</label>
            <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none" style={fieldStyle} />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t" style={{ borderColor: "var(--gf-border)" }}>
            <button onClick={() => setSection("overview")}
              className="rounded-lg px-4 py-2 text-sm font-medium border"
              style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
            <button onClick={handleChangePassword} disabled={pwLoading}
              className="rounded-lg px-6 py-2 text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: "var(--gf-accent)" }}>
              {pwLoading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      )}

      {disablingMethod && (
        <MfaDisableModal
          method={MFA_METHODS.find((m) => m.id === disablingMethod)?.label ?? "MFA"}
          onCancel={() => setDisablingMethod(null)}
          onConfirm={() => handleDisableMethod(disablingMethod)}
        />
      )}
    </div>
    </AuthGuard>
  );
}
