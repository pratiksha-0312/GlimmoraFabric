"use client";

import { Activity, ArrowUpRight, Server, Shield, Users } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { ROLE_LABELS, ROLE_COLORS, type UserRole } from "@/lib/roles";

interface StatCard {
  label: string;
  value: string;
  change: string;
  icon: typeof Server;
  /** Minimum role level required to see this card. */
  visibleTo?: UserRole[];
}

const stats: StatCard[] = [
  {
    label: "Active Services",
    value: "12",
    change: "+2 this month",
    icon: Server,
  },
  {
    label: "Team Members",
    value: "8",
    change: "+1 this week",
    icon: Users,
    visibleTo: ["super_admin", "admin"],
  },
  {
    label: "API Requests",
    value: "24.5K",
    change: "+12% from last week",
    icon: Activity,
  },
  {
    label: "Security Score",
    value: "94%",
    change: "No issues detected",
    icon: Shield,
    visibleTo: ["super_admin", "admin"],
  },
];

const recentActivity = [
  {
    action: "Deployed auth-service v2.4.1",
    user: "You",
    time: "2 hours ago",
  },
  {
    action: "Added new team member",
    user: "Admin",
    time: "5 hours ago",
  },
  {
    action: "Updated API rate limits",
    user: "You",
    time: "1 day ago",
  },
  {
    action: "Rotated service credentials",
    user: "System",
    time: "2 days ago",
  },
  {
    action: "Created new API key",
    user: "You",
    time: "3 days ago",
  },
];

const quickLinks = [
  { label: "API Documentation", href: "#" },
  { label: "Service Health", href: "#" },
  { label: "Access Management", href: "#" },
  { label: "Deployment Logs", href: "#" },
];

export function DashboardContent() {
  const { user } = useAuth();
  const userRole = user?.role ?? "viewer";
  const roleLabel = ROLE_LABELS[userRole];
  const roleColor = ROLE_COLORS[userRole];

  const firstName = user?.fullName?.split(" ")[0] ?? "User";

  const visibleStats = stats.filter(
    (stat) => !stat.visibleTo || stat.visibleTo.includes(userRole)
  );

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {firstName}
          </h1>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColor.bg} ${roleColor.text}`}
          >
            {roleLabel}
          </span>
        </div>
        <p className="text-sm text-gray-400 dark:text-gray-500 dark:text-gray-400 mt-1">
          Here&apos;s what&apos;s happening with your platform
        </p>
      </div>

      {/* Read-only banner for Viewer role */}
      {userRole === "viewer" && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-[#141927] px-4 py-3 text-sm text-gray-400 dark:text-gray-500 dark:text-gray-400">
          You have read-only access
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visibleStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-[#0d1120] p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400 dark:text-gray-500 dark:text-gray-400">{stat.label}</span>
              <stat.icon className="h-5 w-5 text-gray-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="mt-1 text-xs" style={{ color: "var(--gf-accent)" }}>{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-[#0d1120] p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivity.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-gray-800 pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm text-gray-900 dark:text-white">{item.action}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">by {item.user}</p>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap ml-4">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-[#0d1120] p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Links
          </h2>
          <div className="space-y-2">
            {quickLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-[#141927] hover:text-gray-900 dark:hover:text-white"
              >
                {link.label}
                <ArrowUpRight className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
