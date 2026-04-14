"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Brain, Pencil, Play, Pause, Activity, Clock, Cpu, Wrench } from "lucide-react";

interface AgentWorkflow {
  id: string; name: string; type: "Conversational" | "RAG" | "Task"; status: "Active" | "Paused" | "Error"; executions: number; avgDuration: string; tools: string; model: string; description: string; created: string;
}

const ALL_AGENTS: AgentWorkflow[] = [
  { id: "a1", name: "Customer Support Bot", type: "Conversational", status: "Active", executions: 1284, avgDuration: "3.2s", tools: "KB Search, Ticket API, Escalation", model: "Claude Opus 4.6", description: "Handles tier-1 customer support queries with knowledge base lookup and ticket creation", created: "2026-01-10" },
  { id: "a2", name: "Doc Ingestion Pipeline", type: "RAG", status: "Active", executions: 412, avgDuration: "12.8s", tools: "Embedder, Chunker, Vector Store", model: "Claude Opus 4.6", description: "Processes uploaded documents into vector embeddings for knowledge base", created: "2026-01-20" },
  { id: "a3", name: "Invoice Processor", type: "Task", status: "Paused", executions: 0, avgDuration: "8.4s", tools: "OCR, Validator, ERP Push", model: "GPT-4o", description: "Extracts data from invoices and pushes to ERP system", created: "2026-02-05" },
  { id: "a4", name: "Code Review Agent", type: "Task", status: "Active", executions: 97, avgDuration: "18.1s", tools: "Git Diff, Linter, Comment API", model: "Claude Opus 4.6", description: "Automated code review with linting and best practice suggestions", created: "2026-02-15" },
  { id: "a5", name: "Knowledge Q&A", type: "RAG", status: "Active", executions: 2310, avgDuration: "2.6s", tools: "Vector Search, Reranker, LLM", model: "Claude Opus 4.6", description: "Answers questions using internal knowledge base with source citations", created: "2026-01-25" },
];

const STATUS_COLORS: Record<string, string> = { Active: "#22c55e", Paused: "#f59e0b", Error: "#ef4444" };
const TYPE_COLORS: Record<string, { bg: string; color: string }> = { Conversational: { bg: "rgba(59,130,246,0.15)", color: "#3b82f6" }, RAG: { bg: "rgba(168,85,247,0.15)", color: "#a855f7" }, Task: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b" } };

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;
  const [agent, setAgent] = useState<AgentWorkflow | null>(null);

  useEffect(() => { setAgent(ALL_AGENTS.find((a) => a.id === agentId) ?? null); }, [agentId]);

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Brain className="h-12 w-12 mb-4 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
        <p className="text-lg font-semibold" style={{ color: "var(--gf-text-primary)" }}>Agent Not Found</p>
        <button onClick={() => router.push("/ai-platform")} className="mt-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: "var(--gf-accent)" }}><ArrowLeft className="h-4 w-4" />Back</button>
      </div>
    );
  }

  const sc = STATUS_COLORS[agent.status];
  const tc = TYPE_COLORS[agent.type];

  return (
    <div className="space-y-6">
      <button onClick={() => router.push("/ai-platform")} className="flex items-center gap-2 text-sm font-medium hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><ArrowLeft className="h-4 w-4" />Back to AI Platform</button>

      {/* Header */}
      <div className="rounded-xl border p-6" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: tc.bg }}><Brain className="h-7 w-7" style={{ color: tc.color }} /></div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{agent.name}</h1>
              <p className="text-sm mt-0.5" style={{ color: "var(--gf-text-secondary)" }}>{agent.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: tc.bg, color: tc.color }}>{agent.type}</span>
                <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: `${sc}20`, color: sc }}>{agent.status}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}><Pencil className="h-4 w-4" />Edit</button>
            <button className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white ${agent.status === "Active" ? "bg-amber-600 hover:bg-amber-700" : "bg-green-600 hover:bg-green-700"}`}>
              {agent.status === "Active" ? <><Pause className="h-4 w-4" />Pause</> : <><Play className="h-4 w-4" />Resume</>}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <Activity className="h-5 w-5" />, label: "Executions (24h)", value: agent.executions.toLocaleString() },
          { icon: <Clock className="h-5 w-5" />, label: "Avg Duration", value: agent.avgDuration },
          { icon: <Cpu className="h-5 w-5" />, label: "Model", value: agent.model },
          { icon: <Wrench className="h-5 w-5" />, label: "Tools", value: agent.tools.split(", ").length.toString() },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-4 rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}>{s.icon}</div>
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--gf-text-secondary)" }}>{s.label}</p>
              <p className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tools */}
        <div className="rounded-xl border p-6" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--gf-text-primary)" }}>Connected Tools</h2>
          <div className="space-y-2">
            {agent.tools.split(", ").map((t) => (
              <div key={t} className="flex items-center gap-2 py-2 border-b last:border-0" style={{ borderColor: "var(--gf-border)" }}>
                <Wrench className="h-4 w-4" style={{ color: "var(--gf-accent)" }} />
                <span className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Execution Log */}
        <div className="rounded-xl border p-6" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--gf-text-primary)" }}>Recent Executions</h2>
          <div className="space-y-2">
            {[
              { s: "Success", d: "2.8s", t: "2 min ago" },
              { s: "Success", d: "3.5s", t: "15 min ago" },
              { s: "Error", d: "0.3s", t: "1 hr ago" },
              { s: "Success", d: "4.1s", t: "2 hr ago" },
              { s: "Success", d: "2.2s", t: "3 hr ago" },
              { s: "Success", d: "5.7s", t: "5 hr ago" },
            ].map((ex, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "var(--gf-border)" }}>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ex.s === "Success" ? "#22c55e" : "#ef4444" }} />
                  <span className="text-sm" style={{ color: "var(--gf-text-primary)" }}>{ex.s}</span>
                  <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{ex.d}</span>
                </div>
                <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{ex.t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Config */}
        <div className="rounded-xl border p-6 lg:col-span-2" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--gf-text-primary)" }}>Configuration</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { l: "Model", v: agent.model },
              { l: "Type", v: agent.type },
              { l: "Created", v: agent.created },
              { l: "Max Retries", v: "3" },
              { l: "Timeout", v: "30s" },
              { l: "Concurrency", v: "10" },
            ].map((c) => (
              <div key={c.l} className="rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                <p className="text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>{c.l}</p>
                <p className="text-sm font-medium mt-0.5" style={{ color: "var(--gf-text-primary)" }}>{c.v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
