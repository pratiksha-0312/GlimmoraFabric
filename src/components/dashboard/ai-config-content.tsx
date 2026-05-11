"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Cpu,
  Shield,
  BarChart3,
  X,
  Save,
  ToggleLeft,
  ToggleRight,
  Zap,
  DollarSign,
  Clock,
  Activity,
  Users,
  Building2,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  modelId: string;
  enabled: boolean;
  maxTokens: number;
  temperature: number;
  rateLimit: number;
  costPer1kTokens: number;
}

interface Guardrail {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: "Block" | "Warn" | "Log";
  scope: "All" | "Production" | "Staging";
}

// ---------------------------------------------------------------------------
// Sample Data
// ---------------------------------------------------------------------------

const INITIAL_MODELS: ModelConfig[] = [];

const INITIAL_GUARDRAILS: Guardrail[] = [];

// Mock analytics data
const TOKEN_USAGE_7D = [];

const COST_BY_TENANT = [];

const MODEL_PERF = [];

const SEVERITY_COLORS: Record<Guardrail["severity"], { bg: string; color: string }> = {
  Block: { bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444" },
  Warn: { bg: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" },
  Log: { bg: "rgba(107, 114, 128, 0.15)", color: "#6b7280" },
};

// ---------------------------------------------------------------------------
// Modal Overlay
// ---------------------------------------------------------------------------

function ModalOverlay({ children, onClose, wide }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 animate-in fade-in duration-200" style={{ zIndex: 9999, backgroundColor: "rgba(0,0,0,0.7)" }} onClick={onClose}>
      <div className={`w-full ${wide ? "max-w-3xl" : "max-w-lg"} max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl animate-in zoom-in-95 duration-200`} style={{ backgroundColor: "var(--gf-bg-surface)" }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

function StatCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string | number; detail?: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}>{icon}</div>
      <div>
        <p className="text-xs font-medium" style={{ color: "var(--gf-text-secondary)" }}>{label}</p>
        <p className="text-xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{value}</p>
        {detail && <p className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>{detail}</p>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab type
// ---------------------------------------------------------------------------

type TabKey = "models" | "guardrails" | "analytics";

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function AIConfigContent() {
  const [tab, setTab] = useState<TabKey>("models");

  // Model state
  const [models, setModels] = useState<ModelConfig[]>(INITIAL_MODELS);
  const [editModel, setEditModel] = useState<ModelConfig | null>(null);

  // Guardrail state
  const [guardrails, setGuardrails] = useState<Guardrail[]>(INITIAL_GUARDRAILS);

  const fieldStyle = { backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" };

  // Stats
  const totalTokens7d = TOKEN_USAGE_7D.reduce((s, d) => s + d.input + d.output, 0);
  const totalCost = COST_BY_TENANT.reduce((s, t) => s + t.cost, 0);
  const maxTokenDay = Math.max(...TOKEN_USAGE_7D.map((d) => d.input + d.output));

  // Model handlers
  const toggleModel = (id: string) => {
    setModels((prev) => prev.map((m) => m.id === id ? { ...m, enabled: !m.enabled } : m));
    const model = models.find((m) => m.id === id);
    toast.success(model?.enabled ? `${model.name} disabled` : `${model?.name} enabled`);
  };

  const saveModel = () => {
    if (!editModel) return;
    setModels((prev) => prev.map((m) => m.id === editModel.id ? editModel : m));
    setEditModel(null);
    toast.success("Model configuration saved ✓");
  };

  // Guardrail handlers
  const toggleGuardrail = (id: string) => {
    setGuardrails((prev) => prev.map((g) => g.id === id ? { ...g, enabled: !g.enabled } : g));
  };

  const updateGuardrailSeverity = (id: string, severity: Guardrail["severity"]) => {
    setGuardrails((prev) => prev.map((g) => g.id === id ? { ...g, severity } : g));
  };

  const saveGuardrails = () => {
    toast.success("Guardrails configuration saved ✓");
  };

  const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "models", label: "Model Config", icon: <Cpu className="h-4 w-4" /> },
    { key: "guardrails", label: "Guardrails", icon: <Shield className="h-4 w-4" /> },
    { key: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>AI Configuration & Analytics</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>Configure AI models, guardrails, and monitor usage analytics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Cpu className="h-5 w-5" />} label="Active Models" value={models.filter((m) => m.enabled).length} detail={`${models.length} total`} />
        <StatCard icon={<Shield className="h-5 w-5" />} label="Guardrails Active" value={guardrails.filter((g) => g.enabled).length} detail={`${guardrails.length} configured`} />
        <StatCard icon={<Zap className="h-5 w-5" />} label="Tokens (7d)" value={`${(totalTokens7d / 1000000).toFixed(1)}M`} />
        <StatCard icon={<DollarSign className="h-5 w-5" />} label="Cost (7d)" value={`$${totalCost.toFixed(2)}`} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b pb-0" style={{ borderColor: "var(--gf-border)" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px"
            style={{
              borderColor: tab === t.key ? "var(--gf-accent)" : "transparent",
              color: tab === t.key ? "var(--gf-accent)" : "var(--gf-text-secondary)",
            }}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1: Model Configuration
         ══════════════════════════════════════════════════════════════════════ */}
      {tab === "models" && (
        <div className="space-y-4">
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            <table className="w-full">
              <thead>
                <tr className="text-xs uppercase" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-secondary)" }}>
                  <th className="px-4 py-3 text-left font-medium">Model</th>
                  <th className="px-4 py-3 text-left font-medium">Provider</th>
                  <th className="px-4 py-3 text-center font-medium">Max Tokens</th>
                  <th className="px-4 py-3 text-center font-medium">Rate Limit</th>
                  <th className="px-4 py-3 text-center font-medium">Cost/1K</th>
                  <th className="px-4 py-3 text-center font-medium">Status</th>
                  <th className="px-4 py-3 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {models.map((m) => (
                  <tr key={m.id} className="border-t hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: "var(--gf-border)" }}>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{m.name}</p>
                      <p className="text-[10px] font-mono" style={{ color: "var(--gf-text-muted)" }}>{m.modelId}</p>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--gf-text-secondary)" }}>{m.provider}</td>
                    <td className="px-4 py-3 text-sm text-center" style={{ color: "var(--gf-text-primary)" }}>{m.maxTokens.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-center" style={{ color: "var(--gf-text-primary)" }}>{m.rateLimit}/min</td>
                    <td className="px-4 py-3 text-sm text-center" style={{ color: "var(--gf-text-primary)" }}>${m.costPer1kTokens}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleModel(m.id)} style={{ color: m.enabled ? "#22c55e" : "var(--gf-text-muted)" }}>
                        {m.enabled ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => setEditModel({ ...m })} className="rounded-lg px-3 py-1 text-xs font-medium border transition-colors hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-accent)" }}>
                        Configure
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: Guardrails Configuration
         ══════════════════════════════════════════════════════════════════════ */}
      {tab === "guardrails" && (
        <div className="space-y-4">
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            <table className="w-full">
              <thead>
                <tr className="text-xs uppercase" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-secondary)" }}>
                  <th className="px-4 py-3 text-left font-medium">Guardrail</th>
                  <th className="px-4 py-3 text-left font-medium">Scope</th>
                  <th className="px-4 py-3 text-center font-medium">Severity</th>
                  <th className="px-4 py-3 text-center font-medium">Enabled</th>
                </tr>
              </thead>
              <tbody>
                {guardrails.map((g) => {
                  const sevStyle = SEVERITY_COLORS[g.severity];
                  return (
                    <tr key={g.id} className="border-t hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: "var(--gf-border)" }}>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{g.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--gf-text-muted)" }}>{g.description}</p>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: "var(--gf-text-secondary)" }}>{g.scope}</td>
                      <td className="px-4 py-3 text-center">
                        <select
                          value={g.severity}
                          onChange={(e) => updateGuardrailSeverity(g.id, e.target.value as Guardrail["severity"])}
                          className="rounded border px-2 py-1 text-xs font-medium outline-none"
                          style={{ backgroundColor: sevStyle.bg, color: sevStyle.color, borderColor: "transparent" }}
                        >
                          <option value="Block">Block</option>
                          <option value="Warn">Warn</option>
                          <option value="Log">Log</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleGuardrail(g.id)} style={{ color: g.enabled ? "#22c55e" : "var(--gf-text-muted)" }}>
                          {g.enabled ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end">
            <button onClick={saveGuardrails} className="flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90" style={{ backgroundColor: "var(--gf-accent)" }}>
              <Save className="h-4 w-4" />Save Guardrails
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3: AI Usage Analytics Dashboard
         ══════════════════════════════════════════════════════════════════════ */}
      {tab === "analytics" && (
        <div className="space-y-6">

          {/* ── Token Usage Charts ─────────────────────────── */}
          <div className="rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Token Usage — Last 7 Days</h3>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "var(--gf-accent)" }} />Input</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "#3b82f6" }} />Output</span>
              </div>
            </div>
            <div className="flex items-end gap-3 h-44">
              {TOKEN_USAGE_7D.map((d) => {
                const total = d.input + d.output;
                const inputPct = (d.input / maxTokenDay) * 100;
                const outputPct = (d.output / maxTokenDay) * 100;
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] font-medium" style={{ color: "var(--gf-text-muted)" }}>{(total / 1000).toFixed(0)}K</span>
                    <div className="w-full flex flex-col gap-0.5" style={{ height: `${((total / maxTokenDay) * 100)}%`, minHeight: "8px" }}>
                      <div className="w-full rounded-t-sm flex-grow" style={{ backgroundColor: "var(--gf-accent)", opacity: 0.85, height: `${(inputPct / (inputPct + outputPct)) * 100}%` }} />
                      <div className="w-full rounded-b-sm flex-grow" style={{ backgroundColor: "#3b82f6", opacity: 0.85, height: `${(outputPct / (inputPct + outputPct)) * 100}%` }} />
                    </div>
                    <span className="text-[9px] font-medium" style={{ color: "var(--gf-text-muted)" }}>{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Cost Breakdown by Tenant ───────────────────── */}
          <div className="rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--gf-text-primary)" }}>Cost Breakdown by Tenant</h3>
            <div className="space-y-3">
              {COST_BY_TENANT.map((t) => (
                <div key={t.code} className="flex items-center gap-3">
                  <div className="w-28 shrink-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--gf-text-primary)" }}>{t.tenant}</p>
                    <p className="text-[10px] font-mono" style={{ color: "var(--gf-text-muted)" }}>{t.code}</p>
                  </div>
                  <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${t.pct}%`, backgroundColor: "var(--gf-accent)", opacity: 0.85 }} />
                  </div>
                  <div className="w-20 text-right shrink-0">
                    <p className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>${t.cost.toFixed(2)}</p>
                    <p className="text-[10px]" style={{ color: "var(--gf-text-muted)" }}>{(t.tokens / 1000).toFixed(0)}K tok</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Model Performance Metrics ──────────────────── */}
          <div className="rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--gf-text-primary)" }}>Model Performance Metrics</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs uppercase" style={{ color: "var(--gf-text-secondary)" }}>
                    <th className="px-3 py-2 text-left font-medium">Model</th>
                    <th className="px-3 py-2 text-center font-medium">Avg Latency</th>
                    <th className="px-3 py-2 text-center font-medium">P95 Latency</th>
                    <th className="px-3 py-2 text-center font-medium">Success Rate</th>
                    <th className="px-3 py-2 text-center font-medium">Total Requests</th>
                    <th className="px-3 py-2 text-center font-medium">Avg Tokens</th>
                  </tr>
                </thead>
                <tbody>
                  {MODEL_PERF.map((m) => (
                    <tr key={m.model} className="border-t" style={{ borderColor: "var(--gf-border)" }}>
                      <td className="px-3 py-2.5 text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{m.model}</td>
                      <td className="px-3 py-2.5 text-sm text-center" style={{ color: "var(--gf-text-primary)" }}>{m.avgLatency}s</td>
                      <td className="px-3 py-2.5 text-sm text-center" style={{ color: m.p95Latency > 3 ? "#ef4444" : "var(--gf-text-primary)" }}>{m.p95Latency}s</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="text-sm font-medium" style={{ color: m.successRate >= 99.5 ? "#22c55e" : m.successRate >= 99 ? "#f59e0b" : "#ef4444" }}>{m.successRate}%</span>
                      </td>
                      <td className="px-3 py-2.5 text-sm text-center" style={{ color: "var(--gf-text-primary)" }}>{m.totalRequests.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-sm text-center" style={{ color: "var(--gf-text-primary)" }}>{m.avgTokens}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Model Edit Modal ──────────────────────────────── */}
      {editModel && (
        <ModalOverlay onClose={() => setEditModel(null)} wide>
          <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
            <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Configure — {editModel.name}</h2>
            <button onClick={() => setEditModel(null)} className="rounded-lg p-1 transition-colors hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X className="h-5 w-5" /></button>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Model Name</label>
                <input type="text" value={editModel.name} readOnly className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none cursor-not-allowed" style={{ backgroundColor: "var(--gf-bg-elevated)", borderColor: "var(--gf-border)", color: "var(--gf-text-muted)" }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Model ID</label>
                <input type="text" value={editModel.modelId} readOnly className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none cursor-not-allowed font-mono text-xs" style={{ backgroundColor: "var(--gf-bg-elevated)", borderColor: "var(--gf-border)", color: "var(--gf-text-muted)" }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Max Tokens</label>
                <input type="number" min={1} value={editModel.maxTokens} onChange={(e) => setEditModel({ ...editModel, maxTokens: Number(e.target.value) })} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Rate Limit (req/min)</label>
                <input type="number" min={1} value={editModel.rateLimit} onChange={(e) => setEditModel({ ...editModel, rateLimit: Number(e.target.value) })} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium" style={{ color: "var(--gf-text-secondary)" }}>Temperature</label>
                <span className="text-xs font-bold" style={{ color: "var(--gf-accent)" }}>{editModel.temperature}</span>
              </div>
              <input type="range" min={0} max={1} step={0.1} value={editModel.temperature} onChange={(e) => setEditModel({ ...editModel, temperature: Number(e.target.value) })} className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[var(--gf-accent)]" style={{ backgroundColor: "var(--gf-bg-elevated)" }} />
              <div className="flex justify-between text-[10px] mt-1" style={{ color: "var(--gf-text-muted)" }}>
                <span>Precise (0)</span><span>Creative (1)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Cost per 1K Tokens ($)</label>
              <input type="number" min={0} step={0.001} value={editModel.costPer1kTokens} onChange={(e) => setEditModel({ ...editModel, costPer1kTokens: Number(e.target.value) })} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
            </div>

            <div className="flex justify-end gap-3 border-t pt-4" style={{ borderColor: "var(--gf-border)" }}>
              <button type="button" onClick={() => setEditModel(null)} className="rounded-lg px-4 py-2 text-sm font-medium border transition-colors hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
              <button type="button" onClick={saveModel} className="flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90" style={{ backgroundColor: "var(--gf-accent)" }}>
                <Save className="h-4 w-4" />Save Configuration
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}
