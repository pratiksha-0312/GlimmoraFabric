"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/auth-context";
import { ApiError, oauthApi } from "@/lib/api";

const SSO_PROVIDERS = ["google", "microsoft", "github"] as const;

const loginSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Please enter a valid email."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleSocialLogin = async (provider: string) => {
    setOauthLoading(provider);
    try {
      // Tell the backend to redirect the browser back to OUR frontend page
      // after Google auth. That page exchanges the code for a token via the
      // backend, installs the session, and routes to the dashboard.
      const redirectUri = `${window.location.origin}/auth/callback/${provider}`;
      const { authorization_url } = await oauthApi.startLogin(provider, redirectUri);
      window.location.href = authorization_url;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Couldn't start social login.";
      toast.error("Login failed", { description: msg });
      setOauthLoading(null);
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const result = await login(data.email, data.password, rememberMe);

      if (result.mfaRequired) {
        // Stash the credentials needed for MFA completion (sessionStorage only — single tab).
        sessionStorage.setItem(
          "glimmora_mfa_pending",
          JSON.stringify({
            email: data.email,
            password: data.password,
            rememberMe,
          }),
        );
        router.push("/login/mfa");
        return;
      }

      if (result.user) {
        toast.success("Welcome back!", { description: `Signed in as ${result.user.fullName || result.user.email}` });
        router.push("/dashboard");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 423) {
          toast.error("Account locked", { description: err.message });
        } else if (err.status === 401) {
          toast.error("Sign in failed", { description: "Email or password is incorrect." });
        } else if (err.status === 403) {
          toast.error("Account inactive", { description: err.message });
        } else {
          toast.error("Something went wrong", { description: err.message });
        }
      } else {
        toast.error("Network error", { description: "Please check your connection and try again." });
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Lightning Icon */}
      <div className="mb-6">
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M26 4L8 28H24L22 44L40 20H24L26 4Z"
            fill="url(#bolt-gradient)"
            stroke="url(#bolt-gradient)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="bolt-gradient" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f59e0b" />
              <stop offset="1" stopColor="#f97316" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">Glimmora Fabric</h1>
      <p className="text-sm text-gray-400 mb-8">Please enter your details to sign in</p>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
        <div>
          <input
            type="email"
            placeholder="Email"
            autoComplete="email"
            {...register("email")}
            disabled={isSubmitting}
            className="w-full rounded-full border border-gray-700 bg-[#141927] px-5 py-3.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-teal-500 disabled:opacity-50"
          />
          {errors.email && (
            <p className="mt-1.5 px-5 text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            {...register("password")}
            disabled={isSubmitting}
            className="w-full rounded-full border border-gray-700 bg-[#141927] px-5 py-3.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-teal-500 disabled:opacity-50"
          />
          {errors.password && (
            <p className="mt-1.5 px-5 text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isSubmitting}
            className="h-4 w-4 rounded border-gray-600 bg-[#141927] accent-teal-500"
          />
          <span className="text-sm text-gray-400">Remember me</span>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-teal-500 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-teal-400 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <Link
        href="/forgot-password"
        className="mt-4 text-sm text-teal-500 hover:text-teal-400 transition-colors"
      >
        Forgot Password?
      </Link>

      <div className="my-6 flex w-full items-center gap-4">
        <div className="h-px flex-1 bg-gray-700" />
        <span className="text-xs text-gray-500 uppercase">Or</span>
        <div className="h-px flex-1 bg-gray-700" />
      </div>

      <div className="w-full space-y-3">
        {SSO_PROVIDERS.map((provider) => (
          <SsoButton
            key={provider}
            provider={provider}
            loading={oauthLoading === provider}
            disabled={isSubmitting || oauthLoading !== null}
            onClick={() => handleSocialLogin(provider)}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function SsoButton({
  provider,
  label,
  loading,
  disabled,
  onClick,
}: {
  provider: string;
  label?: string;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const defaultLabels: Record<string, string> = {
    google: "Continue with Google",
    microsoft: "Continue with Microsoft",
    github: "Continue with GitHub",
  };
  const buttonLabel = label ?? defaultLabels[provider] ?? `Continue with ${provider}`;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-700 bg-[#141927] py-3.5 text-sm text-white transition-colors hover:border-gray-500 hover:bg-[#1a2035] disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ProviderIcon provider={provider} />
      )}
      {buttonLabel}
    </button>
  );
}

function ProviderIcon({ provider }: { provider: string }) {
  if (provider === "google") {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
    );
  }
  if (provider === "microsoft") {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <rect x="1" y="1" width="10" height="10" fill="#F25022" />
        <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
        <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
        <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
      </svg>
    );
  }
  if (provider === "github") {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="white">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    );
  }
  return null;
}
