"use client";

import Link from "next/link";
import {
  Shield,
  Bell,
  CreditCard,
  FileText,
  GitBranch,
  File,
  Cpu,
  Globe,
  ArrowUpRight,
} from "lucide-react";

type ServiceStatus = "Running" | "Degraded" | "Down";

interface Service {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  status: ServiceStatus;
  version: string;
  endpoints: number;
  uptime: string;
  latency: string;
  href: string;
}

const STATUS_DOT_COLOR: Record<ServiceStatus, string> = {
  Running: "#22c55e",
  Degraded: "#eab308",
  Down: "#ef4444",
};

const services: Service[] = [
  {
    name: "Identity & Access",
    description: "SSO, RBAC, MFA, OAuth2/OIDC, API tokens and session management",
    icon: Shield,
    status: "Running",
    version: "2.4.1",
    endpoints: 18,
    uptime: "99.98%",
    latency: "45ms",
    href: "/dashboard/identity",
  },
  {
    name: "Notification Hub",
    description: "Email, SMS, Push, In-app and webhook notifications",
    icon: Bell,
    status: "Running",
    version: "1.7.0",
    endpoints: 12,
    uptime: "99.95%",
    latency: "120ms",
    href: "/dashboard/notifications",
  },
  {
    name: "Payment Service",
    description: "Multi-gateway payments via Stripe, Razorpay and Adyen",
    icon: CreditCard,
    status: "Running",
    version: "3.1.2",
    endpoints: 14,
    uptime: "99.99%",
    latency: "230ms",
    href: "/dashboard/payments",
  },
  {
    name: "Audit Service",
    description: "Immutable audit trail, compliance reports and change tracking",
    icon: FileText,
    status: "Running",
    version: "1.3.0",
    endpoints: 8,
    uptime: "100%",
    latency: "32ms",
    href: "/dashboard/audit",
  },
  {
    name: "Workflow Engine",
    description: "Approvals, onboarding flows and SLA management",
    icon: GitBranch,
    status: "Degraded",
    version: "2.0.4",
    endpoints: 11,
    uptime: "98.70%",
    latency: "310ms",
    href: "/dashboard/workflows",
  },
  {
    name: "Document Service",
    description: "PDF generation, contract templates and e-signatures",
    icon: File,
    status: "Running",
    version: "1.1.0",
    endpoints: 9,
    uptime: "99.90%",
    latency: "180ms",
    href: "/dashboard/documents",
  },
  {
    name: "AI Platform",
    description: "Model hosting, prompt management and inference APIs",
    icon: Cpu,
    status: "Running",
    version: "0.9.3",
    endpoints: 15,
    uptime: "99.85%",
    latency: "290ms",
    href: "/dashboard/ai-platform",
  },
  {
    name: "API Gateway",
    description: "Rate limiting, request routing, auth proxy and analytics",
    icon: Globe,
    status: "Down",
    version: "2.2.0",
    endpoints: 6,
    uptime: "95.40%",
    latency: "—",
    href: "/dashboard/api-gateway",
  },
];

export function ServicesContent() {
  const runningCount = services.filter((s) => s.status === "Running").length;
  const degradedCount = services.filter((s) => s.status === "Degraded").length;
  const downCount = services.filter((s) => s.status === "Down").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>
          Service Health
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>
          Real-time status of all Glimmora Fabric platform services
        </p>
      </div>

      {/* Summary bar */}
      <div
        className="flex items-center gap-6 rounded-xl px-5 py-3"
        style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
      >
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#22c55e" }} />
          <span className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>
            {runningCount} Running
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#eab308" }} />
          <span className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>
            {degradedCount} Degraded
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#ef4444" }} />
          <span className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>
            {downCount} Down
          </span>
        </div>
        <div className="ml-auto text-xs" style={{ color: "var(--gf-text-muted)" }}>
          Last checked: just now
        </div>
      </div>

      {/* Service cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Link key={service.name} href={service.href} className="no-underline">
            <div
              className="rounded-xl p-5 transition-all hover:scale-[1.01]"
              style={{
                backgroundColor: "var(--gf-bg-surface)",
                border: "1px solid var(--gf-border)",
                cursor: "pointer",
                opacity: service.status === "Down" ? 0.7 : 1,
              }}
            >
              <div className="flex items-start justify-between">
                <service.icon className="h-6 w-6" style={{ color: "var(--gf-accent)" }} />
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: STATUS_DOT_COLOR[service.status] }}
                  />
                  <span className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                    {service.status}
                  </span>
                  <ArrowUpRight className="h-3 w-3 ml-1" style={{ color: "var(--gf-text-muted)" }} />
                </div>
              </div>

              <h3 className="mt-4 text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>
                {service.name}
              </h3>
              <p className="mt-1 text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                {service.description}
              </p>

              {/* Version & Endpoints */}
              <div className="mt-3 flex items-center gap-3">
                <span
                  className="rounded-md px-2 py-0.5 text-[10px] font-medium"
                  style={{
                    backgroundColor: "var(--gf-bg-base)",
                    color: "var(--gf-text-secondary)",
                    border: "1px solid var(--gf-border)",
                  }}
                >
                  v{service.version}
                </span>
                <span className="text-[11px]" style={{ color: "var(--gf-text-muted)" }}>
                  {service.endpoints} endpoints
                </span>
              </div>

              {/* Metrics */}
              <div className="mt-4 flex gap-4 border-t pt-3" style={{ borderColor: "var(--gf-border)" }}>
                <div>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--gf-text-muted)" }}>
                    Uptime
                  </p>
                  <p className="text-xs font-semibold" style={{ color: "var(--gf-text-primary)" }}>
                    {service.uptime}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--gf-text-muted)" }}>
                    Avg Latency
                  </p>
                  <p className="text-xs font-semibold" style={{ color: "var(--gf-text-primary)" }}>
                    {service.latency}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
