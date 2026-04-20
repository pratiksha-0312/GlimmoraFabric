"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "your email";
  const [cooldown, setCooldown] = useState(0);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleResend = () => {
    setCooldown(60);
    setResent(true);
  };

  return (
    <div className="flex flex-col items-center text-center">
      {/* Icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-teal-500/15">
        <Mail className="h-10 w-10 text-teal-400" />
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">Check your email</h1>
      <p className="text-sm text-gray-400 mb-2 max-w-sm">
        We&apos;ve sent a verification link to
      </p>
      <p className="text-sm font-semibold text-teal-400 mb-6">{email}</p>
      <p className="text-xs text-gray-500 mb-8 max-w-sm">
        Click the link in the email to verify your account. If you don&apos;t see it, check your spam folder.
      </p>

      {/* Resend */}
      {resent && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          Verification email resent!
        </div>
      )}

      <button
        onClick={handleResend}
        disabled={cooldown > 0}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-teal-500 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-teal-400 disabled:opacity-50"
      >
        <RefreshCw className="h-4 w-4" />
        {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend verification email"}
      </button>

      {/* Back to login */}
      <Link
        href="/login"
        className="mt-6 flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-teal-500/15">
          <Mail className="h-10 w-10 text-teal-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Check your email</h1>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
