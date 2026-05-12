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
  File,
  Brain,
  BarChart3,
  ChevronDown,
  Headphones,
  Key,
  MonitorDot,
  Wrench,
  PanelLeftClose,
  PanelLeftOpen,
  Layers,
  Flag,
  Cpu,
  ClipboardList,
  ChevronRight,
  Home,
  ShoppingCart,
  RefreshCw,
  ShieldCheck,
  Database,
  FileDown,
  Globe,
  Mail,
  Send,
  Package,
  Terminal,
  BookOpen,
  Radio,
  Blocks,
  Rocket,
  KeyRound,
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { ROLE_LABELS, ROLE_COLORS, type UserRole } from "@/lib/roles";
import SearchModal from "@/components/dashboard/search-modal";
import { NotificationsDropdown } from "@/components/dashboard/notifications-dropdown";
import { HelpDropdown } from "@/components/dashboard/help-dropdown";
import { ColorPicker } from "@/components/dashboard/color-picker";
import { AuthGuard } from "@/components/auth/auth-guard";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  visibleTo?: UserRole[];
  section?: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { label: "Tenant Management", href: "#tenant-management", icon: Building2, visibleTo: ["super_admin", "platform_engineering_lead", "product_lead", "cto"], children: [
    { label: "Account Overview", href: "/tenants", icon: Building2, visibleTo: ["super_admin", "platform_engineering_lead", "product_lead", "cto"] },
    { label: "Plan Management", href: "/plans", icon: Layers, visibleTo: ["super_admin"] },
    { label: "Feature Flags", href: "/feature-flags", icon: Flag, visibleTo: ["super_admin"] },
  ]},
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "User Management", href: "/user", icon: Users, visibleTo: ["super_admin"] },
  { label: "User Management", href: "/tenant-user", icon: Users, visibleTo: ["tenant_admin"] },
  { label: "Onboarding Wizard", href: "/onboarding", icon: Wrench, visibleTo: ["tenant_admin"] },
  { label: "Role & Permission Management", href: "/roles", icon: Shield, visibleTo: ["super_admin", "tenant_admin"] },
  { label: "API & Developer Tools", href: "/api-gateway", icon: Key, visibleTo: ["super_admin", "developer", "platform_engineering_lead"] },
  { label: "Workflow", href: "#workflow", icon: GitBranch, visibleTo: ["super_admin", "workflow_manager", "tenant_admin", "developer", "platform_engineering_lead", "qa_engineer", "product_lead", "cto"], children: [
    { label: "Overview", href: "/workflow", icon: GitBranch, visibleTo: ["super_admin", "tenant_admin", "developer", "platform_engineering_lead", "qa_engineer", "product_lead", "cto"] },
    { label: "Workflow Builder", href: "/workflow/builder", icon: Layers, visibleTo: ["workflow_manager", "super_admin"] },
    { label: "Active Instances", href: "/workflow/instances", icon: Activity, visibleTo: ["workflow_manager"] },
    { label: "SLA Status", href: "/workflow/sla", icon: Clock, visibleTo: ["workflow_manager", "super_admin"] },
    { label: "Task Inbox", href: "/workflow/tasks", icon: ClipboardList },
  ]},
  { label: "Notification Management", href: "#notifications", icon: Bell, visibleTo: ["super_admin", "auditor", "tenant_admin", "platform_engineering_lead"], children: [
    { label: "All Notifications", href: "/notifications", icon: Bell, visibleTo: ["super_admin", "auditor"] },
    { label: "Templates", href: "/notification-templates", icon: Mail, visibleTo: ["super_admin", "auditor"] },
    { label: "Delivery Logs", href: "/notifications/logs", icon: Send, visibleTo: ["super_admin", "auditor"] },
    { label: "Webhooks", href: "/webhooks", icon: Globe, visibleTo: ["super_admin", "auditor"] },
  ]},
  { label: "Payment", href: "#payment", icon: CreditCard, visibleTo: ["super_admin", "billing_admin", "tenant_admin", "tenant_member"], children: [
    { label: "Checkout", href: "/checkout", icon: ShoppingCart, visibleTo: ["tenant_member"] },
    { label: "Revenue Analytics", href: "/billing/dashboard", icon: BarChart3, visibleTo: ["super_admin", "billing_admin"] },
    { label: "Refund Management", href: "/billing/refunds", icon: RefreshCw, visibleTo: ["super_admin", "billing_admin"] },
    { label: "Payment Gateways", href: "/payment-gateways", icon: Shield, visibleTo: ["super_admin"] },
    { label: "Pricing", href: "/pricing", icon: Layers, visibleTo: ["super_admin", "billing_admin", "tenant_admin", "tenant_member"] },
  ]},
  { label: "Document Templates", href: "#doc-templates", icon: FileText, visibleTo: ["super_admin", "tenant_admin", "auditor", "tenant_member", "billing_admin", "workflow_manager", "developer"], children: [
    { label: "All Templates", href: "/doc-templates", icon: FileText, visibleTo: ["super_admin", "tenant_admin"] },
    { label: "File Management", href: "/files", icon: File, visibleTo: ["super_admin", "tenant_admin", "auditor", "tenant_member", "billing_admin", "workflow_manager", "developer"] },
  ]},
  { label: "Document Library", href: "#documents", icon: File, visibleTo: ["tenant_member"], children: [
    { label: "All Documents", href: "/documents", icon: File, visibleTo: ["tenant_member"] },
  ]},
  { label: "AI Config & Analytics", href: "#ai", icon: Cpu, visibleTo: ["super_admin", "ai_prompt_owner"], children: [
    { label: "AI Config", href: "/ai-config", icon: Cpu, visibleTo: ["super_admin", "ai_prompt_owner"] },
    { label: "Model Performance", href: "/ai/analytics", icon: Brain, visibleTo: ["ai_prompt_owner"] },
  ]},
  { label: "Developer Portal", href: "#studio", icon: Terminal, visibleTo: ["developer", "product_designer", "platform_engineering_lead"], children: [
    { label: "Service Catalog", href: "/studio/services", icon: Package, visibleTo: ["developer"] },
    { label: "API Playground", href: "/studio/playground", icon: Terminal, visibleTo: ["developer"] },
    { label: "SDK Reference", href: "/studio/docs", icon: BookOpen, visibleTo: ["developer"] },
    { label: "Event Catalog", href: "/studio/events", icon: Radio, visibleTo: ["developer"] },
    { label: "Component Marketplace", href: "/studio/components", icon: Blocks, visibleTo: ["developer", "product_designer"] },
    { label: "Starter Repos", href: "/studio/starters", icon: Rocket, visibleTo: ["developer"] },
    { label: "API Keys", href: "/studio/keys", icon: KeyRound, visibleTo: ["developer"] },
    { label: "Platform Health", href: "/studio/health", icon: Activity, visibleTo: ["developer", "platform_engineering_lead"] },
  ]},
  { label: "Compliance", href: "#compliance", icon: ShieldCheck, visibleTo: ["super_admin", "auditor"], children: [
    { label: "Audit Log Viewer", href: "/audit-logs", icon: ClipboardList, visibleTo: ["super_admin", "auditor"] },
    { label: "Compliance Reports", href: "/compliance/reports", icon: Shield, visibleTo: ["super_admin", "auditor"] },
    { label: "Retention Policy", href: "/compliance/retention", icon: Database, visibleTo: ["super_admin"] },
    { label: "Data Export", href: "/compliance/data-export", icon: FileDown, visibleTo: ["super_admin", "auditor"] },
  ]},
  { label: "Settings", href: "/settings", icon: Settings, visibleTo: ["super_admin", "tenant_admin", "billing_admin", "platform_engineering_lead"] },
];

