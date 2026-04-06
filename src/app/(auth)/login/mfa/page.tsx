"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, KeyRound, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";

export default function MfaVerificationPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect to login if no pending MFA session & extract email
  useEffect(() => {
    const pending = sessionStorage.getItem("mfa-pending");
    if (!pending) {
      router.replace("/login");
      return;
    }
    const { email } = JSON.parse(pending);
    if (email) {
      const [user, domain] = email.split("@");
      const masked = user.slice(0, 2) + "***@" + domain;
      setMaskedEmail(masked);
    }
  }, [router]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResendCode = () => {
    if (resendCooldown > 0) return;
    setResendCooldown(30);
    toast.success("Code sent!", {
      description: `A new verification code has been sent to ${maskedEmail}`,
    });
  };

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

  const completeMfaLogin = () => {
    const raw = sessionStorage.getItem("mfa-pending");
    if (!raw) {
      router.replace("/login");
      return;
    }
    const { rememberMe, ...cred } = JSON.parse(raw);
    sessionStorage.removeItem("mfa-pending");
    login(cred, rememberMe);
    toast.success("Welcome back!", {
      description: `Signed in as ${cred.fullName}`,
    });
    router.push("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 1200));

    if (showRecovery) {
      if (recoveryCode.trim().length >= 8) {
        completeMfaLogin();
        return;
      }
      setError("Invalid recovery code.");
      toast.error("Invalid recovery code", {
        description: "Please enter a valid recovery code.",
      });
    } else {
      const entered = code.join("");
      if (entered === "123456") {
        completeMfaLogin();
        return;
      }
      setError("Invalid verification code. Try 123456 for testing.");
      toast.error("Invalid code", {
        description: "The verification code is incorrect. Try 123456 for testing.",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Icon */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/15">
        <Mail className="h-8 w-8 text-teal-400" />
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">Check your email</h1>
      <p className="text-sm text-gray-400 mb-2 text-center">
        {showRecovery
          ? "Enter one of your recovery codes"
          : "We sent a 6-digit verification code to"}
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
            placeholder="XXXX-XXXX-XXXX"
            value={recoveryCode}
            onChange={(e) => { setRecoveryCode(e.target.value); setError(""); }}
            disabled={isLoading}
            className="w-full rounded-full border border-gray-700 bg-[#141927] px-5 py-3.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-teal-500 text-center tracking-widest disabled:opacity-50"
          />
        ) : (
          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
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
            <><Loader2 className="h-4 w-4 animate-spin" />Verifying...</>
          ) : (
            "Verify"
          )}
        </button>
      </form>

      {/* Resend code */}
      {!showRecovery && (
        <button
          onClick={handleResendCode}
          disabled={resendCooldown > 0}
          className="mt-4 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:hover:text-gray-400"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {resendCooldown > 0
            ? `Resend code in ${resendCooldown}s`
            : "Didn\u2019t receive the code? Resend"}
        </button>
      )}

      {/* Toggle recovery / email code */}
      <button
        onClick={() => { setShowRecovery(!showRecovery); setError(""); }}
        className="mt-3 flex items-center gap-2 text-sm text-teal-500 hover:text-teal-400 transition-colors"
      >
        <KeyRound className="h-4 w-4" />
        {showRecovery ? "Use email code" : "Use recovery code instead"}
      </button>

      <Link href="/login" className="mt-4 text-sm text-gray-400 hover:text-white transition-colors">
        Back to sign in
      </Link>
    </div>
  );
}
