"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { UserRole } from "@/lib/roles";

export function SignupForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("member");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const roleOptions: {
    value: UserRole;
    label: string;
    description: string;
    borderColor: string;
    selectedBg: string;
  }[] = [
    {
      value: "super_admin",
      label: "Super Admin",
      description: "Full platform access",
      borderColor: "border-teal-500",
      selectedBg: "bg-teal-500/10",
    },
    {
      value: "admin",
      label: "Admin",
      description: "Service & infrastructure management",
      borderColor: "border-blue-500",
      selectedBg: "bg-blue-500/10",
    },
    {
      value: "member",
      label: "Member",
      description: "Workflows, reports & features",
      borderColor: "border-amber-500",
      selectedBg: "bg-amber-500/10",
    },
    {
      value: "viewer",
      label: "Viewer",
      description: "Read-only dashboard access",
      borderColor: "border-gray-400",
      selectedBg: "bg-gray-400/10",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    // TODO: Replace with actual Identity & Access Service API call
    // API: register(fullName, email, password)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (!fullName || !email || !password) {
        setError("Please fill in all fields.");
        return;
      }

      console.log("Signup attempt:", { fullName, email, role });
      // router.push("/dashboard")
    } catch {
      setError("Something went wrong. Please try again.");
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
            fill="url(#bolt-gradient-signup)"
            stroke="url(#bolt-gradient-signup)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient
              id="bolt-gradient-signup"
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
      <h1 className="text-3xl font-bold text-white mb-2">Create account</h1>
      <p className="text-sm text-gray-400 mb-8">
        Get started with Glimmora Fabric
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
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={isLoading}
            className="w-full rounded-full border border-gray-700 bg-[#141927] px-5 py-3.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-teal-500 disabled:opacity-50"
          />
        </div>

        <div>
          <input
            type="email"
            placeholder="Email address"
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
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="w-full rounded-full border border-gray-700 bg-[#141927] px-5 py-3.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-teal-500 disabled:opacity-50"
          />
        </div>

        <div>
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
            className="w-full rounded-full border border-gray-700 bg-[#141927] px-5 py-3.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-teal-500 disabled:opacity-50"
          />
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-3">
            Select your role
          </label>
          <div className="grid grid-cols-2 gap-3">
            {roleOptions.map((opt) => {
              const isSelected = role === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={isLoading}
                  onClick={() => setRole(opt.value)}
                  className={`rounded-xl border p-4 cursor-pointer text-left transition-colors disabled:opacity-50 ${
                    isSelected
                      ? `${opt.borderColor} ${opt.selectedBg}`
                      : "border-gray-700 bg-[#141927] hover:border-gray-500"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">
                        {opt.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {opt.description}
                      </p>
                    </div>
                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                        isSelected
                          ? `${opt.borderColor} ${opt.selectedBg}`
                          : "border-gray-600"
                      }`}
                    >
                      {isSelected && (
                        <span
                          className={`block h-2 w-2 rounded-full ${
                            opt.value === "super_admin"
                              ? "bg-teal-500"
                              : opt.value === "admin"
                                ? "bg-blue-500"
                                : opt.value === "member"
                                  ? "bg-amber-500"
                                  : "bg-gray-400"
                          }`}
                        />
                      )}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-full bg-teal-500 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-teal-400 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>

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
          Sign up with Google
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
          Sign up with Microsoft
        </button>
      </div>

      {/* Sign in link */}
      <p className="mt-8 text-sm text-gray-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-teal-500 hover:text-teal-400 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
