"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Building2, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import type { UserRole } from "@/lib/roles";

export default function AcceptInvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [hasAccount, setHasAccount] = useState(false);
  const [orgName, setOrgName] = useState("");

  const handleAccept = async () => {
    if (!hasAccount) {
      if (!name.trim()) { setError("Name is required."); return; }
      if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
      if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    }
    setError("");
    setIsLoading(true);

    const res = await fetch("/api/orgs/invite/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, name, password }),
    });
    const data = await res.json();
    setIsLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    setOrgName(data.orgName);
    setAccepted(true);

    // Log the user in
    login({
      fullName: data.fullName,
      email: data.email,
      role: data.role as UserRole,
      tenantId: data.tenantId,
    });

    setTimeout(() => router.push("/dashboard"), 2000);
  };

  if (accepted) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/15">
          <CheckCircle2 className="h-10 w-10 text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">You&apos;ve joined {orgName || "the organization"}!</h1>
        <p className="text-sm text-gray-400">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/15">
        <Building2 className="h-8 w-8 text-teal-400" />
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">Join Organization</h1>
      <p className="text-sm text-gray-400 mb-8">
        You&apos;ve been invited to join an organization
      </p>

      {error && (
        <div className="w-full mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
      )}

      {/* Toggle */}
      <div className="w-full flex rounded-full border border-gray-700 mb-6 overflow-hidden">
        <button onClick={() => setHasAccount(false)}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${!hasAccount ? "bg-teal-500 text-white" : "text-gray-400"}`}>
          New Account
        </button>
        <button onClick={() => setHasAccount(true)}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${hasAccount ? "bg-teal-500 text-white" : "text-gray-400"}`}>
          Existing Account
        </button>
      </div>

      {hasAccount ? (
        <div className="w-full space-y-4">
          <p className="text-sm text-gray-400 text-center">Sign in to accept the invitation</p>
          <Link href="/login"
            className="flex w-full items-center justify-center rounded-full bg-teal-500 py-3.5 text-sm font-semibold text-white hover:bg-teal-400">
            Sign in to accept
          </Link>
        </div>
      ) : (
        <div className="w-full space-y-4">
          <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full rounded-full border border-gray-700 bg-[#141927] px-5 py-3.5 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-500" />
          <input type="password" placeholder="Create password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-full border border-gray-700 bg-[#141927] px-5 py-3.5 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-500" />
          <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-full border border-gray-700 bg-[#141927] px-5 py-3.5 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-500" />
          <button onClick={handleAccept} disabled={isLoading}
            className="w-full rounded-full bg-teal-500 py-3.5 text-sm font-semibold text-white hover:bg-teal-400 disabled:opacity-50 flex items-center justify-center gap-2">
            {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Joining...</> : "Accept & Join"}
          </button>
        </div>
      )}
    </div>
  );
}
