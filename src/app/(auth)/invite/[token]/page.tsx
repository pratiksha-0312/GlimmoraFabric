"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/auth-context";
import { ApiError, authApi, orgsApi } from "@/lib/api";

export default function AcceptInvitePage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = params.token;

  const { user, isAuthenticated, isReady, login } = useAuth();

  const [mode, setMode] = useState<"new" | "existing">(isAuthenticated ? "existing" : "new");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);

  // When the auth context resolves, default the tab to "existing" if signed in.
  useEffect(() => {
    if (isReady && isAuthenticated) {
      setMode("existing");
      setEmail(user?.email ?? "");
    }
  }, [isReady, isAuthenticated, user]);

  // ---- Handlers -----------------------------------------------------------

  const acceptForUser = async () => {
    setIsLoading(true);
    try {
      await orgsApi.acceptInvitation(token);
      setAccepted(true);
      toast.success("You've joined the organization");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Couldn't accept invitation.";
      setError(msg);
      toast.error("Failed", { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) return setError("Email is required.");
    if (!name.trim()) return setError("Full name is required.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/\d/.test(password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      return setError("Password must include upper, lower, digit, and special character.");
    }
    if (password !== confirmPassword) return setError("Passwords do not match.");

    setIsLoading(true);
    try {
      // 1. Create the account
      await authApi.signup({ email: email.trim(), password, full_name: name.trim() });

      // 2. Sign in with the new credentials
      const result = await login(email.trim(), password, false);
      if (result.mfaRequired) {
        // Edge case: MFA on a brand-new account shouldn't happen, but just in case.
        sessionStorage.setItem(
          "glimmora_mfa_pending",
          JSON.stringify({ email: email.trim(), password, rememberMe: false }),
        );
        sessionStorage.setItem("glimmora_invite_token", token);
        router.push("/login/mfa");
        return;
      }

      // 3. Accept the invitation
      await orgsApi.acceptInvitation(token);
      setAccepted(true);
      toast.success("You've joined the organization");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Something went wrong.";
      setError(msg);
      toast.error("Failed", { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExistingLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) return setError("Enter email and password.");

    setIsLoading(true);
    try {
      const result = await login(email.trim(), password, false);
      if (result.mfaRequired) {
        sessionStorage.setItem(
          "glimmora_mfa_pending",
          JSON.stringify({ email: email.trim(), password, rememberMe: false }),
        );
        sessionStorage.setItem("glimmora_invite_token", token);
        router.push("/login/mfa");
        return;
      }
      await orgsApi.acceptInvitation(token);
      setAccepted(true);
      toast.success("You've joined the organization");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Something went wrong.";
      setError(msg);
      toast.error("Failed", { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  // ---- Render -------------------------------------------------------------

  if (accepted) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/15">
          <CheckCircle2 className="h-10 w-10 text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">You&apos;ve joined!</h1>
        <p className="text-sm text-gray-400">Redirecting to your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/15">
        <Building2 className="h-8 w-8 text-teal-400" />
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">Join Organization</h1>
      <p className="text-sm text-gray-400 mb-8">You&apos;ve been invited to join an organization</p>

      {error && (
        <div className="w-full mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Already signed in — one click to accept. */}
      {isAuthenticated && user ? (
        <div className="w-full space-y-4">
          <p className="text-sm text-gray-400 text-center">
            Signed in as <span className="text-white">{user.email}</span>
          </p>
          <button
            onClick={acceptForUser}
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-full bg-teal-500 py-3.5 text-sm font-semibold text-white hover:bg-teal-400 disabled:opacity-50 gap-2"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isLoading ? "Joining…" : "Accept invitation"}
          </button>
          <Link
            href="/dashboard"
            className="block w-full text-center text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </Link>
        </div>
      ) : (
        <>
          <div className="w-full flex rounded-full border border-gray-700 mb-6 overflow-hidden">
            <button
              onClick={() => setMode("new")}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                mode === "new" ? "bg-teal-500 text-white" : "text-gray-400"
              }`}
            >
              New Account
            </button>
            <button
              onClick={() => setMode("existing")}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                mode === "existing" ? "bg-teal-500 text-white" : "text-gray-400"
              }`}
            >
              Existing Account
            </button>
          </div>

          {mode === "new" ? (
            <form onSubmit={handleNewAccount} className="w-full space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-gray-700 bg-[#141927] px-5 py-3.5 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-500"
              />
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-full border border-gray-700 bg-[#141927] px-5 py-3.5 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-500"
              />
              <input
                type="password"
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-full border border-gray-700 bg-[#141927] px-5 py-3.5 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-500"
              />
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-full border border-gray-700 bg-[#141927] px-5 py-3.5 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-500"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full bg-teal-500 py-3.5 text-sm font-semibold text-white hover:bg-teal-400 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Joining…
                  </>
                ) : (
                  "Accept & join"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleExistingLogin} className="w-full space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-gray-700 bg-[#141927] px-5 py-3.5 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-500"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-full border border-gray-700 bg-[#141927] px-5 py-3.5 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-500"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full bg-teal-500 py-3.5 text-sm font-semibold text-white hover:bg-teal-400 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign in & join"
                )}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
