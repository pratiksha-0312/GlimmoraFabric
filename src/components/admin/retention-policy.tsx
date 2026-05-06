"use client";

import { useState, useEffect } from "react";
import {
  Database,
  Save,
  Shield,
  AlertTriangle,
  Clock,
  FileText,
  Trash2,
  ChevronDown,
  CheckCircle,
  Info,
} from "lucide-react";

// ============================================================================
// TYPES & DATA
// ============================================================================

interface RetentionRule {
  id: string;
  dataType: string;
  description: string;
  retentionDays: number;
  action: "delete" | "archive" | "anonymize";
  enabled: boolean;
  lastPurge: string;
  recordsAffected: number;
}

const INITIAL_RULES: RetentionRule[] = [
  { id: "rr-1", dataType: "Audit Logs", description: "System audit trail events", retentionDays: 365, action: "archive", enabled: true, lastPurge: "2026-03-01", recordsAffected: 12450 },
  { id: "rr-2", dataType: "Session Data", description: "User login sessions and tokens", retentionDays: 90, action: "delete", enabled: true, lastPurge: "2026-03-15", recordsAffected: 3280 },
  { id: "rr-3", dataType: "API Request Logs", description: "Incoming API request metadata", retentionDays: 180, action: "archive", enabled: true, lastPurge: "2026-02-28", recordsAffected: 89700 },
  { id: "rr-4", dataType: "User Activity", description: "User interaction and behavior data", retentionDays: 365, action: "anonymize", enabled: true, lastPurge: "2026-03-01", recordsAffected: 45200 },
  { id: "rr-5", dataType: "Error Logs", description: "Application error and crash reports", retentionDays: 30, action: "delete", enabled: true, lastPurge: "2026-03-28", recordsAffected: 1560 },
  { id: "rr-6", dataType: "Notification History", description: "Sent notification records", retentionDays: 60, action: "delete", enabled: false, lastPurge: "Never", recordsAffected: 0 },
  { id: "rr-7", dataType: "Compliance Reports", description: "Generated compliance report data", retentionDays: 730, action: "archive", enabled: true, lastPurge: "2026-01-15", recordsAffected: 24 },
  { id: "rr-8", dataType: "Deleted User Data", description: "GDPR right-to-erasure queue", retentionDays: 30, action: "delete", enabled: true, lastPurge: "2026-03-20", recordsAffected: 8 },
];

const RETENTION_OPTIONS = [7, 14, 30, 60, 90, 180, 365, 730, 1095];
const ACTION_OPTIONS = [
  { value: "delete", label: "Permanently Delete", color: "#ef4444" },
  { value: "archive", label: "Archive to Cold Storage", color: "#3b82f6" },
  { value: "anonymize", label: "Anonymize Data", color: "#a855f7" },
];

// ============================================================================
// CUSTOM SELECT
// ============================================================================

function CustomSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-1.5 text-sm min-w-[140px] w-full outline-none" style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
        <span className="truncate">{selected?.label ?? value}</span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} style={{ color: "var(--gf-text-muted)" }} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-full min-w-[160px] max-h-[200px] overflow-y-auto rounded-xl border py-1 shadow-xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
            {options.map((opt) => (
              <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }} className={`flex w-full items-center px-3 py-2 text-sm hover:bg-white/5 transition-colors ${opt.value === value ? "font-medium" : ""}`} style={{ color: opt.value === value ? "var(--gf-accent)" : "var(--gf-text-primary)" }}>
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function RetentionPolicySettings() {
  const [rules, setRules] = useState<RetentionRule[]>(INITIAL_RULES);
  const [saved, setSaved] = useState(false);
  const [globalRetention, setGlobalRetention] = useState("365");
  const [autoDeleteEnabled, setAutoDeleteEnabled] = useState(true);

  useEffect(() => {
    let cancelled = false;
    import("@/lib/api").then(({ complianceApi }) => complianceApi.getRetentionPolicy())
      .then((policy) => {
        if (cancelled) return;
        // Backend models retention as a single tenant-wide policy. Per-rule
        // configuration is purely client-side; we only sync the global setting.
        setGlobalRetention(String(policy.retention_days));
        setAutoDeleteEnabled(policy.auto_purge_enabled);
      })
      .catch(() => { /* keep fallback sample rules */ });
    return () => { cancelled = true; };
  }, []);

  const updateRule = (id: string, updates: Partial<RetentionRule>) => {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, ...updates } : r));
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      const { complianceApi } = await import("@/lib/api");
      await complianceApi.updateRetentionPolicy({
        retention_days: parseInt(globalRetention),
        auto_purge_enabled: autoDeleteEnabled,
      });
    } catch {
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const totalRecords = rules.filter((r) => r.enabled).reduce((a, r) => a + r.recordsAffected, 0);
  const enabledRules = rules.filter((r) => r.enabled).length;

  const formatDays = (days: number) => {
    if (days >= 365) return `${Math.round(days / 365)} year${days >= 730 ? "s" : ""}`;
    if (days >= 30) return `${Math.round(days / 30)} month${days >= 60 ? "s" : ""}`;
    return `${days} days`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Retention Policy Settings</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>Configure how long data is retained before automatic purging or archival</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: saved ? "#22c55e" : "var(--gf-accent)" }}>
          {saved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Rules", value: enabledRules.toString(), icon: <Shield className="h-5 w-5" /> },
          { label: "Total Rules", value: rules.length.toString(), icon: <Database className="h-5 w-5" /> },
          { label: "Records Affected", value: totalRecords.toLocaleString(), icon: <FileText className="h-5 w-5" /> },
          { label: "Default Retention", value: formatDays(parseInt(globalRetention)), icon: <Clock className="h-5 w-5" /> },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--gf-text-secondary)" }}>{s.label}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}>{s.icon}</div>
            </div>
            <p className="mt-2 text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Global Settings */}
      <div className="rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--gf-text-primary)" }}>Global Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Default Retention Period</label>
            <CustomSelect value={globalRetention} onChange={setGlobalRetention} options={RETENTION_OPTIONS.map((d) => ({ label: formatDays(d), value: d.toString() }))} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Automatic Purging</label>
            <button onClick={() => setAutoDeleteEnabled(!autoDeleteEnabled)} className="flex items-center gap-3 rounded-lg border px-4 py-2 text-sm" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
              <div className={`relative h-5 w-9 rounded-full transition-colors ${autoDeleteEnabled ? "bg-green-500" : "bg-gray-600"}`}>
                <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${autoDeleteEnabled ? "translate-x-4" : "translate-x-0.5"}`} />
              </div>
              <span style={{ color: "var(--gf-text-primary)" }}>{autoDeleteEnabled ? "Enabled" : "Disabled"}</span>
            </button>
          </div>
        </div>
        <div className="flex items-start gap-2 mt-4 p-3 rounded-lg" style={{ backgroundColor: "var(--gf-bg-base)" }}>
          <Info className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "var(--gf-accent)" }} />
          <p className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>
            Automatic purging runs daily at 02:00 UTC. Data marked for deletion is permanently removed. Archived data is moved to cold storage and can be restored within 90 days.
          </p>
        </div>
      </div>

      {/* Rules Table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        <div className="border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
          <h3 className="text-base font-bold" style={{ color: "var(--gf-text-primary)" }}>Retention Rules</h3>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--gf-border)" }}>
          {rules.map((rule) => {
            const actionConfig = ACTION_OPTIONS.find((a) => a.value === rule.action)!;
            return (
              <div key={rule.id} className={`px-6 py-4 ${!rule.enabled ? "opacity-50" : ""}`} style={{ borderColor: "var(--gf-border)" }}>
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Toggle + Info */}
                  <div className="flex items-center gap-3 lg:w-72 shrink-0">
                    <button onClick={() => updateRule(rule.id, { enabled: !rule.enabled })}>
                      <div className={`relative h-5 w-9 rounded-full transition-colors ${rule.enabled ? "bg-green-500" : "bg-gray-600"}`}>
                        <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${rule.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
                      </div>
                    </button>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{rule.dataType}</p>
                      <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{rule.description}</p>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-wrap items-center gap-3 flex-1">
                    <div>
                      <label className="block text-xs mb-1" style={{ color: "var(--gf-text-muted)" }}>Retention</label>
                      <CustomSelect value={rule.retentionDays.toString()} onChange={(v) => updateRule(rule.id, { retentionDays: parseInt(v) })} options={RETENTION_OPTIONS.map((d) => ({ label: formatDays(d), value: d.toString() }))} />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: "var(--gf-text-muted)" }}>Action</label>
                      <CustomSelect value={rule.action} onChange={(v) => updateRule(rule.id, { action: v as RetentionRule["action"] })} options={ACTION_OPTIONS.map((a) => ({ label: a.label, value: a.value }))} />
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 shrink-0 text-xs" style={{ color: "var(--gf-text-muted)" }}>
                    <div className="text-right">
                      <p>Last purge: {rule.lastPurge}</p>
                      <p>{rule.recordsAffected.toLocaleString()} records</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 rounded-xl border p-4" style={{ borderColor: "rgba(239,68,68,0.3)", backgroundColor: "rgba(239,68,68,0.05)" }}>
        <AlertTriangle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-500">Data Deletion Warning</p>
          <p className="text-xs mt-1" style={{ color: "var(--gf-text-secondary)" }}>
            Data deleted by retention policies cannot be recovered. Ensure your retention periods comply with applicable regulations (GDPR, HIPAA, SOC2) before reducing retention windows. Archived data can be restored within 90 days of archival.
          </p>
        </div>
      </div>
    </div>
  );
}
