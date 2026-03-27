"use client";

import Link from "next/link";
import {
  Shield,
  Bell,
  CreditCard,
  FileText,
  GitBranch,
  File,
  ArrowUpRight,
} from "lucide-react";

const services = [
  {
    name: "Identity & Access",
    description: "SSO, RBAC, MFA, OAuth2/OIDC, API tokens",
    icon: Shield,
    active: true,
    href: "/dashboard/identity",
    uptime: "99.98%",
    requests: "12.4K",
    latency: "45ms",
  },
  {
    name: "Notification Hub",
    description: "Email, SMS, Push, In-app notifications",
    icon: Bell,
    active: true,
    href: "/dashboard/notifications",
    uptime: "99.95%",
    requests: "8.2K",
    latency: "120ms",
  },
  {
    name: "Payment Orchestration",
    description: "Multi-gateway: Stripe, Razorpay, Adyen",
    icon: CreditCard,
    active: true,
    href: "/dashboard/payments",
    uptime: "99.99%",
    requests: "2.8K",
    latency: "230ms",
  },
  {
    name: "Audit & Compliance",
    description: "Immutable audit trail & compliance reports",
    icon: FileText,
    active: true,
    href: "/dashboard/audit",
    uptime: "100%",
    requests: "5.6K",
    latency: "32ms",
  },
  {
    name: "Workflow Engine",
    description: "Approvals, onboarding, SLA management",
    icon: GitBranch,
    active: true,
    href: "/dashboard/workflows",
    uptime: "99.92%",
    requests: "1.4K",
    latency: "85ms",
  },
  {
    name: "Document Service",
    description: "PDF generation, contract templates, e-sign",
    icon: File,
    active: false,
    href: "#",
    uptime: "—",
    requests: "—",
    latency: "—",
  },
];

export function ServicesContent() {
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
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          <span className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>5 Operational</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-gray-500" />
          <span className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>1 Coming Soon</span>
        </div>
        <div className="ml-auto text-xs" style={{ color: "var(--gf-text-muted)" }}>
          Last checked: just now
        </div>
      </div>

      {/* Service cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const Card = (
            <div
              key={service.name}
              className="rounded-xl p-5 transition-all hover:scale-[1.01]"
              style={{
                backgroundColor: "var(--gf-bg-surface)",
                border: "1px solid var(--gf-border)",
                cursor: service.active ? "pointer" : "default",
                opacity: service.active ? 1 : 0.6,
              }}
            >
              <div className="flex items-start justify-between">
                <service.icon className="h-6 w-6" style={{ color: "var(--gf-accent)" }} />
                <div className="flex items-center gap-1.5">
                  {service.active ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>Active</span>
                      <ArrowUpRight className="h-3 w-3 ml-1" style={{ color: "var(--gf-text-muted)" }} />
                    </>
                  ) : (
                    <>
                      <span className="h-2 w-2 rounded-full bg-gray-500" />
                      <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Coming Soon</span>
                    </>
                  )}
                </div>
              </div>

              <h3 className="mt-4 text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>
                {service.name}
              </h3>
              <p className="mt-1 text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                {service.description}
              </p>

              {/* Metrics */}
              <div className="mt-4 flex gap-4 border-t pt-3" style={{ borderColor: "var(--gf-border)" }}>
                <div>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--gf-text-muted)" }}>Uptime</p>
                  <p className="text-xs font-semibold" style={{ color: "var(--gf-text-primary)" }}>{service.uptime}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--gf-text-muted)" }}>Requests</p>
                  <p className="text-xs font-semibold" style={{ color: "var(--gf-text-primary)" }}>{service.requests}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--gf-text-muted)" }}>Latency</p>
                  <p className="text-xs font-semibold" style={{ color: "var(--gf-text-primary)" }}>{service.latency}</p>
                </div>
              </div>
            </div>
          );

          if (service.active) {
            return (
              <Link key={service.name} href={service.href} className="no-underline">
                {Card}
              </Link>
            );
          }
          return <div key={service.name}>{Card}</div>;
        })}
      </div>
    </div>
  );
}
