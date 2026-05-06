"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { ApiError, authApi } from "@/lib/api";

function ResetPasswordFormInner() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";

  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token.trim()) {
      setError("Reset token is missing. Please use the link from your email.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    // Backend requires uppercase, lowercase, digit, special char.
    if (
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/\d/.test(password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      setError("Password must include upper- and lower-case letters, a digit and a special character.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      await authApi.resetPassword({ token: token.trim(), new_password: password });
      setIsSubmitted(true);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      setError(msg);
      toast.error("Reset failed", { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-teal-500/10">
          <CheckCircle2 className="h-6 w-6 text-teal-500" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Password reset</h1>
        <p className="text-sm text-gray-400 mb-8 text-center">
          Your password has been successfully reset. You can now sign in with your new password.
        </p>

        <Link
          href="/login"
          className="w-full rounded-full bg-teal-500 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-teal-400 flex items-center justify-center"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="22" width="28" height="20" rx="4" fill="url(#lock-gradient-rs)" />
          <path
            d="M16 22V16C16 11.58 19.58 8 24 8C28.42 8 32 11.58 32 16V22"
            stroke="url(#lock-gradient-rs)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="24" cy="32" r="3" fill="#0a0e1a" />
          <defs>
            <linearGradient id="lock-gradient-rs" x1="24" y1="8" x2="24" y2="42" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f59e0b" />
              <stop offset="1" stopColor="#f97316" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">Set new password</h1>
      <p className="text-sm text-gray-400 mb-8 text-center">
        Must be at least 8 characters with upper, lower, digit, and special character.
      </p>

      {error && (
        <div className="w-full mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {!tokenFromUrl && (
          <input
            type="text"
            placeholder="Reset token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            disabled={isLoading}
            className="w-full rounded-full border border-gray-700 bg-[#141927] px-5 py-3.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-teal-500 disabled:opacity-50"
          />
        )}

        <input
          type="password"
          placeholder="New password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          className="w-full rounded-full border border-gray-700 bg-[#141927] px-5 py-3.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-teal-500 disabled:opacity-50"
        />

        <input
          type="password"
          placeholder="Confirm password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isLoading}
          className="w-full rounded-full border border-gray-700 bg-[#141927] px-5 py-3.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-teal-500 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-full bg-teal-500 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-teal-400 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Resetting...
            </>
          ) : (
            "Reset password"
          )}
        </button>
      </form>

      <Link
        href="/login"
        className="mt-6 flex items-center gap-2 text-sm text-teal-500 hover:text-teal-400 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>
    </div>
  );
}

export function ResetPasswordForm() {
  // useSearchParams() requires a Suspense boundary in the App Router.
  return (
    <Suspense fallback={<div className="text-sm text-gray-400">Loading…</div>}>
      <ResetPasswordFormInner />
    </Suspense>
  );
}
