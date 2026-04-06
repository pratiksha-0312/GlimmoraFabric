"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, Check, User } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import type { UserRole } from "@/lib/roles";

// ---------------------------------------------------------------------------
// Types & Data
// ---------------------------------------------------------------------------

type ProviderKey = "google" | "microsoft" | "github";

interface MockAccount {
  id: string;
  fullName: string;
  email: string;
  username?: string;
  role: UserRole;
  isAdmin: boolean;
}

const PROVIDER_CONFIG: Record<
  ProviderKey,
  {
    label: string;
    logoColor: string;
    headerBg: string;
    headerBorder: string;
    accentText: string;
    accentBg: string;
    accounts: MockAccount[];
  }
> = {
  google: {
    label: "Google",
    logoColor: "text-white",
    headerBg: "bg-gradient-to-r from-blue-600 via-red-500 to-yellow-500",
    headerBorder: "border-blue-500/30",
    accentText: "text-blue-400",
    accentBg: "bg-blue-500/10",
    accounts: [
      {
        id: "g1",
        fullName: "Pratiksha Yadav",
        email: "pratiksha@gmail.com",
        role: "developer",
        isAdmin: false,
      },
      {
        id: "g2",
        fullName: "Glimmora Admin",
        email: "admin@glimmora.com",
        role: "super_admin",
        isAdmin: true,
      },
    ],
  },
  microsoft: {
    label: "Microsoft",
    logoColor: "text-white",
    headerBg: "bg-gradient-to-r from-[#00a4ef] via-[#7fba00] to-[#f25022]",
    headerBorder: "border-[#00a4ef]/30",
    accentText: "text-sky-400",
    accentBg: "bg-sky-500/10",
    accounts: [
      {
        id: "m1",
        fullName: "Pratiksha Yadav",
        email: "pratiksha@outlook.com",
        role: "developer",
        isAdmin: false,
      },
      {
        id: "m2",
        fullName: "Glimmora Admin",
        email: "admin@glimmora.org",
        role: "super_admin",
        isAdmin: true,
      },
    ],
  },
  github: {
    label: "GitHub",
    logoColor: "text-white",
    headerBg: "bg-gradient-to-r from-gray-800 to-gray-900",
    headerBorder: "border-gray-600/30",
    accentText: "text-gray-300",
    accentBg: "bg-gray-700/50",
    accounts: [
      {
        id: "gh1",
        fullName: "Pratiksha Dev",
        email: "pratiksha-dev@github.com",
        username: "pratiksha-dev",
        role: "developer",
        isAdmin: false,
      },
      {
        id: "gh2",
        fullName: "Glimmora Admin",
        email: "glimmora-admin@github.com",
        username: "glimmora-admin",
        role: "super_admin",
        isAdmin: true,
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Provider Logo SVGs
// ---------------------------------------------------------------------------

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function MicrosoftLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
      <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}

function GitHubLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function ProviderLogo({ provider, className }: { provider: ProviderKey; className?: string }) {
  switch (provider) {
    case "google":
      return <GoogleLogo className={className} />;
    case "microsoft":
      return <MicrosoftLogo className={className} />;
    case "github":
      return <GitHubLogo className={className} />;
  }
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

type Step = "connecting" | "selecting" | "signing-in";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function OAuthCallbackPage() {
  const params = useParams<{ provider: string }>();
  const router = useRouter();
  const { login } = useAuth();

  const providerSlug = (params.provider ?? "google") as ProviderKey;
  const config = PROVIDER_CONFIG[providerSlug] ?? PROVIDER_CONFIG.google;

  const [step, setStep] = useState<Step>("connecting");
  const [selectedAccount, setSelectedAccount] = useState<MockAccount | null>(null);

  // Step 1: auto-advance after 1.5s
  useEffect(() => {
    if (step !== "connecting") return;
    const timer = setTimeout(() => setStep("selecting"), 1500);
    return () => clearTimeout(timer);
  }, [step]);

  // Step 3: sign-in then redirect after 1s
  useEffect(() => {
    if (step !== "signing-in" || !selectedAccount) return;

    const timer = setTimeout(() => {
      login(
        {
          fullName: selectedAccount.fullName,
          email: selectedAccount.email,
          role: selectedAccount.role,
        },
        true,
      );
      router.replace("/dashboard");
    }, 1000);

    return () => clearTimeout(timer);
  }, [step, selectedAccount, login, router]);

  const handleSelectAccount = useCallback(
    (account: MockAccount) => {
      setSelectedAccount(account);
      setStep("signing-in");
    },
    [],
  );

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const stepIndicator = (
    <div className="flex items-center justify-center gap-2 mb-8">
      {(["connecting", "selecting", "signing-in"] as Step[]).map((s, i) => {
        const isActive = step === s;
        const isDone =
          (s === "connecting" && step !== "connecting") ||
          (s === "selecting" && step === "signing-in");

        return (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className={`w-8 h-px ${
                  isDone || isActive ? "bg-teal-500" : "bg-gray-700"
                }`}
              />
            )}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                isDone
                  ? "bg-teal-500 text-white"
                  : isActive
                    ? "bg-teal-500/20 text-teal-400 ring-1 ring-teal-500"
                    : "bg-gray-800 text-gray-500"
              }`}
            >
              {isDone ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ---------------------------------------------------------------------------
  // Step 1 - Connecting
  // ---------------------------------------------------------------------------

  if (step === "connecting") {
    return (
      <Shell provider={providerSlug} config={config}>
        {stepIndicator}
        <div className="flex flex-col items-center gap-5">
          <div
            className={`w-16 h-16 rounded-2xl ${config.accentBg} flex items-center justify-center`}
          >
            <ProviderLogo provider={providerSlug} className="w-8 h-8" />
          </div>
          <div className="text-center">
            <p className="text-white text-lg font-medium">
              Connecting to {config.label}...
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Establishing a secure connection
            </p>
          </div>
          <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
        </div>
      </Shell>
    );
  }

  // ---------------------------------------------------------------------------
  // Step 2 - Account selection
  // ---------------------------------------------------------------------------

  if (step === "selecting") {
    return (
      <Shell provider={providerSlug} config={config}>
        {stepIndicator}
        <div className="text-center mb-6">
          <p className="text-white text-lg font-medium">Choose an account</p>
          <p className="text-gray-400 text-sm mt-1">
            to continue to Glimmora Fabric
          </p>
        </div>

        <div className="space-y-3">
          {config.accounts.map((account) => (
            <button
              key={account.id}
              type="button"
              onClick={() => handleSelectAccount(account)}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#141927] border border-gray-700 hover:border-teal-500/50 hover:bg-[#1a2035] transition-all group cursor-pointer text-left"
            >
              {/* Avatar */}
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                  account.isAdmin
                    ? "bg-teal-500/20 text-teal-400"
                    : `${config.accentBg} ${config.accentText}`
                }`}
              >
                <User className="w-5 h-5" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                {providerSlug === "github" && account.username ? (
                  <>
                    <p className="text-white text-sm font-medium truncate">
                      @{account.username}
                    </p>
                    <p className="text-gray-500 text-xs truncate">
                      {account.fullName}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-white text-sm font-medium truncate">
                      {account.fullName}
                    </p>
                    <p className="text-gray-500 text-xs truncate">
                      {account.email}
                    </p>
                  </>
                )}
              </div>

              {/* Badge */}
              {account.isAdmin && (
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-teal-500/10 text-teal-400 flex-shrink-0">
                  Admin
                </span>
              )}

              {/* Arrow */}
              <svg
                className="w-4 h-4 text-gray-600 group-hover:text-teal-500 transition-colors flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </Shell>
    );
  }

  // ---------------------------------------------------------------------------
  // Step 3 - Signing in
  // ---------------------------------------------------------------------------

  return (
    <Shell provider={providerSlug} config={config}>
      {stepIndicator}
      <div className="flex flex-col items-center gap-5">
        <div
          className={`w-16 h-16 rounded-2xl ${config.accentBg} flex items-center justify-center`}
        >
          <ProviderLogo provider={providerSlug} className="w-8 h-8" />
        </div>
        <div className="text-center">
          <p className="text-white text-lg font-medium">Signing you in...</p>
          <p className="text-gray-400 text-sm mt-1">
            {selectedAccount?.email ?? ""}
          </p>
        </div>
        <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
      </div>
    </Shell>
  );
}

// ---------------------------------------------------------------------------
// Shell wrapper (branded header + cancel link)
// ---------------------------------------------------------------------------

function Shell({
  provider,
  config,
  children,
}: {
  provider: ProviderKey;
  config: (typeof PROVIDER_CONFIG)[ProviderKey];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0d1120] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Branded header bar */}
        <div className={`h-1.5 rounded-t-2xl ${config.headerBg}`} />

        {/* Card */}
        <div className="bg-[#141927] border border-gray-700 border-t-0 rounded-b-2xl p-8">
          {/* Provider pill */}
          <div className="flex justify-center mb-6">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${config.accentBg} ${config.accentText}`}
            >
              <ProviderLogo provider={provider} className="w-3.5 h-3.5" />
              {config.label} OAuth
            </span>
          </div>

          {children}
        </div>

        {/* Cancel link */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Cancel and return to login
          </Link>
        </div>
      </div>
    </div>
  );
}
