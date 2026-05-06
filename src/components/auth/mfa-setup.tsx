"use client";

// MFA setup widget for the user settings page.
//
// Flow:
//   1. POST /auth/mfa/enroll  → returns secret + qr_uri + recovery_codes
//   2. User scans the QR with an authenticator app
//   3. POST /auth/mfa/verify with the 6-digit code → MFA becomes active
//   4. (Optional) POST /auth/mfa/recovery-codes to regenerate recovery codes
//   5. DELETE /auth/mfa/disable {password} to turn it off

import { useState } from "react";
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/auth-context";
import { ApiError, authApi, type MfaEnrollData } from "@/lib/api";

export function MfaSetup() {
  const { user, refreshProfile } = useAuth();
  const enabled = !!user?.mfaEnabled;

  const [enrollment, setEnrollment] = useState<MfaEnrollData | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Disable form
  const [disablePassword, setDisablePassword] = useState("");

  const startEnroll = async () => {
    setBusy(true);
    setError("");
    try {
      const data = await authApi.mfaEnroll();
      setEnrollment(data);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Couldn't start MFA enrollment.";
      setError(msg);
      toast.error("MFA setup failed", { description: msg });
    } finally {
      setBusy(false);
    }
  };

  const verifyEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await authApi.mfaVerify(code);
      await refreshProfile();
      setEnrollment(null);
      setCode("");
      toast.success("MFA enabled", { description: "Your account is now protected with 2FA." });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Invalid code.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  const disable = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await authApi.mfaDisable(disablePassword);
      await refreshProfile();
      setDisablePassword("");
      toast.success("MFA disabled");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Couldn't disable MFA.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  const regenerateRecoveryCodes = async () => {
    setBusy(true);
    setError("");
    try {
      const { recovery_codes } = await authApi.mfaRecoveryCodes();
      // Show the new codes via a temporary enrollment-like state.
      setEnrollment({
        secret: "",
        qr_uri: "",
        recovery_codes,
      });
      toast.success("New recovery codes generated");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Couldn't regenerate codes.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  // ---- Render -------------------------------------------------------------

  // Step: showing QR / enrollment confirmation
  if (enrollment && enrollment.qr_uri) {
    return (
      <div className="rounded-2xl border border-gray-700 bg-[#141927] p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Scan this QR code</h3>
        <p className="text-sm text-gray-400">
          Use Google Authenticator, 1Password, Authy, or any TOTP-compatible app.
        </p>

        {/* Render the otpauth URI as a QR code via Google Charts (no extra dep) */}
        <div className="flex justify-center bg-white p-4 rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="MFA QR code"
            src={`https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(enrollment.qr_uri)}`}
            width={200}
            height={200}
          />
        </div>

        <div className="rounded-lg border border-gray-700 bg-[#0f1320] p-3 text-xs text-gray-400">
          <p className="mb-1 text-gray-500">Or enter this secret manually:</p>
          <code className="font-mono text-teal-400 break-all">{enrollment.secret}</code>
        </div>

        <RecoveryCodes codes={enrollment.recovery_codes} />

        <form onSubmit={verifyEnrollment} className="space-y-3">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter the 6-digit code from your app"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="w-full rounded-lg border border-gray-700 bg-[#0f1320] px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-500"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={busy || code.length !== 6}
            className="w-full rounded-lg bg-teal-500 py-2.5 text-sm font-semibold text-white hover:bg-teal-400 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {busy ? "Verifying…" : "Verify & enable"}
          </button>
        </form>
      </div>
    );
  }

  // Step: showing newly regenerated recovery codes (no qr_uri set)
  if (enrollment && enrollment.recovery_codes.length > 0) {
    return (
      <div className="rounded-2xl border border-gray-700 bg-[#141927] p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">New recovery codes</h3>
        <p className="text-sm text-gray-400">
          Save these somewhere safe. Each code can be used once if you lose access to your authenticator app.
        </p>
        <RecoveryCodes codes={enrollment.recovery_codes} />
        <button
          type="button"
          onClick={() => setEnrollment(null)}
          className="w-full rounded-lg bg-teal-500 py-2.5 text-sm font-semibold text-white hover:bg-teal-400"
        >
          I&apos;ve saved them
        </button>
      </div>
    );
  }

  // Default panel
  return (
    <div className="rounded-2xl border border-gray-700 bg-[#141927] p-6 space-y-4">
      <div className="flex items-start gap-3">
        {enabled ? (
          <ShieldCheck className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
        ) : (
          <ShieldOff className="h-6 w-6 text-amber-400 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <h3 className="text-base font-semibold text-white">Two-factor authentication</h3>
          <p className="text-sm text-gray-400 mt-0.5">
            {enabled
              ? "Your account is protected with TOTP-based 2FA."
              : "Add an extra layer of security to your account using an authenticator app."}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {enabled ? (
        <>
          <button
            type="button"
            onClick={regenerateRecoveryCodes}
            disabled={busy}
            className="w-full rounded-lg border border-gray-700 bg-[#0f1320] py-2.5 text-sm font-medium text-white hover:border-gray-500 disabled:opacity-50"
          >
            Regenerate recovery codes
          </button>

          <form onSubmit={disable} className="space-y-3 pt-2 border-t border-gray-800">
            <p className="text-sm text-gray-400">Confirm your password to disable 2FA:</p>
            <input
              type="password"
              placeholder="Current password"
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-[#0f1320] px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              disabled={busy || !disablePassword}
              className="w-full rounded-lg bg-red-500/20 border border-red-500/40 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/30 disabled:opacity-50"
            >
              {busy ? "Disabling…" : "Disable 2FA"}
            </button>
          </form>
        </>
      ) : (
        <button
          type="button"
          onClick={startEnroll}
          disabled={busy}
          className="w-full rounded-lg bg-teal-500 py-2.5 text-sm font-semibold text-white hover:bg-teal-400 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {busy ? "Setting up…" : "Set up 2FA"}
        </button>
      )}
    </div>
  );
}

function RecoveryCodes({ codes }: { codes: string[] }) {
  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
      <p className="text-xs text-amber-400 mb-2">
        Save these recovery codes — they let you sign in if you lose your authenticator.
      </p>
      <div className="grid grid-cols-2 gap-2 font-mono text-sm text-amber-300">
        {codes.map((c) => (
          <div key={c} className="rounded bg-amber-500/10 px-2 py-1 text-center">
            {c}
          </div>
        ))}
      </div>
    </div>
  );
}
