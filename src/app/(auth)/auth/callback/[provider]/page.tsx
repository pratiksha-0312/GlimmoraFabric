"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, ShieldAlert } from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { ApiError, oauthApi } from "@/lib/api";

// ---------------------------------------------------------------------------

const PROVIDER_LABEL: Record<string, string> = {
  google: "Google",
  github: "GitHub",
  microsoft: "Microsoft",
};

type Status = "exchanging" | "success" | "error" | "missing-code";

// ---------------------------------------------------------------------------
// The OAuth provider redirects the browser back to this URL with `code` and
// `state` query parameters.  We forward both to the backend, which exchanges
// them for tokens, creates/links the user, and returns the token pair plus
// user record. We install that session and bounce the user to the dashboard.
// ---------------------------------------------------------------------------

function OAuthCallbackInner() {
  const params = useParams<{ provider: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setSession } = useAuth();

  const provider = (params.provider ?? "").toLowerCase();
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  const [status, setStatus] = useState<Status>(code && state ? "exchanging" : "missing-code");
  const [errorMsg, setErrorMsg] = useState(oauthError ?? "");
  const attempted = useRef(false);

  useEffect(() => {
    if (!code || !state || attempted.current) return;
    attempted.current = true;

    (async () => {
      try {
        const result = await oauthApi.handleCallback(provider, code, state);
        setSession({ tokens: result.token, user: result.user, remember: true });
        setStatus("success");
        // Brief success state, then redirect.
        setTimeout(() => router.replace("/dashboard"), 1200);
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : "Couldn't complete sign-in.";
        setErrorMsg(msg);
        setStatus("error");
      }
    })();
  }, [provider, code, state, router, setSession]);

  const label = PROVIDER_LABEL[provider] ?? provider;

  return (
    <div className="min-h-screen bg-[#0d1120] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="h-1.5 rounded-t-2xl bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500" />
        <div className="bg-[#141927] border border-gray-700 border-t-0 rounded-b-2xl p-8">
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-teal-500/10 text-teal-400">
              {label} OAuth
            </span>
          </div>

          {status === "exchanging" && (
            <div className="flex flex-col items-center gap-5">
              <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
              <div className="text-center">
                <p className="text-white text-lg font-medium">Signing you in…</p>
                <p className="text-gray-400 text-sm mt-1">Connecting your {label} account</p>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <div className="text-center">
                <p className="text-white text-lg font-medium">Signed in</p>
                <p className="text-gray-400 text-sm mt-1">Redirecting to your dashboard…</p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <ShieldAlert className="w-8 h-8 text-red-400" />
              </div>
              <div className="text-center">
                <p className="text-white text-lg font-medium">Sign-in failed</p>
                <p className="text-gray-400 text-sm mt-1 max-w-xs">{errorMsg}</p>
              </div>
            </div>
          )}

          {status === "missing-code" && (
            <div className="flex flex-col items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                <ShieldAlert className="w-8 h-8 text-amber-400" />
              </div>
              <div className="text-center">
                <p className="text-white text-lg font-medium">No authorization code</p>
                <p className="text-gray-400 text-sm mt-1 max-w-xs">
                  We didn&apos;t receive a sign-in code from {label}. Please try again from the login page.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0d1120] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
        </div>
      }
    >
      <OAuthCallbackInner />
    </Suspense>
  );
}
