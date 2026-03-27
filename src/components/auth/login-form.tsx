"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // TODO: Replace with actual Identity & Access Service API call
    // API: authenticate(email, password)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (!email || !password) {
        setError("Please enter both email and password.");
        return;
      }

      // Hardcoded credentials — replace with actual API call
      if (email === "superadmin" && password === "1") {
        login({
          fullName: "Super Admin",
          email: "superadmin@glimmora.com",
          role: "super_admin",
        });
        setIsLoading(false);
        router.push("/dashboard");
        return;
      } else {
        setError("Invalid username or password.");
      }
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
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
            <linearGradient
              id="bolt-gradient"
              x1="24"
              y1="4"
              x2="24"
              y2="44"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#f59e0b" />
              <stop offset="1" stopColor="#f97316" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Header */}
      <h1 className="text-3xl font-bold text-white mb-2">Glimmora Fabric</h1>
      <p className="text-sm text-gray-400 mb-8">
        Please enter your details to sign in
      </p>

      {/* Error */}
      {error && (
        <div className="w-full mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <input
            type="text"
            placeholder="Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="w-full rounded-full border border-gray-700 bg-[#141927] px-5 py-3.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-teal-500 disabled:opacity-50"
          />
        </div>

        <div>
          <input
            type="password"
            placeholder="Enter a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="w-full rounded-full border border-gray-700 bg-[#141927] px-5 py-3.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-teal-500 disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-full bg-teal-500 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-teal-400 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      {/* Forgot password */}
      <Link
        href="/forgot-password"
        className="mt-4 text-sm text-teal-500 hover:text-teal-400 transition-colors"
      >
        Forgot Password?
      </Link>

      {/* Divider */}
      <div className="my-6 flex w-full items-center gap-4">
        <div className="h-px flex-1 bg-gray-700" />
        <span className="text-xs text-gray-500 uppercase">Or</span>
        <div className="h-px flex-1 bg-gray-700" />
      </div>

      {/* SSO Buttons */}
      <div className="w-full space-y-3">
        {/* Google */}
        <button
          type="button"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-700 bg-[#141927] py-3.5 text-sm text-white transition-colors hover:border-gray-500 hover:bg-[#1a2035] disabled:opacity-50"
        >
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
          Login with Google
        </button>

        {/* Microsoft */}
        <button
          type="button"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-700 bg-[#141927] py-3.5 text-sm text-white transition-colors hover:border-gray-500 hover:bg-[#1a2035] disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <rect x="1" y="1" width="10" height="10" fill="#F25022" />
            <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
            <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
            <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
          </svg>
          Login with Microsoft
        </button>
      </div>
    </div>
  );
}
