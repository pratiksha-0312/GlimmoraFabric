"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import type { UserRole } from "@/lib/roles";
import { ShieldAlert } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) return null;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 mb-4">
          <ShieldAlert className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold" style={{ color: "var(--gf-text-primary)" }}>
          Access Denied
        </h2>
        <p className="text-sm mt-2 max-w-sm text-center" style={{ color: "var(--gf-text-secondary)" }}>
          You don&apos;t have permission to access this page. Contact your administrator if you believe this is an error.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-6 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-colors"
          style={{ backgroundColor: "var(--gf-accent)" }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
