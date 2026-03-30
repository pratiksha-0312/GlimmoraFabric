"use client";

import {
  Mail,
  MessageSquare,
  Bell,
  Smartphone,
  FileText,
  RefreshCw,
  Users,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const stats = [
  { label: "Templates", value: "24", icon: FileText },
  { label: "Sent Today", value: "1,247", icon: Mail },
  { label: "Delivery Rate", value: "98.5%", icon: Bell },
  { label: "Failed", value: "3", icon: RefreshCw },
];

interface Template {
  name: string;
  channel: "Email" | "SMS" | "WhatsApp" | "Push";
  subject: string;
  status: "Active" | "Draft";
  lastModified: string;
}

const templates: Template[] = [
  {
    name: "Welcome Email",
    channel: "Email",
    subject: "Welcome to GlimmoraFabric!",
    status: "Active",
    lastModified: "Mar 28, 2026",
  },
  {
    name: "Order Confirmation",
    channel: "SMS",
    subject: "Your order #{{orderId}} is confirmed",
    status: "Active",
    lastModified: "Mar 27, 2026",
  },
  {
    name: "Password Reset",
    channel: "Email",
    subject: "Reset your password",
    status: "Active",
    lastModified: "Mar 25, 2026",
  },
  {
    name: "Promo Alert",
    channel: "Push",
    subject: "Flash sale — 40% off everything",
    status: "Draft",
    lastModified: "Mar 24, 2026",
  },
  {
    name: "Shipping Update",
    channel: "WhatsApp",
    subject: "Your package is on the way!",
    status: "Active",
    lastModified: "Mar 23, 2026",
  },
  {
    name: "Re-engagement",
    channel: "Email",
    subject: "We miss you — here's 20% off",
    status: "Draft",
    lastModified: "Mar 20, 2026",
  },
];

interface Channel {
  name: string;
  provider: string;
  status: "Active" | "Inactive";
  sent: number;
  icon: typeof Mail;
}

const channels: Channel[] = [
  {
    name: "Email",
    provider: "AWS SES",
    status: "Active",
    sent: 892,
    icon: Mail,
  },
  {
    name: "SMS",
    provider: "Twilio",
    status: "Active",
    sent: 234,
    icon: MessageSquare,
  },
  {
    name: "WhatsApp",
    provider: "Twilio",
    status: "Active",
    sent: 78,
    icon: MessageSquare,
  },
  {
    name: "Push",
    provider: "Firebase FCM",
    status: "Active",
    sent: 43,
    icon: Smartphone,
  },
];

interface DeliveryLog {
  template: string;
  channel: string;
  recipient: string;
  status: "Delivered" | "Pending" | "Failed" | "Bounced";
  time: string;
}

const deliveryLogs: DeliveryLog[] = [
  {
    template: "Welcome Email",
    channel: "Email",
    recipient: "user@example.com",
    status: "Delivered",
    time: "5 min ago",
  },
  {
    template: "Order Confirmation",
    channel: "SMS",
    recipient: "+1 (555) 123-4567",
    status: "Delivered",
    time: "12 min ago",
  },
  {
    template: "Password Reset",
    channel: "Email",
    recipient: "admin@example.com",
    status: "Pending",
    time: "18 min ago",
  },
  {
    template: "Promo Alert",
    channel: "Push",
    recipient: "device_token_x92",
    status: "Failed",
    time: "25 min ago",
  },
  {
    template: "Shipping Update",
    channel: "WhatsApp",
    recipient: "+91 98765 43210",
    status: "Bounced",
    time: "32 min ago",
  },
  {
    template: "Re-engagement",
    channel: "Email",
    recipient: "lapsed@example.com",
    status: "Delivered",
    time: "45 min ago",
  },
];

interface RetryRule {
  channel: string;
  maxRetries: number;
  interval: string;
  backoff: string;
}

const retryRules: RetryRule[] = [
  {
    channel: "Email",
    maxRetries: 3,
    interval: "5 min",
    backoff: "Exponential",
  },
  {
    channel: "SMS",
    maxRetries: 2,
    interval: "10 min",
    backoff: "Linear",
  },
  {
    channel: "WhatsApp",
    maxRetries: 2,
    interval: "15 min",
    backoff: "Linear",
  },
  {
    channel: "Push",
    maxRetries: 5,
    interval: "2 min",
    backoff: "Exponential",
  },
];

interface UserPref {
  channel: string;
  optedIn: number;
  optedOut: number;
  total: number;
}

const userPreferences: UserPref[] = [
  { channel: "Email", optedIn: 4_520, optedOut: 180, total: 4_700 },
  { channel: "SMS", optedIn: 3_100, optedOut: 600, total: 3_700 },
  { channel: "WhatsApp", optedIn: 2_840, optedOut: 460, total: 3_300 },
  { channel: "Push", optedIn: 3_900, optedOut: 310, total: 4_210 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function deliveryStatusColor(status: string): string {
  switch (status) {
    case "Delivered":
      return "#22c55e";
    case "Pending":
      return "#f59e0b";
    case "Failed":
      return "#ef4444";
    case "Bounced":
      return "#f97316";
    default:
      return "var(--gf-text-muted)";
  }
}

function templateStatusColor(status: string): { color: string; bg: string } {
  if (status === "Active")
    return { color: "#22c55e", bg: "rgba(34,197,94,0.12)" };
  return { color: "#f59e0b", bg: "rgba(245,158,11,0.12)" };
}

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const cardStyle: React.CSSProperties = {
  background: "var(--gf-bg-surface)",
  border: "1px solid var(--gf-border)",
  borderRadius: "0.75rem",
  padding: "1.25rem",
};

const sectionTitle: React.CSSProperties = {
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "var(--gf-text-primary)",
  marginBottom: "1rem",
};

const thStyle: React.CSSProperties = {
  textAlign: "left" as const,
  padding: "0.5rem 0.75rem",
  fontSize: "0.75rem",
  fontWeight: 500,
  color: "var(--gf-text-muted)",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
};

const tdPrimary: React.CSSProperties = {
  padding: "0.75rem",
  fontSize: "0.875rem",
  color: "var(--gf-text-primary)",
};

const tdSecondary: React.CSSProperties = {
  padding: "0.75rem",
  fontSize: "0.875rem",
  color: "var(--gf-text-secondary)",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NotificationsContent() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "var(--gf-text-primary)",
          }}
        >
          Notification Hub
        </h1>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--gf-text-muted)",
            marginTop: "0.25rem",
          }}
        >
          Email, SMS, WhatsApp, and push notification management
        </p>
      </div>

      {/* Stats Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1rem",
        }}
      >
        {stats.map((stat) => (
          <div key={stat.label} style={cardStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{ fontSize: "0.875rem", color: "var(--gf-text-muted)" }}
              >
                {stat.label}
              </span>
              <stat.icon
                style={{
                  width: "1.125rem",
                  height: "1.125rem",
                  color: "var(--gf-accent)",
                }}
              />
            </div>
            <p
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--gf-text-primary)",
                marginTop: "0.5rem",
              }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Templates Table */}
      <div style={cardStyle}>
        <h2 style={sectionTitle}>Templates</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
              {["Name", "Channel", "Subject", "Status", "Last Modified"].map(
                (col) => (
                  <th key={col} style={thStyle}>
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {templates.map((t, i) => {
              const sc = templateStatusColor(t.status);
              return (
                <tr
                  key={t.name}
                  style={{
                    borderBottom:
                      i < templates.length - 1
                        ? "1px solid var(--gf-border)"
                        : "none",
                  }}
                >
                  <td style={tdPrimary}>{t.name}</td>
                  <td style={tdSecondary}>{t.channel}</td>
                  <td
                    style={{
                      ...tdSecondary,
                      maxWidth: "16rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t.subject}
                  </td>
                  <td style={{ padding: "0.75rem" }}>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        color: sc.color,
                        background: sc.bg,
                        borderRadius: "9999px",
                        padding: "0.125rem 0.5rem",
                      }}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td
                    style={{
                      ...tdSecondary,
                      fontSize: "0.75rem",
                      color: "var(--gf-text-muted)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t.lastModified}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Channel Settings */}
      <div>
        <h2 style={sectionTitle}>Channel Settings</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1rem",
          }}
        >
          {channels.map((ch) => (
            <div key={ch.name} style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <ch.icon
                  style={{
                    width: "1.25rem",
                    height: "1.25rem",
                    color: "var(--gf-accent)",
                  }}
                />
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    color:
                      ch.status === "Active" ? "#22c55e" : "var(--gf-text-muted)",
                    background:
                      ch.status === "Active"
                        ? "rgba(34,197,94,0.12)"
                        : "rgba(127,127,127,0.12)",
                    borderRadius: "9999px",
                    padding: "0.125rem 0.5rem",
                  }}
                >
                  {ch.status}
                </span>
              </div>
              <p
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--gf-text-primary)",
                  marginTop: "0.75rem",
                }}
              >
                {ch.name}
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--gf-text-muted)",
                  marginTop: "0.25rem",
                }}
              >
                Provider: {ch.provider}
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--gf-text-muted)",
                  marginTop: "0.125rem",
                }}
              >
                {ch.sent} sent today
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Logs Table */}
      <div style={cardStyle}>
        <h2 style={sectionTitle}>Delivery Logs</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
              {["Template", "Channel", "Recipient", "Status", "Time"].map(
                (col) => (
                  <th key={col} style={thStyle}>
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {deliveryLogs.map((log, i) => (
              <tr
                key={i}
                style={{
                  borderBottom:
                    i < deliveryLogs.length - 1
                      ? "1px solid var(--gf-border)"
                      : "none",
                }}
              >
                <td style={tdPrimary}>{log.template}</td>
                <td style={tdSecondary}>{log.channel}</td>
                <td style={tdSecondary}>{log.recipient}</td>
                <td
                  style={{
                    padding: "0.75rem",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: deliveryStatusColor(log.status),
                  }}
                >
                  {log.status}
                </td>
                <td
                  style={{
                    padding: "0.75rem",
                    fontSize: "0.75rem",
                    color: "var(--gf-text-muted)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {log.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Retry Rules */}
      <div>
        <h2 style={sectionTitle}>Retry Rules</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1rem",
          }}
        >
          {retryRules.map((rule) => (
            <div key={rule.channel} style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.75rem",
                }}
              >
                <RefreshCw
                  style={{
                    width: "1rem",
                    height: "1rem",
                    color: "var(--gf-accent)",
                  }}
                />
                <span
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--gf-text-primary)",
                  }}
                >
                  {rule.channel}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.375rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--gf-text-muted)",
                  }}
                >
                  Max Retries:{" "}
                  <span style={{ color: "var(--gf-text-primary)", fontWeight: 500 }}>
                    {rule.maxRetries}
                  </span>
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--gf-text-muted)",
                  }}
                >
                  Interval:{" "}
                  <span style={{ color: "var(--gf-text-primary)", fontWeight: 500 }}>
                    {rule.interval}
                  </span>
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--gf-text-muted)",
                  }}
                >
                  Backoff:{" "}
                  <span style={{ color: "var(--gf-text-primary)", fontWeight: 500 }}>
                    {rule.backoff}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Preferences */}
      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          <Users
            style={{
              width: "1.125rem",
              height: "1.125rem",
              color: "var(--gf-accent)",
            }}
          />
          <h2
            style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              color: "var(--gf-text-primary)",
            }}
          >
            User Preferences
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1rem",
          }}
        >
          {userPreferences.map((pref) => {
            const pct = Math.round((pref.optedIn / pref.total) * 100);
            return (
              <div
                key={pref.channel}
                style={{
                  background: "var(--gf-bg-page, var(--gf-bg-surface))",
                  border: "1px solid var(--gf-border)",
                  borderRadius: "0.75rem",
                  padding: "1rem",
                }}
              >
                <p
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--gf-text-primary)",
                    marginBottom: "0.5rem",
                  }}
                >
                  {pref.channel}
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.75rem",
                    color: "var(--gf-text-muted)",
                    marginBottom: "0.25rem",
                  }}
                >
                  <span>
                    Opt-in:{" "}
                    <span style={{ color: "#22c55e", fontWeight: 500 }}>
                      {pref.optedIn.toLocaleString()}
                    </span>
                  </span>
                  <span>
                    Opt-out:{" "}
                    <span style={{ color: "#ef4444", fontWeight: 500 }}>
                      {pref.optedOut.toLocaleString()}
                    </span>
                  </span>
                </div>
                {/* simple bar */}
                <div
                  style={{
                    height: "0.375rem",
                    borderRadius: "9999px",
                    background: "rgba(239,68,68,0.2)",
                    marginTop: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      borderRadius: "9999px",
                      background: "#22c55e",
                    }}
                  />
                </div>
                <p
                  style={{
                    fontSize: "0.6875rem",
                    color: "var(--gf-text-muted)",
                    marginTop: "0.375rem",
                    textAlign: "right",
                  }}
                >
                  {pct}% opted in
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
