"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  Users,
  Activity,
  LogOut,
  Menu,
  X,
  Bell,
  Calendar,
  Clock,
  Search,
  HelpCircle,
  Sun,
  Moon,
  Palette,
  Shield,
  CreditCard,
  FileText,
  Building2,
  GitBranch,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { ROLE_LABELS, ROLE_COLORS, type UserRole } from "@/lib/roles";
import SearchModal from "@/components/dashboard/search-modal";
import { NotificationsDropdown } from "@/components/dashboard/notifications-dropdown";
import { HelpDropdown } from "@/components/dashboard/help-dropdown";
import { ColorPicker } from "@/components/dashboard/color-picker";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  /** Roles that can see this nav item. If omitted, visible to all. */
  visibleTo?: UserRole[];
}

const navItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Identity & Access",
    href: "/dashboard/identity",
    icon: Shield,
    visibleTo: ["super_admin", "admin"],
  },
  {
    label: "Services",
    href: "/dashboard/services",
    icon: Activity,
    visibleTo: ["super_admin", "admin"],
  },
  {
    label: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
    visibleTo: ["super_admin", "admin"],
  },
  {
    label: "Payments",
    href: "/dashboard/payments",
    icon: CreditCard,
    visibleTo: ["super_admin"],
  },
  {
    label: "Workflows",
    href: "/dashboard/workflows",
    icon: GitBranch,
    visibleTo: ["super_admin", "admin"],
  },
  {
    label: "Audit Logs",
    href: "/dashboard/audit",
    icon: FileText,
    visibleTo: ["super_admin", "admin", "auditor"],
  },
  {
    label: "Team",
    href: "/dashboard/team",
    icon: Users,
    visibleTo: ["super_admin", "admin"],
  },
  {
    label: "Tenants",
    href: "/dashboard/tenants",
    icon: Building2,
    visibleTo: ["super_admin"],
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    visibleTo: ["super_admin"],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Ctrl+K to open search
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      setSearchOpen(true);
    }
    if (e.key === "Escape") {
      setNotificationsOpen(false);
      setHelpOpen(false);
      setColorPickerOpen(false);
    }
  }, []);

  // Close dropdowns on outside click
  const handleClickOutside = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest("[data-dropdown]")) {
      setNotificationsOpen(false);
      setHelpOpen(false);
      setColorPickerOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [handleKeyDown, handleClickOutside]);

  const userRole = user?.role ?? "viewer";
  const roleLabel = ROLE_LABELS[userRole];
  const roleColor = ROLE_COLORS[userRole];
  const userInitial = user?.fullName?.charAt(0).toUpperCase() ?? "U";

  const filteredNavItems = navItems.filter(
    (item) => !item.visibleTo || item.visibleTo.includes(userRole)
  );

  const handleSignOut = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--gf-bg-base)" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: "var(--gf-bg-surface)", borderRight: "1px solid var(--gf-border)" }}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 px-6" style={{ borderBottom: "1px solid var(--gf-border)" }}>
            <svg
              width="28"
              height="28"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M26 4L8 28H24L22 44L40 20H24L26 4Z"
                fill="url(#bolt-nav)"
                stroke="url(#bolt-nav)"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient
                  id="bolt-nav"
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
            <span className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Glimmora</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden"
              style={{ color: "var(--gf-text-secondary)" }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? ""
                      : "hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                  style={
                    isActive
                      ? { backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" }
                      : { color: "var(--gf-text-secondary)" }
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User info + Logout */}
          <div className="p-3" style={{ borderTop: "1px solid var(--gf-border)" }}>
            <div className="mb-2 px-3 py-2">
              <p className="text-sm font-medium truncate" style={{ color: "var(--gf-text-primary)" }}>
                {user?.fullName ?? "User"}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--gf-text-muted)" }}>
                {roleLabel}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: "var(--gf-text-secondary)" }}
            >
              <LogOut className="h-5 w-5" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header role="banner" className="relative flex h-14 items-center px-4" style={{ backgroundColor: "var(--gf-bg-surface)", borderBottom: "1px solid var(--gf-border)" }}>
          {/* Gradient accent line at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-orange-500 to-teal-500" />
          {/* Mobile menu */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden mr-3"
            style={{ color: "var(--gf-text-secondary)" }}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Company name + Live badge */}
          <div className="hidden md:flex items-center gap-2 mr-4">
            <span className="text-sm font-semibold whitespace-nowrap" style={{ color: "var(--gf-text-primary)" }}>
              Glimmora Fabric
            </span>
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
              style={{ backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)", border: "1px solid rgba(var(--gf-accent-rgb), 0.3)" }}
            >
              Live
            </span>
          </div>

          {/* Separator */}
          <div className="hidden md:block h-6 w-px bg-gray-300 dark:bg-gray-700 mr-4" />

          {/* Date */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-lg border px-3 py-1.5 mr-2 border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-[#141927]">
            <Calendar className="h-3.5 w-3.5" style={{ color: "var(--gf-text-muted)" }} />
            <span className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>Date</span>
            <span className="text-xs font-medium" style={{ color: "var(--gf-text-primary)" }}>
              {currentTime.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Time */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-lg border px-3 py-1.5 mr-4 border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-[#141927]">
            <Clock className="h-3.5 w-3.5" style={{ color: "var(--gf-text-muted)" }} />
            <span className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>Time</span>
            <span className="text-xs font-medium" style={{ color: "var(--gf-text-primary)" }}>
              {currentTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          </div>

          {/* Separator */}
          <div className="hidden lg:block h-6 w-px bg-gray-300 dark:bg-gray-700 mr-4" />

          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-lg border px-3 py-1.5 flex-1 max-w-xs mr-2 border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-[#141927] cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
          >
            <Search className="h-3.5 w-3.5" style={{ color: "var(--gf-text-muted)" }} />
            <span className="text-xs flex-1 text-left" style={{ color: "var(--gf-text-muted)" }}>
              Search...
            </span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border px-1.5 py-0.5 text-[10px] font-mono border-gray-300 bg-white dark:border-gray-600 dark:bg-[#0d1120]" style={{ color: "var(--gf-text-muted)" }}>
              Ctrl K
            </kbd>
          </button>

          {/* Separator */}
          <div className="hidden md:block h-6 w-px bg-gray-300 dark:bg-gray-700 mr-4" />

          {/* Color picker */}
          <div className="relative hidden md:block mr-2 z-40" data-dropdown>
            <button
              onClick={() => { setColorPickerOpen(!colorPickerOpen); setNotificationsOpen(false); setHelpOpen(false); }}
              className="rounded-lg border px-3 py-1.5 border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-[#141927] transition-colors cursor-pointer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "var(--gf-text-secondary)",
              }}
              title="Pick color theme"
              aria-label="Pick color theme"
              aria-expanded={colorPickerOpen}
              aria-haspopup="menu"
            >
              <span
                aria-hidden="true"
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: "var(--gf-accent)",
                  flexShrink: 0,
                }}
              />
              <Palette size={13} aria-hidden="true" />
            </button>
            <ColorPicker open={colorPickerOpen} onClose={() => setColorPickerOpen(false)} />
          </div>

          {/* Separator */}
          <div className="hidden md:block h-6 w-px bg-gray-300 dark:bg-gray-700 mr-3" />

          {/* Theme + Help */}
          <div className="hidden md:flex items-center gap-1 mr-2 relative z-40">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-[#141927] cursor-pointer"
              style={{ color: "var(--gf-text-secondary)" }}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <>
                  <Sun className="h-3.5 w-3.5" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5" />
                  <span>Dark</span>
                </>
              )}
            </button>
            <div className="relative" data-dropdown>
              <button
                onClick={() => { setHelpOpen(!helpOpen); setNotificationsOpen(false); setColorPickerOpen(false); }}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-[#141927] cursor-pointer"
                style={{ color: "var(--gf-text-secondary)" }}
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Help</span>
              </button>
              <HelpDropdown open={helpOpen} onClose={() => setHelpOpen(false)} />
            </div>
          </div>

          {/* Separator */}
          <div className="hidden md:block h-6 w-px bg-gray-300 dark:bg-gray-700 mr-3" />

          {/* Notification Bell */}
          <div className="relative mr-4 z-40" data-dropdown>
            <button
              onClick={() => { setNotificationsOpen(!notificationsOpen); setHelpOpen(false); setColorPickerOpen(false); }}
              className="relative rounded-lg border px-3 py-1.5 transition-colors border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-[#141927] cursor-pointer"
              style={{ color: "var(--gf-text-secondary)" }}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                3
              </span>
            </button>
            <NotificationsDropdown open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
          </div>

          {/* Separator */}
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mr-4" />

          {/* User profile */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: "var(--gf-accent)" }}
            >
              {userInitial}{user?.fullName?.split(" ")[1]?.charAt(0).toUpperCase() ?? ""}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium leading-tight" style={{ color: "var(--gf-text-primary)" }}>
                {user?.fullName ?? "User"}
              </p>
              <p className={`text-[11px] font-medium ${roleColor.text}`}>
                {roleLabel}
              </p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>

      {/* Search Modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
