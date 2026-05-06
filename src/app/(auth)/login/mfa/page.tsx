"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/auth-context";
import { ApiError } from "@/lib/api";

interface PendingMfa {
  email: string;
  password: string;
  rememberMe: boolean;
}

const PENDING_KEY = "glimmora_mfa_pending";

export default function MfaVerificationPage() {
  const router = useRouter();
  const { completeMfaLogin } = useAuth();

  const [pending, setPending] = useState<PendingMfa | null>(null);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [showRecovery, setShowRecovery] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Recover the pending session and bounce out if not present.
  useEffect(() => {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) {
      router.replace("/login");
      return;
    }
    try {
      setPending(JSON.parse(raw) as PendingMfa);
    } catch {
      sessionStorage.removeItem(PENDING_KEY);
      router.replace("/login");
    }
  }, [router]);

  const maskedEmail = pending?.email
    ? (() => {
        const [user, domain] = pending.email.split("@");
        if (!domain) return pending.email;
        return `${user.slice(0, 2)}***@${domain}`;
      })()
    : "";

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...code];
    next[index] = value.slice(-1);
    setCode(next);
    setError("");
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...code];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] ?? "";
    setCode(next);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pending) return;

    setError("");
    setIsLoading(true);

    const mfaCode = showRecovery ? recoveryCode.trim() : code.join("");
    if ((showRecovery && mfaCode.length < 8) || (!showRecovery && mfaCode.length !== 6)) {
      setError(showRecovery ? "Enter a valid recovery code." : "Enter the 6-digit code.");
      setIsLoading(false);
      return;
    }

    try {
      const next = await completeMfaLogin({
        email: pending.email,
        password: pending.password,
        mfaCode,
        remember: pending.rememberMe,
      });

      sessionStorage.removeItem(PENDING_KEY);
      toast.success("Welcome back!", { description: `Signed in as ${next.fullName || next.email}` });
      router.push("/dashboard");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Verification failed.";
      setError(msg);
      toast.error("Invalid code", { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/15">
        <ShieldCheck className="h-8 w-8 text-teal-400" />
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">Two-factor authentication</h1>
      <p className="text-sm text-gray-400 mb-2 text-center">
        {showRecovery
          ? "Enter one of your recovery codes"
          : "Enter the 6-digit code from your authenticator app"}
      </p>
      {!showRecovery && maskedEmail && (
        <p className="text-sm text-teal-400 font-medium mb-8">{maskedEmail}</p>
      )}
      {(showRecovery || !maskedEmail) && <div className="mb-6" />}

      {error && (
        <div className="w-full mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full space-y-6">
        {showRecovery ? (
          <input
            type="text"
            placeholder="XXXXXXXX"
            value={recoveryCode}
            onChange={(e) => {
              setRecoveryCode(e.target.value);
              setError("");
            }}
            disabled={isLoading}
            className="w-full rounded-full border border-gray-700 bg-[#141927] px-5 py-3.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-teal-500 text-center tracking-widest disabled:opacity-50"
          />
        ) : (
          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={isLoading}
                className="h-14 w-12 rounded-xl border border-gray-700 bg-[#141927] text-center text-xl font-bold text-white outline-none transition-colors focus:border-teal-500 disabled:opacity-50"
              />
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || (!showRecovery && code.join("").length < 6)}
          className="w-full rounded-full bg-teal-500 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-teal-400 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </button>
      </form>

      <button
        onClick={() => {
          setShowRecovery((v) => !v);
          setError("");
        }}
        className="mt-4 flex items-center gap-2 text-sm text-teal-500 hover:text-teal-400 transition-colors"
      >
        <KeyRound className="h-4 w-4" />
        {showRecovery ? "Use authenticator code" : "Use recovery code instead"}
      </button>

      <Link
        href="/login"
        className="mt-4 text-sm text-gray-400 hover:text-white transition-colors"
        onClick={() => sessionStorage.removeItem(PENDING_KEY)}
      >
        Back to sign in
      </Link>
    </div>
  );
}
