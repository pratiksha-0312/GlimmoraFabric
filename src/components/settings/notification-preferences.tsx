"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  Monitor,
  Save,
  CheckCircle,
  Shield,
  Users,
  Activity,
  FileText,
  CreditCard,
  Settings,
} from "lucide-react";

// ============================================================================
// TYPES & DATA
// ============================================================================

interface ChannelConfig {
  id: string;
  name: string;
  icon: typeof Mail;
  description: string;
  enabled: boolean;
}

interface CategoryPreference {
  id: string;
  name: string;
  description: string;
  icon: typeof Shield;
  color: string;
  channels: { email: boolean; sms: boolean; push: boolean; inApp: boolean };
}

const INITIAL_CHANNELS: ChannelConfig[] = [
  { id: "email", name: "Email", icon: Mail, description: "Receive notifications via email", enabled: true },
  { id: "sms", name: "SMS", icon: Smartphone, description: "Receive text message alerts", enabled: false },
  { id: "push", name: "Push Notifications", icon: MessageSquare, description: "Browser and mobile push notifications", enabled: true },
  { id: "inApp", name: "In-App", icon: Monitor, description: "Notifications within the platform", enabled: true },
];

const INITIAL_CATEGORIES: CategoryPreference[] = [
  { id: "security", name: "Security Alerts", description: "Login attempts, password changes, MFA events", icon: Shield, color: "#ef4444", channels: { email: true, sms: true, push: true, inApp: true } },
  { id: "team", name: "Team Updates", description: "User invitations, role changes, team activity", icon: Users, color: "#3b82f6", channels: { email: true, sms: false, push: true, inApp: true } },
  { id: "deployment", name: "Deployments", description: "Service deployments, build status, CI/CD alerts", icon: Activity, color: "#06b6d4", channels: { email: true, sms: false, push: true, inApp: true } },
  { id: "compliance", name: "Compliance", description: "Report generation, policy changes, audit events", icon: FileText, color: "#f59e0b", channels: { email: true, sms: false, push: false, inApp: true } },
  { id: "billing", name: "Billing & Payments", description: "Invoices, payment confirmations, subscription changes", icon: CreditCard, color: "#22c55e", channels: { email: true, sms: true, push: false, inApp: true } },
  { id: "system", name: "System Updates", description: "Maintenance windows, feature announcements, platform status", icon: Settings, color: "#8b5cf6", channels: { email: true, sms: false, push: false, inApp: true } },
];

// ============================================================================
// TOGGLE SWITCH
// ============================================================================

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!enabled)} className="relative shrink-0">
      <div className={`h-5 w-9 rounded-full transition-colors ${enabled ? "bg-green-500" : "bg-gray-600"}`}>
        <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${enabled ? "translate-x-4" : "translate-x-0.5"}`} />
      </div>
    </button>
  );
}

// ============================================================================
// MAIN
// ============================================================================

export function NotificationPreferences() {
  const [channels, setChannels] = useState(INITIAL_CHANNELS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { notificationsApi } = await import("@/lib/api");
        // Backend stores per-channel master toggles only:
        //   email_enabled / sms_enabled / push_enabled / whatsapp_enabled / in_app_enabled
        // The legacy UI also has per-category × per-channel toggles, which
        // the backend doesn't track. Surface the master toggles here and
        // leave the local category state as-is — saving still updates the
        // backend channel master values.
        const prefs = await notificationsApi.preferences.get();
        setChannels((prev) =>
          prev.map((c) => {
            if (c.id === "email") return { ...c, enabled: prefs.email_enabled };
            if (c.id === "sms") return { ...c, enabled: prefs.sms_enabled };
            if (c.id === "push") return { ...c, enabled: prefs.push_enabled };
            if (c.id === "inApp") return { ...c, enabled: prefs.in_app_enabled };
            return c;
          }),
        );
      } catch {
        // ignore
      }
    })();
  }, []);

  const toggleChannel = (id: string) => {
    setChannels((prev) => prev.map((c) => c.id === id ? { ...c, enabled: !c.enabled } : c));
    setSaved(false);
  };

  const toggleCategoryChannel = (catId: string, channel: keyof CategoryPreference["channels"]) => {
    setCategories((prev) => prev.map((c) => c.id === catId ? { ...c, channels: { ...c.channels, [channel]: !c.channels[channel] } } : c));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { notificationsApi } = await import("@/lib/api");
      const find = (id: string) => channels.find((c) => c.id === id)?.enabled ?? false;
      // Per-category × per-channel toggles aren't supported server-side yet;
      // we persist only the per-channel master toggles. Category state stays
      // local until the backend exposes a richer schema.
      await notificationsApi.preferences.update({
        email_enabled: find("email"),
        sms_enabled: find("sms"),
        push_enabled: find("push"),
        in_app_enabled: find("inApp"),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      /* swallow */
    } finally {
      setSaving(false);
    }
  };

  const channelMap = { email: "Email", sms: "SMS", push: "Push", inApp: "In-App" } as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Notification Preferences</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>Control how and when you receive notifications</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60" style={{ backgroundColor: saved ? "#22c55e" : "var(--gf-accent)" }}>
          {saved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Preferences"}
        </button>
      </div>

      {/* Channel Toggles */}
      <div className="rounded-xl border" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        <div className="border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
          <h3 className="text-base font-bold" style={{ color: "var(--gf-text-primary)" }}>Notification Channels</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--gf-text-muted)" }}>Enable or disable notification delivery channels</p>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--gf-border)" }}>
          {channels.map((ch) => {
            const Icon = ch.icon;
            return (
              <div key={ch.id} className="flex items-center justify-between px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                    <Icon className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{ch.name}</p>
                    <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{ch.description}</p>
                  </div>
                </div>
                <Toggle enabled={ch.enabled} onChange={() => toggleChannel(ch.id)} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Category-level opt-in/out */}
      <div className="rounded-xl border" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        <div className="border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
          <h3 className="text-base font-bold" style={{ color: "var(--gf-text-primary)" }}>Category Preferences</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--gf-text-muted)" }}>Choose which channels to use for each notification category</p>
        </div>

        {/* Header row */}
        <div className="hidden sm:flex items-center px-6 py-3 text-xs font-medium uppercase" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-secondary)" }}>
          <div className="flex-1">Category</div>
          {Object.values(channelMap).map((label) => (
            <div key={label} className="w-20 text-center">{label}</div>
          ))}
        </div>

        <div className="divide-y" style={{ borderColor: "var(--gf-border)" }}>
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.id} className="px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0" style={{ backgroundColor: `${cat.color}15` }}>
                      <Icon className="h-4 w-4" style={{ color: cat.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{cat.name}</p>
                      <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{cat.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-0">
                    {(Object.keys(channelMap) as (keyof typeof channelMap)[]).map((ch) => (
                      <div key={ch} className="flex sm:w-20 items-center justify-center gap-1.5 sm:gap-0">
                        <span className="text-xs sm:hidden" style={{ color: "var(--gf-text-muted)" }}>{channelMap[ch]}</span>
                        <Toggle enabled={cat.channels[ch]} onChange={() => toggleCategoryChannel(cat.id, ch)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
