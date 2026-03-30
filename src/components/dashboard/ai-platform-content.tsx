"use client";

import {
  Brain,
  Cpu,
  MessageSquare,
  Shield,
  Zap,
  Database,
  Workflow,
  BarChart3,
} from "lucide-react";

const stats = [
  { label: "Prompt Templates", value: "56", icon: MessageSquare },
  { label: "Model Providers", value: "3", icon: Cpu },
  { label: "Agents Active", value: "12", icon: Brain },
  { label: "Tokens Used (MTD)", value: "2.4M", icon: Zap },
];

const models = [
  {
    provider: "Anthropic",
    model: "Claude Opus 4.6",
    status: "Active" as const,
    requests: "12.4K",
    avgLatency: "1.2s",
    cost: "$284.50",
  },
  {
    provider: "OpenAI",
    model: "GPT-4o",
    status: "Active" as const,
    requests: "8.1K",
    avgLatency: "0.9s",
    cost: "$192.30",
  },
  {
    provider: "Self-Hosted",
    model: "Llama 3.1 70B",
    status: "Active" as const,
    requests: "3.2K",
    avgLatency: "2.1s",
    cost: "$0.00",
  },
];

const recentPrompts = [
  { name: "auth-integration", version: "v2.1", uses: 342, category: "Service Integration" },
  { name: "payment-checkout", version: "v1.4", uses: 218, category: "Service Integration" },
  { name: "saas-scaffold", version: "v3.0", uses: 156, category: "Scaffolding" },
  { name: "api-error-handler", version: "v1.2", uses: 489, category: "Pattern" },
  { name: "e2e-test-gen", version: "v2.0", uses: 267, category: "Testing" },
];

const guardrails = [
  { name: "PII Detection", status: "Enabled", blocked: 47, desc: "Filters personal data from outputs" },
  { name: "Content Filter", status: "Enabled", blocked: 12, desc: "Blocks harmful or inappropriate content" },
  { name: "Cost Limiter", status: "Enabled", blocked: 3, desc: "Per-tenant token budget enforcement" },
  { name: "Output Validation", status: "Enabled", blocked: 8, desc: "Schema validation on structured outputs" },
];

const agentWorkflows = [
  {
    name: "Customer Support Bot",
    type: "Conversational" as const,
    status: "Active" as const,
    executions: 1_284,
    avgDuration: "3.2s",
    tools: "KB Search, Ticket API, Escalation",
  },
  {
    name: "Doc Ingestion Pipeline",
    type: "RAG" as const,
    status: "Active" as const,
    executions: 412,
    avgDuration: "12.8s",
    tools: "Embedder, Chunker, Vector Store",
  },
  {
    name: "Invoice Processor",
    type: "Task" as const,
    status: "Paused" as const,
    executions: 0,
    avgDuration: "8.4s",
    tools: "OCR, Validator, ERP Push",
  },
  {
    name: "Code Review Agent",
    type: "Task" as const,
    status: "Active" as const,
    executions: 97,
    avgDuration: "18.1s",
    tools: "Git Diff, Linter, Comment API",
  },
  {
    name: "Knowledge Q&A",
    type: "RAG" as const,
    status: "Active" as const,
    executions: 2_310,
    avgDuration: "2.6s",
    tools: "Vector Search, Reranker, LLM",
  },
];

const tenantUsage = [
  { tenant: "Acme Corp", tokensUsed: "1.2M", budget: "$500", usagePct: 72, cost: "$360.00" },
  { tenant: "Globex Inc", tokensUsed: "480K", budget: "$300", usagePct: 48, cost: "$144.00" },
  { tenant: "Initech", tokensUsed: "890K", budget: "$400", usagePct: 89, cost: "$356.00" },
  { tenant: "Umbrella Ltd", tokensUsed: "210K", budget: "$250", usagePct: 25, cost: "$62.50" },
];

