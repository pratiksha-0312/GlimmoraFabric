"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, Mail, ShieldAlert } from "lucide-react";

import { ApiError, authApi } from "@/lib/api";

type Status = "idle" | "verifying" | "success" | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tokenFromUrl = searchParams.get("token") ?? "";
  const emailFromUrl = searchParams.get("email") ?? "";

  const [status, setStatus] = useState<Status>(tokenFromUrl ? "verifying" : "idle");
  const [errorMsg, setErrorMsg] = useState("");
  const attempted = useRef(false);

  // Auto-verify if a token is present in the URL.
  useEffect(() => {
    if (!tokenFromUrl || attempted.current) return;
    attempted.current = true;

    setStatus("verifying");
    authApi
      .verifyEmail(tokenFromUrl)
      .then(() => setStatus("success"))
      .catch((err) => {
        const msg = err instanceof ApiError ? err.message : "We couldn't verify your email.";
        setErrorMsg(msg);
        setStatus("error");
      });
  }, [tokenFromUrl]);

  // Redirect to login a few seconds after success.
  useEffect(() => {
    if (status !== "success") return;
    const t = setTimeout(() => router.replace("/login"), 3000);
    return () => clearTimeout(t);
  }, [status, router]);

  if (status === "verifying") {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-teal-500/15">
          <Loader2 className="h-10 w-10 text-teal-400 animate-spin" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Verifying your email…</h1>
        <p className="text-sm text-gray-400">Hang tight, this only takes a moment.</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/15">
          <CheckCircle2 className="h-10 w-10 text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Email verified</h1>
        <p className="text-sm text-gray-400 mb-6">Your account is now active. Redirecting to sign in…</p>
        <Link
          href="/login"
          className="rounded-full bg-teal-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-400"
        >
          Continue to sign in
        </Link>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/15">
          <ShieldAlert className="h-10 w-10 text-red-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Verification failed</h1>
        <p className="text-sm text-gray-400 mb-6 max-w-sm">{errorMsg}</p>
        <Link
          href="/login"
          className="flex items-center gap-2 text-sm text-teal-500 hover:text-teal-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    );
  }

  // Idle — token not in URL. Show the "check your email" message.
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-teal-500/15">
        <Mail className="h-10 w-10 text-teal-400" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">Check your email</h1>
      <p className="text-sm text-gray-400 mb-2 max-w-sm">We&apos;ve sent a verification link to</p>
      <p className="text-sm font-semibold text-teal-400 mb-6">{emailFromUrl || "your email"}</p>
      <p className="text-xs text-gray-500 mb-8 max-w-sm">
        Click the link in the email to verify your account. If you don&apos;t see it, check your spam folder.
      </p>

      <Link
        href="/login"
        className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-teal-500/15">
            <Loader2 className="h-10 w-10 text-teal-400 animate-spin" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Loading…</h1>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
