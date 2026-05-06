"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Check,
  X,
  Globe,
  Key,
  Link2,
  CreditCard,
  Settings,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import type { UserRole } from "@/lib/roles";

interface Gateway {
  id: string;
  name: string;
  provider: string;
  enabled: boolean;
  mode: "live" | "test";
  publicKey: string;
  secretKey: string;
  webhookSecret: string;
  webhookUrl: string;
  supportedMethods: string[];
  currencies: string[];
  createdAt: string;
}

function GatewayCard({
  gateway,
  onToggle,
  onEdit,
}: {
  gateway: Gateway;
  onToggle: () => void;
  onEdit: () => void;
}) {
  const providerColors: Record<string, string> = { stripe: "#635bff", razorpay: "#0066ff" };
  const color = providerColors[gateway.provider] ?? "var(--gf-accent)";

  return (
    <div className="rounded-xl border p-6" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg text-white font-bold text-sm" style={{ backgroundColor: color }}>
            {gateway.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: "var(--gf-text-primary)" }}>{gateway.name}</h3>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${gateway.mode === "live" ? "bg-green-500/15 text-green-500" : "bg-amber-500/15 text-amber-500"}`}>
              {gateway.mode.toUpperCase()}
            </span>
          </div>
        </div>
        <button
          onClick={onToggle}
          className={`relative h-6 w-11 rounded-full transition-colors ${gateway.enabled ? "bg-green-500" : "bg-gray-600"}`}
        >
          <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${gateway.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
        </button>
      </div>

      <div className="space-y-2.5 mb-4">
        <div className="flex items-center gap-2">
          <Key className="h-3.5 w-3.5" style={{ color: "var(--gf-text-muted)" }} />
          <span className="text-xs font-mono" style={{ color: "var(--gf-text-secondary)" }}>{gateway.publicKey}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link2 className="h-3.5 w-3.5" style={{ color: "var(--gf-text-muted)" }} />
          <span className="text-xs font-mono truncate" style={{ color: "var(--gf-text-secondary)" }}>{gateway.webhookUrl}</span>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="h-3.5 w-3.5" style={{ color: "var(--gf-text-muted)" }} />
          <span className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>{gateway.supportedMethods.join(", ")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Globe className="h-3.5 w-3.5" style={{ color: "var(--gf-text-muted)" }} />
          <span className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>{gateway.currencies.join(", ")}</span>
        </div>
      </div>

      <button
        onClick={onEdit}
        className="flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-medium transition-colors hover:opacity-80 w-full justify-center"
        style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
      >
        <Settings className="h-3.5 w-3.5" />Configure
      </button>
    </div>
  );
}

export default function PaymentGatewaysPage() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [editGateway, setEditGateway] = useState<Gateway | null>(null);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editMode, setEditMode] = useState<"live" | "test">("live");
  const [editPublicKey, setEditPublicKey] = useState("");
  const [editSecretKey, setEditSecretKey] = useState("");
  const [editWebhookSecret, setEditWebhookSecret] = useState("");

  const fetchGateways = async () => {
    setLoading(true);
    try {
      const { paymentGatewaysApi } = await import("@/lib/api");
      const list = await paymentGatewaysApi.list();
      setGateways(
        list.map((g) => ({
          id: g.id,
          name: g.name,
          displayName: g.display_name || g.name,
          enabled: g.status === "active",
          mode: "live" as const,
          publicKey: "",
          // Backend never exposes the secret on read — display blanks until
          // the operator types in new keys to overwrite.
          secretKey: g.has_credentials ? "••••••••" : "",
          webhookSecret: "",
          health: g.health_status,
          lastChecked: g.last_checked_at,
        })),
      );
    } catch {
      setGateways([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGateways(); }, []);

  const handleToggle = async (gw: Gateway) => {
    try {
      const { paymentGatewaysApi } = await import("@/lib/api");
      await paymentGatewaysApi.update(gw.id, { status: gw.enabled ? "inactive" : "active" });
      setGateways((prev) => prev.map((g) => g.id === gw.id ? { ...g, enabled: !g.enabled } : g));
    } catch {
      /* swallow */
    }
  };

  const openEdit = (gw: Gateway) => {
    setEditGateway(gw);
    setEditMode(gw.mode);
    setEditPublicKey(gw.publicKey);
    setEditSecretKey(gw.secretKey);
    setEditWebhookSecret(gw.webhookSecret);
  };

  const handleSave = async () => {
    if (!editGateway) return;
    setSaving(true);
    try {
      const { paymentGatewaysApi } = await import("@/lib/api");
      await paymentGatewaysApi.update(editGateway.id, {
        display_name: editGateway.displayName,
        credentials: {
          mode: editMode,
          public_key: editPublicKey,
          secret_key: editSecretKey,
          webhook_secret: editWebhookSecret,
        },
        status: editGateway.enabled ? "active" : "inactive",
      });
    } catch {
      /* swallow */
    }
    setGateways((prev) =>
      prev.map((g) =>
        g.id === editGateway.id
          ? { ...g, mode: editMode, publicKey: editPublicKey, secretKey: editSecretKey, webhookSecret: editWebhookSecret }
          : g,
      ),
    );
    setSaving(false);
    setEditGateway(null);
  };

  const fieldStyle = {
    backgroundColor: "var(--gf-bg-base)",
    borderColor: "var(--gf-border)",
    color: "var(--gf-text-primary)",
  };

  return (
    <AuthGuard allowedRoles={["super_admin"] as UserRole[]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Payment Gateways</h1>
            <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>
              Configure and manage payment gateway integrations
            </p>
          </div>
          <button
            onClick={fetchGateways}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh
          </button>
        </div>

        {/* Security Notice */}
        <div className="flex items-center gap-3 rounded-xl border p-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <Shield className="h-5 w-5" style={{ color: "#22c55e" }} />
          <div>
            <p className="text-xs font-bold" style={{ color: "var(--gf-text-primary)" }}>Secure Configuration</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--gf-text-muted)" }}>
              API keys are encrypted at rest. Only users with Super Admin access can view or modify gateway settings.
            </p>
          </div>
        </div>

        {/* Gateway Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: "var(--gf-accent)", borderTopColor: "transparent" }} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {gateways.map((gw) => (
              <GatewayCard key={gw.id} gateway={gw} onToggle={() => handleToggle(gw)} onEdit={() => openEdit(gw)} />
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {editGateway && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setEditGateway(null)}>
            <div
              className="w-full max-w-lg rounded-2xl border shadow-2xl"
              style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
                <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Configure {editGateway.name}</h2>
                <button onClick={() => setEditGateway(null)} className="p-1 hover:opacity-70" style={{ color: "var(--gf-text-muted)" }}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-500">Changing gateway keys may disrupt active payment processing.</p>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Mode</label>
                  <div className="flex gap-2">
                    {(["test", "live"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setEditMode(m)}
                        className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${editMode === m ? "text-white" : ""}`}
                        style={editMode === m ? { backgroundColor: m === "live" ? "#22c55e" : "#f59e0b" } : { borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
                      >
                        {m.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Public Key</label>
                  <input type="text" value={editPublicKey} onChange={(e) => setEditPublicKey(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Secret Key</label>
                  <input type="password" value={editSecretKey} onChange={(e) => setEditSecretKey(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Webhook Secret</label>
                  <input type="password" value={editWebhookSecret} onChange={(e) => setEditWebhookSecret(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setEditGateway(null)} className="rounded-lg px-4 py-2 text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="rounded-lg px-5 py-2 text-sm font-semibold text-white disabled:opacity-60" style={{ backgroundColor: "var(--gf-accent)" }}>
                    {saving ? "Saving..." : "Save Configuration"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