export function AIPlatformContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>
          AI &amp; Prompt Platform
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>
          Prompt registry, model routing, guardrails, RAG pipelines, and agent orchestration
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-5"
            style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>
                {stat.label}
              </span>
              <stat.icon className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
            </div>
            <p className="text-2xl font-bold mt-2" style={{ color: "var(--gf-text-primary)" }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Model Routing */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
          Model Routing
        </h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          {models.map((m) => (
            <div
              key={m.model}
              className="rounded-xl p-5"
              style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                <span className="font-semibold" style={{ color: "var(--gf-text-primary)" }}>
                  {m.provider}
                </span>
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>
                {m.model}
              </p>
              <div className="mt-3 flex gap-4 border-t pt-3" style={{ borderColor: "var(--gf-border)" }}>
                <div>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--gf-text-muted)" }}>Requests</p>
                  <p className="text-xs font-semibold" style={{ color: "var(--gf-text-primary)" }}>{m.requests}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--gf-text-muted)" }}>Latency</p>
                  <p className="text-xs font-semibold" style={{ color: "var(--gf-text-primary)" }}>{m.avgLatency}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--gf-text-muted)" }}>Cost (MTD)</p>
                  <p className="text-xs font-semibold" style={{ color: "var(--gf-text-primary)" }}>{m.cost}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Prompt Registry */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          <div className="p-5 pb-3">
            <h2 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>
              Prompt Registry
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["Prompt", "Version", "Uses", "Category"].map((h) => (
                  <th key={h} className="text-left px-5 py-2 text-xs font-medium" style={{ color: "var(--gf-text-secondary)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentPrompts.map((p) => (
                <tr key={p.name} style={{ borderBottom: "1px solid var(--gf-border)" }}>
                  <td className="px-5 py-3 font-mono text-xs" style={{ color: "var(--gf-text-primary)" }}>
                    {p.name}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" }}
                    >
                      {p.version}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                    {p.uses}
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                    {p.category}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Guardrails */}
        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--gf-text-primary)" }}>
            Guardrails
          </h2>
          <div className="space-y-3">
            {guardrails.map((g) => (
              <div
                key={g.name}
                className="flex items-center justify-between rounded-lg p-3"
                style={{ border: "1px solid var(--gf-border)" }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" style={{ color: "var(--gf-accent)" }} />
                    <span className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>
                      {g.name}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5 ml-6" style={{ color: "var(--gf-text-secondary)" }}>
                    {g.desc}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/15 text-green-500">
                    {g.status}
                  </span>
                  <p className="text-[10px] mt-1" style={{ color: "var(--gf-text-muted)" }}>
                    {g.blocked} blocked
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Workflows */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Workflow className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
          <h2 className="text-lg font-semibold" style={{ color: "var(--gf-text-primary)" }}>
            Agent Workflows
          </h2>
        </div>
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["Agent Name", "Type", "Status", "Executions (24h)", "Avg Duration", "Tools Used"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium" style={{ color: "var(--gf-text-secondary)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agentWorkflows.map((a) => (
                <tr key={a.name} style={{ borderBottom: "1px solid var(--gf-border)" }}>
                  <td className="px-5 py-3 text-xs font-medium" style={{ color: "var(--gf-text-primary)" }}>
                    {a.name}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" }}
                    >
                      {a.type}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        a.status === "Active"
                          ? "bg-green-500/15 text-green-500"
                          : "bg-yellow-500/15 text-yellow-500"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                    {a.executions.toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                    {a.avgDuration}
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                    {a.tools}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Usage Tracking */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
          <h2 className="text-lg font-semibold" style={{ color: "var(--gf-text-primary)" }}>
            Usage Tracking
          </h2>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {tenantUsage.map((t) => (
            <div
              key={t.tenant}
              className="rounded-xl p-5"
              style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
            >
              <p className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>
                {t.tenant}
              </p>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span style={{ color: "var(--gf-text-secondary)" }}>Tokens Used (MTD)</span>
                  <span className="font-medium" style={{ color: "var(--gf-text-primary)" }}>{t.tokensUsed}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: "var(--gf-text-secondary)" }}>Budget</span>
                  <span className="font-medium" style={{ color: "var(--gf-text-primary)" }}>{t.budget}</span>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: "var(--gf-text-secondary)" }}>Usage</span>
                    <span className="font-medium" style={{ color: "var(--gf-text-primary)" }}>{t.usagePct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ backgroundColor: "var(--gf-border)" }}>
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${t.usagePct}%`,
                        backgroundColor: t.usagePct >= 80 ? "#ef4444" : "var(--gf-accent)",
                      }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t" style={{ borderColor: "var(--gf-border)" }}>
                  <span style={{ color: "var(--gf-text-secondary)" }}>Cost</span>
                  <span className="font-semibold" style={{ color: "var(--gf-text-primary)" }}>{t.cost}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
