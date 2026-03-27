"use client";

import { Mail, MessageSquare, Bell, Smartphone } from "lucide-react";

const stats = [
  { label: "Sent Today", value: "1,247" },
  { label: "Delivery Rate", value: "98.5%" },
  { label: "Active Templates", value: "18" },
  { label: "Failed", value: "3" },
];

const channels = [
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
    name: "Push Notifications",
    provider: "",
    status: "Active",
    sent: 89,
    icon: Bell,
  },
  {
    name: "In-App",
    provider: "",
    status: "Active",
    sent: 32,
    icon: Smartphone,
  },
];

const recentNotifications = [
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
    template: "Activity Summary",
    channel: "In-App",
    recipient: "user_8832",
    status: "Delivered",
    time: "30 min ago",
  },
];

function statusColor(status: string): string {
  switch (status) {
    case "Delivered":
      return "#22c55e";
    case "Pending":
      return "#f59e0b";
    case "Failed":
      return "#ef4444";
    default:
      return "var(--gf-text-muted)";
  }
}

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
          Email, SMS, WhatsApp, push, in-app notification management
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
          <div
            key={stat.label}
            style={{
              background: "var(--gf-bg-surface)",
              border: "1px solid var(--gf-border)",
              borderRadius: "0.75rem",
              padding: "1.25rem",
            }}
          >
            <span
              style={{
                fontSize: "0.875rem",
                color: "var(--gf-text-muted)",
              }}
            >
              {stat.label}
            </span>
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

      {/* Channel Status */}
      <div>
        <h2
          style={{
            fontSize: "1.125rem",
            fontWeight: 600,
            color: "var(--gf-text-primary)",
            marginBottom: "1rem",
          }}
        >
          Channel Status
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1rem",
          }}
        >
          {channels.map((ch) => (
            <div
              key={ch.name}
              style={{
                background: "var(--gf-bg-surface)",
                border: "1px solid var(--gf-border)",
                borderRadius: "0.75rem",
                padding: "1.25rem",
              }}
            >
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
                    color: "#22c55e",
                    background: "rgba(34,197,94,0.12)",
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
                {ch.provider ? ` (${ch.provider})` : ""}
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--gf-text-muted)",
                  marginTop: "0.25rem",
                }}
              >
                {ch.sent} sent today
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Notifications Table */}
      <div
        style={{
          background: "var(--gf-bg-surface)",
          border: "1px solid var(--gf-border)",
          borderRadius: "0.75rem",
          padding: "1.25rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.125rem",
            fontWeight: 600,
            color: "var(--gf-text-primary)",
            marginBottom: "1rem",
          }}
        >
          Recent Notifications
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                borderBottom: "1px solid var(--gf-border)",
              }}
            >
              {["Template", "Channel", "Recipient", "Status", "Time"].map(
                (col) => (
                  <th
                    key={col}
                    style={{
                      textAlign: "left",
                      padding: "0.5rem 0.75rem",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      color: "var(--gf-text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {recentNotifications.map((notif, i) => (
              <tr
                key={i}
                style={{
                  borderBottom:
                    i < recentNotifications.length - 1
                      ? "1px solid var(--gf-border)"
                      : "none",
                }}
              >
                <td
                  style={{
                    padding: "0.75rem",
                    fontSize: "0.875rem",
                    color: "var(--gf-text-primary)",
                  }}
                >
                  {notif.template}
                </td>
                <td
                  style={{
                    padding: "0.75rem",
                    fontSize: "0.875rem",
                    color: "var(--gf-text-secondary)",
                  }}
                >
                  {notif.channel}
                </td>
                <td
                  style={{
                    padding: "0.75rem",
                    fontSize: "0.875rem",
                    color: "var(--gf-text-secondary)",
                  }}
                >
                  {notif.recipient}
                </td>
                <td
                  style={{
                    padding: "0.75rem",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: statusColor(notif.status),
                  }}
                >
                  {notif.status}
                </td>
                <td
                  style={{
                    padding: "0.75rem",
                    fontSize: "0.75rem",
                    color: "var(--gf-text-muted)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {notif.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