const SIDEBAR_EXPANDED = 256;
const SIDEBAR_COLLAPSED = 72;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
    if (e.key === "Escape") { setNotificationsOpen(false); setHelpOpen(false); setColorPickerOpen(false); }
  }, []);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest("[data-dropdown]")) { setNotificationsOpen(false); setHelpOpen(false); setColorPickerOpen(false); }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleClickOutside);
    return () => { document.removeEventListener("keydown", handleKeyDown); document.removeEventListener("click", handleClickOutside); };
  }, [handleKeyDown, handleClickOutside]);

  const userRole = user?.role ?? "developer";
  const roleLabel = ROLE_LABELS[userRole];
  const roleColor = ROLE_COLORS[userRole];
  const userInitial = user?.fullName?.charAt(0).toUpperCase() ?? "U";

  const filteredNavItems = navItems
    .filter((item) => !item.visibleTo || item.visibleTo.includes(userRole))
    .map((item) => {
      if (item.children) {
        const filteredChildren = item.children.filter((c) => !c.visibleTo || c.visibleTo.includes(userRole));
        if (filteredChildren.length === 0) return null;
        return { ...item, children: filteredChildren };
      }
      return item;
    })
    .filter(Boolean) as NavItem[];

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isChildActive = (item: NavItem) => {
    if (!item.children) return false;
    return item.children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"));
  };

  const handleSignOut = () => { logout(); router.push("/login"); };

  // Breadcrumb segments from pathname
  const breadcrumbs = useMemo(() => {
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const rawSegments = pathname.split("/").filter(Boolean);
    const segments = rawSegments.filter((s) => s !== "admin" && s !== "dashboard" && !UUID_RE.test(s));
    return segments.map((seg, i) => {
      const idx = rawSegments.indexOf(seg);
      const href = "/" + rawSegments.slice(0, idx + 1).join("/");
      const label = seg
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return { label, href, isLast: i === segments.length - 1 };
    });
  }, [pathname]);

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--gf-bg-base)" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ========== SIDEBAR (fixed, never scrolls) ========== */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          width: sidebarWidth,
          backgroundColor: "var(--gf-bg-surface)",
          borderRight: "1px solid var(--gf-border)",
        }}
      >
        {/* Logo header */}
        <div
          className="flex h-16 shrink-0 items-center gap-3 px-5"
          style={{ borderBottom: "1px solid var(--gf-border)" }}
        >
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
            <path d="M26 4L8 28H24L22 44L40 20H24L26 4Z" fill="url(#bolt-nav)" stroke="url(#bolt-nav)" strokeWidth="1.5" strokeLinejoin="round" />
            <defs><linearGradient id="bolt-nav" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse"><stop stopColor="#f59e0b" /><stop offset="1" stopColor="#f97316" /></linearGradient></defs>
          </svg>
          {!sidebarCollapsed && (
            <span className="text-lg font-bold whitespace-nowrap" style={{ color: "var(--gf-text-primary)" }}>Glimmora</span>
          )}
          {/* Mobile close button */}
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden" style={{ color: "var(--gf-text-secondary)" }}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation (scrollable area) */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
          {filteredNavItems.map((item, idx) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const showSection = item.section && filteredNavItems.findIndex((n) => n.section === item.section) === idx;
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedMenus[item.label] || isChildActive(item);

            return (
              <div key={item.href + item.label}>
                {showSection && !sidebarCollapsed && (
                  <p className="mt-4 mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--gf-text-muted)" }}>
                    {item.section}
                  </p>
                )}
                {showSection && sidebarCollapsed && <div className="mt-3 mb-1 mx-3 border-t" style={{ borderColor: "var(--gf-border)" }} />}

                {hasChildren ? (
                  <>
                    <button
                      onClick={() => toggleMenu(item.label)}
                      className={`group relative flex w-full items-center rounded-lg text-sm font-medium transition-colors ${
                        sidebarCollapsed ? "justify-center px-0 py-2.5 mx-1" : "gap-3 px-3 py-2"
                      } hover:bg-black/5 dark:hover:bg-white/5`}
                      style={isChildActive(item) ? { color: "var(--gf-accent)" } : { color: "var(--gf-text-secondary)" }}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <item.icon className="h-[18px] w-[18px] shrink-0" />
                      {!sidebarCollapsed && (
                        <>
                          <span className="truncate flex-1 text-left">{item.label}</span>
                          <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </>
                      )}
                      {sidebarCollapsed && (
                        <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium shadow-lg group-hover:block z-[60]" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-primary)", border: "1px solid var(--gf-border)" }}>
                          {item.label}
                        </span>
                      )}
                    </button>
                    {isExpanded && !sidebarCollapsed && (
                      <div className="ml-5 pl-3 border-l" style={{ borderColor: "var(--gf-border)" }}>
                        {item.children!.map((child) => {
                          const childActive = pathname === child.href || pathname.startsWith(child.href + "/");
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setSidebarOpen(false)}
                              className={`group relative flex items-center gap-3 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${childActive ? "" : "hover:bg-black/5 dark:hover:bg-white/5"}`}
                              style={childActive ? { backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" } : { color: "var(--gf-text-secondary)" }}
                            >
                              <child.icon className="h-4 w-4 shrink-0" />
                              <span className="truncate">{child.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`group relative flex items-center rounded-lg text-sm font-medium transition-colors ${
                      sidebarCollapsed ? "justify-center px-0 py-2.5 mx-1" : "gap-3 px-3 py-2"
                    } ${isActive ? "" : "hover:bg-black/5 dark:hover:bg-white/5"}`}
                    style={isActive ? { backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" } : { color: "var(--gf-text-secondary)" }}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    {sidebarCollapsed && (
                      <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium shadow-lg group-hover:block z-[60]" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-primary)", border: "1px solid var(--gf-border)" }}>
                        {item.label}
                      </span>
                    )}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* User info + Logout (pinned to bottom) */}
        <div className="shrink-0 p-3" style={{ borderTop: "1px solid var(--gf-border)" }}>
          {!sidebarCollapsed && (
            <div className="mb-2 px-3 py-2">
              <p className="text-sm font-medium truncate" style={{ color: "var(--gf-text-primary)" }}>{user?.fullName ?? "User"}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--gf-text-muted)" }}>{roleLabel}</p>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className={`flex w-full items-center rounded-lg text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${
              sidebarCollapsed ? "justify-center py-2.5" : "gap-3 px-3 py-2.5"
            }`}
            style={{ color: "var(--gf-text-secondary)" }}
            title={sidebarCollapsed ? "Sign out" : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!sidebarCollapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* ========== MAIN AREA (offset by sidebar width) ========== */}
      <div
        className="flex flex-1 flex-col min-h-screen transition-all duration-300 ease-in-out"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        {/* ========== HEADER (sticky, never scrolls) ========== */}
        <header
          role="banner"
          className="sticky top-0 z-30 flex h-14 shrink-0 items-center px-4"
          style={{ backgroundColor: "var(--gf-bg-surface)", borderBottom: "1px solid var(--gf-border)" }}
        >
          {/* Gradient accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-orange-500 to-teal-500" />

          {/* Sidebar collapse toggle (desktop) */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex items-center justify-center rounded-lg border h-9 w-9 mr-3 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>

          {/* Mobile menu button */}
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-3" style={{ color: "var(--gf-text-secondary)" }}>
            <Menu className="h-5 w-5" />
          </button>

          {/* Company name + Live badge */}
          <div className="hidden md:flex items-center gap-2 mr-4">
            <span className="text-sm font-semibold whitespace-nowrap" style={{ color: "var(--gf-text-primary)" }}>Glimmora Fabric</span>
            <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)", border: "1px solid rgba(var(--gf-accent-rgb), 0.3)" }}>Live</span>
          </div>

          <div className="hidden md:block h-6 w-px bg-gray-300 dark:bg-gray-700 mr-4" />

          {/* Date */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-lg border px-3 py-1.5 mr-2 border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-[#141927]">
            <Calendar className="h-3.5 w-3.5" style={{ color: "var(--gf-text-muted)" }} />
            <span className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>Date</span>
            <span className="text-xs font-medium" style={{ color: "var(--gf-text-primary)" }}>
              {currentTime.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          </div>

          {/* Time */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-lg border px-3 py-1.5 mr-4 border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-[#141927]">
            <Clock className="h-3.5 w-3.5" style={{ color: "var(--gf-text-muted)" }} />
            <span className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>Time</span>
            <span className="text-xs font-medium" style={{ color: "var(--gf-text-primary)" }}>
              {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
            </span>
          </div>

          <div className="hidden lg:block h-6 w-px bg-gray-300 dark:bg-gray-700 mr-4" />

          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-lg border px-3 py-1.5 flex-1 max-w-xs mr-2 border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-[#141927] cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
          >
            <Search className="h-3.5 w-3.5" style={{ color: "var(--gf-text-muted)" }} />
            <span className="text-xs flex-1 text-left" style={{ color: "var(--gf-text-muted)" }}>Search...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border px-1.5 py-0.5 text-[10px] font-mono border-gray-300 bg-white dark:border-gray-600 dark:bg-[#0d1120]" style={{ color: "var(--gf-text-muted)" }}>Ctrl K</kbd>
          </button>

          <div className="hidden md:block h-6 w-px bg-gray-300 dark:bg-gray-700 mr-4" />

          {/* Color picker */}
          <div className="relative hidden md:block mr-2 z-40" data-dropdown>
            <button
              onClick={() => { setColorPickerOpen(!colorPickerOpen); setNotificationsOpen(false); setHelpOpen(false); }}
              className="rounded-lg border px-3 py-1.5 border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-[#141927] transition-colors cursor-pointer"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--gf-text-secondary)" }}
              title="Pick color theme"
              aria-label="Pick color theme"
              aria-expanded={colorPickerOpen}
              aria-haspopup="menu"
            >
              <span aria-hidden="true" style={{ width: "12px", height: "12px", borderRadius: "50%", background: "var(--gf-accent)", flexShrink: 0 }} />
              <Palette size={13} aria-hidden="true" />
            </button>
            <ColorPicker open={colorPickerOpen} onClose={() => setColorPickerOpen(false)} />
          </div>

          <div className="hidden md:block h-6 w-px bg-gray-300 dark:bg-gray-700 mr-3" />

          {/* Theme + Help */}
          <div className="hidden md:flex items-center gap-1 mr-2 relative z-40">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-[#141927] cursor-pointer"
              style={{ color: "var(--gf-text-secondary)" }}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (<><Sun className="h-3.5 w-3.5" /><span>Light</span></>) : (<><Moon className="h-3.5 w-3.5" /><span>Dark</span></>)}
            </button>
            <div className="relative" data-dropdown>
              <button
                onClick={() => { setHelpOpen(!helpOpen); setNotificationsOpen(false); setColorPickerOpen(false); }}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-[#141927] cursor-pointer"
                style={{ color: "var(--gf-text-secondary)" }}
              >
                <HelpCircle className="h-3.5 w-3.5" /><span>Help</span>
              </button>
              <HelpDropdown open={helpOpen} onClose={() => setHelpOpen(false)} />
            </div>
          </div>

          <div className="hidden md:block h-6 w-px bg-gray-300 dark:bg-gray-700 mr-3" />

          {/* Notification Bell */}
          <div className="relative mr-4 z-40" data-dropdown>
            <button
              onClick={() => { setNotificationsOpen(!notificationsOpen); setHelpOpen(false); setColorPickerOpen(false); }}
              className="relative rounded-lg border px-3 py-1.5 transition-colors border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-[#141927] cursor-pointer"
              style={{ color: "var(--gf-text-secondary)" }}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{unreadCount}</span>
              )}
            </button>
            <NotificationsDropdown open={notificationsOpen} onClose={() => setNotificationsOpen(false)} onUnreadCountChange={setUnreadCount} />
          </div>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mr-4" />

          {/* User profile */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>
              {userInitial}{user?.fullName?.split(" ")[1]?.charAt(0).toUpperCase() ?? ""}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium leading-tight" style={{ color: "var(--gf-text-primary)" }}>{user?.fullName ?? "User"}</p>
              <p className={`text-[11px] font-medium ${roleColor.text}`}>{roleLabel}</p>
            </div>
          </div>
        </header>

        {/* ========== PAGE CONTENT (only this scrolls) ========== */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Breadcrumb */}
          {breadcrumbs.length > 1 && (
            <nav className="flex items-center gap-1 mb-4 text-xs" aria-label="Breadcrumb">
              <Link href="/dashboard" className="flex items-center gap-1 transition-colors hover:opacity-80" style={{ color: "var(--gf-text-muted)" }}>
                <Home className="h-3.5 w-3.5" />
              </Link>
              {breadcrumbs.map((crumb) => (
                <span key={crumb.href} className="flex items-center gap-1">
                  <ChevronRight className="h-3 w-3" style={{ color: "var(--gf-text-muted)" }} />
                  {crumb.isLast ? (
                    <span className="font-medium" style={{ color: "var(--gf-text-primary)" }}>{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="transition-colors hover:opacity-80" style={{ color: "var(--gf-text-muted)" }}>
                      {crumb.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
          )}
          <AuthGuard>{children}</AuthGuard>
        </main>
      </div>

      {/* Search Modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
