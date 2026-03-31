"use client";

import { useState, useMemo } from "react";
import {
  Brain,
  Cpu,
  MessageSquare,
  Shield,
  Zap,
  Workflow,
  BarChart3,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Play,
  Pause,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Copy,
  Check,
  TestTube,
  History,
  Settings2,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  Send,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface PromptTemplate {
  id: string;
  name: string;
  version: string;
  category: "Service Integration" | "Scaffolding" | "Pattern" | "Testing" | "Conversational" | "Analysis";
  model: string;
  status: "Published" | "Draft" | "Archived";
  uses: number;
  systemPrompt: string;
  created: string;
  updatedAt: string;
}

interface ModelProvider {
  id: string;
  provider: string;
  model: string;
  status: "Active" | "Disabled";
  requests: string;
  avgLatency: string;
  cost: string;
  endpoint: string;
  rateLimit: number;
}

interface AgentWorkflow {
  id: string;
  name: string;
  type: "Conversational" | "RAG" | "Task";
  status: "Active" | "Paused" | "Error";
  executions: number;
  avgDuration: string;
  tools: string;
  model: string;
  description: string;
  created: string;
}

interface Guardrail {
  id: string;
  name: string;
  enabled: boolean;
  blocked: number;
  desc: string;
  severity: "High" | "Medium" | "Low";
}

interface TenantUsage {
  id: string;
  tenant: string;
  tokensUsed: string;
  tokensRaw: number;
  budget: number;
  usagePct: number;
  cost: string;
}

// ============================================================================
// INITIAL DATA
// ============================================================================

const INITIAL_PROMPTS: PromptTemplate[] = [
  { id: "p1", name: "auth-integration", version: "v2.1", category: "Service Integration", model: "Claude Opus 4.6", status: "Published", uses: 342, systemPrompt: "You are an authentication integration assistant. Help developers implement secure OAuth2 and JWT-based authentication flows.", created: "2026-01-15", updatedAt: "2026-03-10" },
  { id: "p2", name: "payment-checkout", version: "v1.4", category: "Service Integration", model: "GPT-4o", status: "Published", uses: 218, systemPrompt: "You are a payment integration specialist. Guide users through implementing checkout flows with Stripe and Razorpay.", created: "2026-01-20", updatedAt: "2026-02-28" },
  { id: "p3", name: "saas-scaffold", version: "v3.0", category: "Scaffolding", model: "Claude Opus 4.6", status: "Published", uses: 156, systemPrompt: "Generate production-ready SaaS boilerplate code with multi-tenancy, RBAC, and billing support.", created: "2026-02-01", updatedAt: "2026-03-15" },
  { id: "p4", name: "api-error-handler", version: "v1.2", category: "Pattern", model: "Claude Opus 4.6", status: "Published", uses: 489, systemPrompt: "Design robust API error handling patterns with proper HTTP status codes, error messages, and retry strategies.", created: "2026-01-10", updatedAt: "2026-03-05" },
  { id: "p5", name: "e2e-test-gen", version: "v2.0", category: "Testing", model: "GPT-4o", status: "Published", uses: 267, systemPrompt: "Generate comprehensive end-to-end tests using Playwright. Cover happy paths, edge cases, and accessibility.", created: "2026-02-10", updatedAt: "2026-03-20" },
  { id: "p6", name: "data-pipeline-design", version: "v1.0", category: "Analysis", model: "Llama 3.1 70B", status: "Draft", uses: 0, systemPrompt: "Design ETL data pipelines with proper error handling, monitoring, and scalability considerations.", created: "2026-03-25", updatedAt: "2026-03-25" },
  { id: "p7", name: "chatbot-persona", version: "v1.1", category: "Conversational", model: "Claude Opus 4.6", status: "Published", uses: 534, systemPrompt: "You are a friendly and knowledgeable customer support chatbot for a SaaS platform.", created: "2026-01-05", updatedAt: "2026-02-15" },
];

const INITIAL_MODELS: ModelProvider[] = [
  { id: "m1", provider: "Anthropic", model: "Claude Opus 4.6", status: "Active", requests: "12.4K", avgLatency: "1.2s", cost: "$284.50", endpoint: "https://api.anthropic.com/v1", rateLimit: 1000 },
  { id: "m2", provider: "OpenAI", model: "GPT-4o", status: "Active", requests: "8.1K", avgLatency: "0.9s", cost: "$192.30", endpoint: "https://api.openai.com/v1", rateLimit: 800 },
  { id: "m3", provider: "Self-Hosted", model: "Llama 3.1 70B", status: "Active", requests: "3.2K", avgLatency: "2.1s", cost: "$0.00", endpoint: "http://llm-cluster.internal:8080", rateLimit: 500 },
];

const INITIAL_AGENTS: AgentWorkflow[] = [
  { id: "a1", name: "Customer Support Bot", type: "Conversational", status: "Active", executions: 1284, avgDuration: "3.2s", tools: "KB Search, Ticket API, Escalation", model: "Claude Opus 4.6", description: "Handles tier-1 customer support queries with knowledge base lookup and ticket creation", created: "2026-01-10" },
  { id: "a2", name: "Doc Ingestion Pipeline", type: "RAG", status: "Active", executions: 412, avgDuration: "12.8s", tools: "Embedder, Chunker, Vector Store", model: "Claude Opus 4.6", description: "Processes uploaded documents into vector embeddings for knowledge base", created: "2026-01-20" },
  { id: "a3", name: "Invoice Processor", type: "Task", status: "Paused", executions: 0, avgDuration: "8.4s", tools: "OCR, Validator, ERP Push", model: "GPT-4o", description: "Extracts data from invoices and pushes to ERP system", created: "2026-02-05" },
  { id: "a4", name: "Code Review Agent", type: "Task", status: "Active", executions: 97, avgDuration: "18.1s", tools: "Git Diff, Linter, Comment API", model: "Claude Opus 4.6", description: "Automated code review with linting and best practice suggestions", created: "2026-02-15" },
  { id: "a5", name: "Knowledge Q&A", type: "RAG", status: "Active", executions: 2310, avgDuration: "2.6s", tools: "Vector Search, Reranker, LLM", model: "Claude Opus 4.6", description: "Answers questions using internal knowledge base with source citations", created: "2026-01-25" },
];

const INITIAL_GUARDRAILS: Guardrail[] = [
  { id: "g1", name: "PII Detection", enabled: true, blocked: 47, desc: "Filters personal data from outputs", severity: "High" },
  { id: "g2", name: "Content Filter", enabled: true, blocked: 12, desc: "Blocks harmful or inappropriate content", severity: "High" },
  { id: "g3", name: "Cost Limiter", enabled: true, blocked: 3, desc: "Per-tenant token budget enforcement", severity: "Medium" },
  { id: "g4", name: "Output Validation", enabled: true, blocked: 8, desc: "Schema validation on structured outputs", severity: "Medium" },
  { id: "g5", name: "Prompt Injection Guard", enabled: true, blocked: 23, desc: "Detects and blocks prompt injection attempts", severity: "High" },
  { id: "g6", name: "Rate Limiter", enabled: true, blocked: 5, desc: "Enforces per-user request rate limits", severity: "Low" },
];

const INITIAL_USAGE: TenantUsage[] = [
  { id: "tu1", tenant: "Acme Corp", tokensUsed: "1.2M", tokensRaw: 1200000, budget: 500, usagePct: 72, cost: "$360.00" },
  { id: "tu2", tenant: "Globex Inc", tokensUsed: "480K", tokensRaw: 480000, budget: 300, usagePct: 48, cost: "$144.00" },
  { id: "tu3", tenant: "Initech", tokensUsed: "890K", tokensRaw: 890000, budget: 400, usagePct: 89, cost: "$356.00" },
  { id: "tu4", tenant: "Umbrella Ltd", tokensUsed: "210K", tokensRaw: 210000, budget: 250, usagePct: 25, cost: "$62.50" },
];

const PROMPT_CATEGORIES: PromptTemplate["category"][] = ["Service Integration", "Scaffolding", "Pattern", "Testing", "Conversational", "Analysis"];
const PROMPT_STATUSES: PromptTemplate["status"][] = ["Published", "Draft", "Archived"];
const AGENT_TYPES: AgentWorkflow["type"][] = ["Conversational", "RAG", "Task"];
const MODEL_NAMES = ["Claude Opus 4.6", "GPT-4o", "Llama 3.1 70B"];

const STATUS_COLORS: Record<string, string> = {
  Active: "#22c55e", Published: "#22c55e", Enabled: "#22c55e",
  Paused: "#f59e0b", Draft: "#f59e0b", Disabled: "#6b7280",
  Error: "#ef4444", Archived: "#6b7280",
};

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  Conversational: { bg: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" },
  RAG: { bg: "rgba(168, 85, 247, 0.15)", color: "#a855f7" },
  Task: { bg: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" },
};

const PAGE_SIZE = 5;

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>{label}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}>{icon}</div>
      </div>
      <p className="text-2xl font-bold mt-2" style={{ color: "var(--gf-text-primary)" }}>{value}</p>
    </div>
  );
}

function ConfirmModal({ title, icon, iconClass, message, confirmLabel, confirmClass, onConfirm, onCancel }: {
  title: string; icon: React.ReactNode; iconClass: string; message: React.ReactNode; confirmLabel: string; confirmClass: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${iconClass}`}>{icon}</div>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>{title}</h2>
        </div>
        <div className="text-sm mb-6" style={{ color: "var(--gf-text-secondary)" }}>{message}</div>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium border transition-colors hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
          <button onClick={onConfirm} className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${confirmClass}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

const fieldStyle = { backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" };

// ============================================================================
// PROMPT FORM MODAL
// ============================================================================

function PromptFormModal({ prompt, onSave, onCancel }: { prompt?: PromptTemplate | null; onSave: (data: Partial<PromptTemplate>) => void; onCancel: () => void }) {
  const isEdit = !!prompt;
  const [name, setName] = useState(prompt?.name ?? "");
  const [category, setCategory] = useState<PromptTemplate["category"]>(prompt?.category ?? "Pattern");
  const [model, setModel] = useState(prompt?.model ?? "Claude Opus 4.6");
  const [status, setStatus] = useState<PromptTemplate["status"]>(prompt?.status ?? "Draft");
  const [systemPrompt, setSystemPrompt] = useState(prompt?.systemPrompt ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!systemPrompt.trim()) e.systemPrompt = "System prompt is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({ name, category, model, status, systemPrompt });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>{isEdit ? "Edit Prompt" : "Create Prompt Template"}</h2>
          <button onClick={onCancel} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Prompt Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. my-prompt" className="w-full rounded-lg border px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as PromptTemplate["category"])} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
                {PROMPT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Model</label>
              <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
                {MODEL_NAMES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            {isEdit && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as PromptTemplate["status"])} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
                  {PROMPT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>System Prompt *</label>
            <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={5} placeholder="Enter the system prompt..." className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none font-mono focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
            {errors.systemPrompt && <p className="text-xs text-red-500 mt-1">{errors.systemPrompt}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
            <button type="submit" className="rounded-lg px-5 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>{isEdit ? "Save Changes" : "Create Prompt"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// MODEL PROVIDER FORM MODAL
// ============================================================================

function ModelFormModal({ model, onSave, onCancel }: { model?: ModelProvider | null; onSave: (data: Partial<ModelProvider>) => void; onCancel: () => void }) {
  const isEdit = !!model;
  const [provider, setProvider] = useState(model?.provider ?? "");
  const [modelName, setModelName] = useState(model?.model ?? "");
  const [endpoint, setEndpoint] = useState(model?.endpoint ?? "");
  const [rateLimit, setRateLimit] = useState(model?.rateLimit ?? 500);
  const [status, setStatus] = useState<ModelProvider["status"]>(model?.status ?? "Active");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!provider.trim()) e.provider = "Provider name is required";
    if (!modelName.trim()) e.modelName = "Model name is required";
    if (!endpoint.trim()) e.endpoint = "Endpoint is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({ provider, model: modelName, endpoint, rateLimit, status });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>{isEdit ? "Edit Provider" : "Add Model Provider"}</h2>
          <button onClick={onCancel} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Provider *</label>
              <input type="text" value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="e.g. Anthropic" className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
              {errors.provider && <p className="text-xs text-red-500 mt-1">{errors.provider}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Model Name *</label>
              <input type="text" value={modelName} onChange={(e) => setModelName(e.target.value)} placeholder="e.g. Claude Opus 4.6" className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
              {errors.modelName && <p className="text-xs text-red-500 mt-1">{errors.modelName}</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Endpoint URL *</label>
            <input type="text" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder="https://api.provider.com/v1" className="w-full rounded-lg border px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
            {errors.endpoint && <p className="text-xs text-red-500 mt-1">{errors.endpoint}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Rate Limit (req/min)</label>
              <input type="number" min={1} value={rateLimit} onChange={(e) => setRateLimit(Number(e.target.value))} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
            </div>
            {isEdit && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as ModelProvider["status"])} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
                  <option value="Active">Active</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
            <button type="submit" className="rounded-lg px-5 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>{isEdit ? "Save Changes" : "Add Provider"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// AGENT FORM MODAL
// ============================================================================

function AgentFormModal({ agent, onSave, onCancel }: { agent?: AgentWorkflow | null; onSave: (data: Partial<AgentWorkflow>) => void; onCancel: () => void }) {
  const isEdit = !!agent;
  const [name, setName] = useState(agent?.name ?? "");
  const [type, setType] = useState<AgentWorkflow["type"]>(agent?.type ?? "Task");
  const [model, setModel] = useState(agent?.model ?? "Claude Opus 4.6");
  const [tools, setTools] = useState(agent?.tools ?? "");
  const [description, setDescription] = useState(agent?.description ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!tools.trim()) e.tools = "At least one tool is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({ name, type, model, tools, description });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>{isEdit ? "Edit Agent" : "Create Agent Workflow"}</h2>
          <button onClick={onCancel} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Agent Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Support Bot" className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as AgentWorkflow["type"])} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
                {AGENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Model</label>
              <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
                {MODEL_NAMES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Tools *</label>
              <input type="text" value={tools} onChange={(e) => setTools(e.target.value)} placeholder="e.g. KB Search, Ticket API" className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
              {errors.tools && <p className="text-xs text-red-500 mt-1">{errors.tools}</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What does this agent do..." className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
            <button type="submit" className="rounded-lg px-5 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>{isEdit ? "Save Changes" : "Create Agent"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// BUDGET EDIT MODAL
// ============================================================================

function BudgetModal({ usage, onSave, onCancel }: { usage: TenantUsage; onSave: (budget: number) => void; onCancel: () => void }) {
  const [budget, setBudget] = useState(usage.budget);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div className="w-full max-w-sm rounded-2xl border p-6 shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-1" style={{ color: "var(--gf-text-primary)" }}>Edit Budget</h2>
        <p className="text-sm mb-4" style={{ color: "var(--gf-text-secondary)" }}>{usage.tenant}</p>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Monthly Budget ($)</label>
          <input type="number" min={0} value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
          <button onClick={() => onSave(budget)} className="rounded-lg px-5 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PROMPT DETAIL SLIDE-OVER
// ============================================================================

function PromptDetail({ prompt, onClose, onEdit }: { prompt: PromptTemplate; onClose: () => void; onEdit: () => void }) {
  const statusColor = STATUS_COLORS[prompt.status];
  const [testInput, setTestInput] = useState("");
  const [testOutput, setTestOutput] = useState("");
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    if (!testInput.trim()) return;
    setTesting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setTestOutput(`[AI Response Preview]\n\nBased on the prompt "${prompt.name}" (${prompt.model}):\n\n${testInput}\n\n--- This is a simulated response for testing purposes. In production, this would call the actual model API.`);
    setTesting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={onClose}>
      <div className="w-full max-w-xl h-full overflow-y-auto border-l shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Prompt Details</h2>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="rounded-lg px-3 py-1.5 text-xs font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-accent)" }}><Pencil className="h-3 w-3 inline mr-1" />Edit</button>
            <button onClick={onClose} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X className="h-5 w-5" /></button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-xl font-bold font-mono" style={{ color: "var(--gf-text-primary)" }}>{prompt.name}</h3>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" }}>{prompt.version}</span>
              <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: `${statusColor}20`, color: statusColor }}>{prompt.status}</span>
              <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-secondary)" }}>{prompt.category}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[{ l: "Model", v: prompt.model }, { l: "Uses", v: prompt.uses.toString() }, { l: "Created", v: prompt.created }, { l: "Updated", v: prompt.updatedAt }].map((i) => (
              <div key={i.l} className="rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                <p className="text-xs font-medium mb-0.5" style={{ color: "var(--gf-text-muted)" }}>{i.l}</p>
                <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{i.v}</p>
              </div>
            ))}
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2" style={{ color: "var(--gf-text-primary)" }}>System Prompt</h4>
            <div className="rounded-lg border p-4 text-sm font-mono leading-relaxed" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)", color: "var(--gf-text-secondary)" }}>{prompt.systemPrompt}</div>
          </div>
          {/* Playground */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: "var(--gf-text-primary)" }}>
              <TestTube className="h-4 w-4" style={{ color: "var(--gf-accent)" }} />Test Playground
            </h4>
            <textarea value={testInput} onChange={(e) => setTestInput(e.target.value)} rows={3} placeholder="Enter a test message..." className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none mb-2 focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
            <button onClick={handleTest} disabled={testing || !testInput.trim()} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50" style={{ backgroundColor: "var(--gf-accent)" }}>
              <Send className="h-4 w-4" />{testing ? "Running..." : "Test Prompt"}
            </button>
            {testOutput && (
              <div className="mt-3 rounded-lg border p-4 text-sm font-mono whitespace-pre-wrap" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)", color: "var(--gf-text-secondary)" }}>{testOutput}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// AGENT DETAIL SLIDE-OVER
// ============================================================================

function AgentDetail({ agent, onClose, onEdit }: { agent: AgentWorkflow; onClose: () => void; onEdit: () => void }) {
  const statusColor = STATUS_COLORS[agent.status];
  const typeStyle = TYPE_COLORS[agent.type];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={onClose}>
      <div className="w-full max-w-xl h-full overflow-y-auto border-l shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Agent Details</h2>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="rounded-lg px-3 py-1.5 text-xs font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-accent)" }}><Pencil className="h-3 w-3 inline mr-1" />Edit</button>
            <button onClick={onClose} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X className="h-5 w-5" /></button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: typeStyle.bg }}>
              <Brain className="h-7 w-7" style={{ color: typeStyle.color }} />
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{agent.name}</h3>
              <p className="text-sm mt-0.5" style={{ color: "var(--gf-text-secondary)" }}>{agent.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: typeStyle.bg, color: typeStyle.color }}>{agent.type}</span>
            <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: `${statusColor}20`, color: statusColor }}>{agent.status}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[{ l: "Model", v: agent.model }, { l: "Executions (24h)", v: agent.executions.toLocaleString() }, { l: "Avg Duration", v: agent.avgDuration }, { l: "Created", v: agent.created }].map((i) => (
              <div key={i.l} className="rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                <p className="text-xs font-medium mb-0.5" style={{ color: "var(--gf-text-muted)" }}>{i.l}</p>
                <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{i.v}</p>
              </div>
            ))}
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2" style={{ color: "var(--gf-text-primary)" }}>Tools</h4>
            <div className="flex flex-wrap gap-1.5">
              {agent.tools.split(", ").map((t) => (
                <span key={t} className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" }}>{t}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2" style={{ color: "var(--gf-text-primary)" }}>Recent Executions</h4>
            <div className="space-y-2">
              {[{ status: "Success", duration: "2.8s", time: "2 min ago" }, { status: "Success", duration: "3.5s", time: "15 min ago" }, { status: "Error", duration: "0.3s", time: "1 hr ago" }, { status: "Success", duration: "4.1s", time: "2 hr ago" }].map((ex, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "var(--gf-border)" }}>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ex.status === "Success" ? "#22c55e" : "#ef4444" }} />
                    <span className="text-sm" style={{ color: "var(--gf-text-primary)" }}>{ex.status}</span>
                    <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{ex.duration}</span>
                  </div>
                  <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{ex.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AIPlatformContent() {
  // State
  const [prompts, setPrompts] = useState(INITIAL_PROMPTS);
  const [models, setModels] = useState(INITIAL_MODELS);
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [guardrails, setGuardrails] = useState(INITIAL_GUARDRAILS);
  const [usage, setUsage] = useState(INITIAL_USAGE);

  const [activeTab, setActiveTab] = useState<"prompts" | "models" | "guardrails" | "usage">("prompts");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Modals
  const [promptForm, setPromptForm] = useState<{ open: boolean; prompt: PromptTemplate | null }>({ open: false, prompt: null });
  const [modelForm, setModelForm] = useState<{ open: boolean; model: ModelProvider | null }>({ open: false, model: null });
  const [agentForm, setAgentForm] = useState<{ open: boolean; agent: AgentWorkflow | null }>({ open: false, agent: null });
  const [deleteModal, setDeleteModal] = useState<{ type: string; id: string; name: string } | null>(null);
  const [budgetModal, setBudgetModal] = useState<TenantUsage | null>(null);
  const [viewPrompt, setViewPrompt] = useState<PromptTemplate | null>(null);
  const [viewAgent, setViewAgent] = useState<AgentWorkflow | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  // Stats
  const totalPrompts = prompts.length;
  const activeProviders = models.filter((m) => m.status === "Active").length;
  const activeAgents = agents.filter((a) => a.status === "Active").length;
  const totalTokens = "2.4M";

  // Filtered prompts
  const filteredPrompts = useMemo(() => {
    let list = prompts;
    if (search) { const q = search.toLowerCase(); list = list.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)); }
    return list;
  }, [prompts, search]);

  const filteredAgents = useMemo(() => {
    let list = agents;
    if (search) { const q = search.toLowerCase(); list = list.filter((a) => a.name.toLowerCase().includes(q) || a.type.toLowerCase().includes(q)); }
    return list;
  }, [agents, search]);

  const promptPages = Math.max(1, Math.ceil(filteredPrompts.length / PAGE_SIZE));
  const safePage = Math.min(page, promptPages);
  const pagedPrompts = filteredPrompts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Handlers
  const handleCreatePrompt = (data: Partial<PromptTemplate>) => {
    const np: PromptTemplate = { id: `p${Date.now()}`, name: data.name!, version: "v1.0", category: data.category!, model: data.model!, status: "Draft", uses: 0, systemPrompt: data.systemPrompt!, created: new Date().toISOString().slice(0, 10), updatedAt: new Date().toISOString().slice(0, 10) };
    setPrompts((prev) => [np, ...prev]);
    setPromptForm({ open: false, prompt: null });
  };

  const handleEditPrompt = (data: Partial<PromptTemplate>) => {
    if (!promptForm.prompt) return;
    setPrompts((prev) => prev.map((p) => (p.id === promptForm.prompt!.id ? { ...p, ...data, updatedAt: new Date().toISOString().slice(0, 10) } : p)));
    setPromptForm({ open: false, prompt: null });
  };

  const handleCreateModel = (data: Partial<ModelProvider>) => {
    const nm: ModelProvider = { id: `m${Date.now()}`, provider: data.provider!, model: data.model!, status: "Active", requests: "0", avgLatency: "—", cost: "$0.00", endpoint: data.endpoint!, rateLimit: data.rateLimit! };
    setModels((prev) => [...prev, nm]);
    setModelForm({ open: false, model: null });
  };

  const handleEditModel = (data: Partial<ModelProvider>) => {
    if (!modelForm.model) return;
    setModels((prev) => prev.map((m) => (m.id === modelForm.model!.id ? { ...m, ...data } : m)));
    setModelForm({ open: false, model: null });
  };

  const handleCreateAgent = (data: Partial<AgentWorkflow>) => {
    const na: AgentWorkflow = { id: `a${Date.now()}`, name: data.name!, type: data.type!, status: "Active", executions: 0, avgDuration: "—", tools: data.tools!, model: data.model!, description: data.description ?? "", created: new Date().toISOString().slice(0, 10) };
    setAgents((prev) => [na, ...prev]);
    setAgentForm({ open: false, agent: null });
  };

  const handleEditAgent = (data: Partial<AgentWorkflow>) => {
    if (!agentForm.agent) return;
    setAgents((prev) => prev.map((a) => (a.id === agentForm.agent!.id ? { ...a, ...data } : a)));
    setAgentForm({ open: false, agent: null });
  };

  const handleDelete = () => {
    if (!deleteModal) return;
    if (deleteModal.type === "prompt") setPrompts((prev) => prev.filter((p) => p.id !== deleteModal.id));
    else if (deleteModal.type === "model") setModels((prev) => prev.filter((m) => m.id !== deleteModal.id));
    else if (deleteModal.type === "agent") setAgents((prev) => prev.filter((a) => a.id !== deleteModal.id));
    setDeleteModal(null);
  };

  const handleToggleAgent = (id: string) => {
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, status: a.status === "Active" ? "Paused" : "Active" } : a)));
  };

  const handleToggleGuardrail = (id: string) => {
    setGuardrails((prev) => prev.map((g) => (g.id === id ? { ...g, enabled: !g.enabled } : g)));
  };

  const handleSaveBudget = (budget: number) => {
    if (!budgetModal) return;
    setUsage((prev) => prev.map((u) => (u.id === budgetModal.id ? { ...u, budget, usagePct: Math.round((parseFloat(u.cost.replace("$", "").replace(",", "")) / budget) * 100) } : u)));
    setBudgetModal(null);
  };

  const handleExport = () => {
    let csv = "";
    if (activeTab === "prompts") {
      csv = "Name,Version,Category,Model,Status,Uses\n" + prompts.map((p) => `"${p.name}","${p.version}","${p.category}","${p.model}","${p.status}",${p.uses}`).join("\n");
    } else if (activeTab === "models") {
      csv = "Provider,Model,Status,Requests,Latency,Cost\n" + models.map((m) => `"${m.provider}","${m.model}","${m.status}","${m.requests}","${m.avgLatency}","${m.cost}"`).join("\n");
    }
    if (!csv) return;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ai-platform-${activeTab}-export.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>AI &amp; Prompt Platform</h1>
          <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>Prompt registry, model routing, guardrails, RAG pipelines, and agent orchestration</p>
        </div>
        <div className="flex items-center gap-2">
          {(activeTab === "prompts" || activeTab === "models") && (
            <button onClick={handleExport} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
              <Download className="h-4 w-4" />Export
            </button>
          )}
          {activeTab === "prompts" && (
            <button onClick={() => setPromptForm({ open: true, prompt: null })} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>
              <Plus className="h-4 w-4" />New Prompt
            </button>
          )}
          {activeTab === "models" && (
            <>
              <button onClick={() => setModelForm({ open: true, model: null })} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>
                <Plus className="h-4 w-4" />Add Provider
              </button>
              <button onClick={() => setAgentForm({ open: true, agent: null })} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>
                <Plus className="h-4 w-4" />New Agent
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<MessageSquare className="h-5 w-5" />} label="Prompt Templates" value={totalPrompts} />
        <StatCard icon={<Cpu className="h-5 w-5" />} label="Model Providers" value={activeProviders} />
        <StatCard icon={<Brain className="h-5 w-5" />} label="Agents Active" value={activeAgents} />
        <StatCard icon={<Zap className="h-5 w-5" />} label="Tokens Used (MTD)" value={totalTokens} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg p-1" style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}>
        {(["prompts", "models", "guardrails", "usage"] as const).map((tab) => (
          <button key={tab} onClick={() => { setActiveTab(tab); setSearch(""); setPage(1); }} className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab ? "text-white" : ""}`} style={activeTab === tab ? { backgroundColor: "var(--gf-accent)" } : { color: "var(--gf-text-secondary)" }}>
            {tab === "prompts" ? "Prompts" : tab === "models" ? "Models & Agents" : tab === "guardrails" ? "Guardrails" : "Usage & Budgets"}
          </button>
        ))}
      </div>

      {/* Search (prompts & models tabs) */}
      {(activeTab === "prompts" || activeTab === "models") && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--gf-text-muted)" }} />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={activeTab === "prompts" ? "Search prompts by name or category..." : "Search agents by name or type..."} className="w-full rounded-lg border pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
        </div>
      )}

      {/* ===================== PROMPTS TAB ===================== */}
      {activeTab === "prompts" && (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                  {["Prompt Name", "Version", "Category", "Model", "Status", "Uses", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--gf-text-secondary)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedPrompts.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-12 text-center">
                    <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
                    <p className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>No prompts found</p>
                  </td></tr>
                ) : pagedPrompts.map((p) => {
                  const sc = STATUS_COLORS[p.status];
                  return (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: "var(--gf-border)" }}>
                      <td className="px-5 py-3"><button onClick={() => setViewPrompt(p)} className="font-mono text-xs font-medium hover:underline underline-offset-2" style={{ color: "var(--gf-text-primary)" }}>{p.name}</button></td>
                      <td className="px-5 py-3"><span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" }}>{p.version}</span></td>
                      <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{p.category}</td>
                      <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{p.model}</td>
                      <td className="px-5 py-3"><span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${sc}20`, color: sc }}>{p.status}</span></td>
                      <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{p.uses}</td>
                      <td className="px-5 py-3">
                        <div className="relative">
                          <button onClick={() => setOpenActionId(openActionId === p.id ? null : p.id)} className="rounded-lg p-1.5 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><MoreHorizontal className="h-4 w-4" /></button>
                          {openActionId === p.id && (
                            <><div className="fixed inset-0 z-40" onClick={() => setOpenActionId(null)} />
                              <div className="absolute right-0 top-8 z-50 w-44 rounded-xl border py-1 shadow-xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
                                <button onClick={() => { setViewPrompt(p); setOpenActionId(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--gf-text-primary)" }}><Eye className="h-4 w-4" style={{ color: "var(--gf-text-secondary)" }} />View Details</button>
                                <button onClick={() => { setPromptForm({ open: true, prompt: p }); setOpenActionId(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--gf-text-primary)" }}><Pencil className="h-4 w-4" style={{ color: "var(--gf-text-secondary)" }} />Edit</button>
                                <div className="my-1 border-t" style={{ borderColor: "var(--gf-border)" }} />
                                <button onClick={() => { setDeleteModal({ type: "prompt", id: p.id, name: p.name }); setOpenActionId(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10"><Trash2 className="h-4 w-4" />Delete</button>
                              </div></>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredPrompts.length > PAGE_SIZE && (
            <div className="flex items-center justify-between border-t px-6 py-3" style={{ borderColor: "var(--gf-border)" }}>
              <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Page {safePage} of {promptPages}</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1} className="rounded-lg p-1.5 hover:opacity-70 disabled:opacity-30" style={{ color: "var(--gf-text-secondary)" }}><ChevronLeft className="h-4 w-4" /></button>
                {Array.from({ length: promptPages }, (_, i) => i + 1).map((n) => (
                  <button key={n} onClick={() => setPage(n)} className={`h-7 w-7 rounded-lg text-xs font-medium ${n === safePage ? "text-white" : "hover:opacity-70"}`} style={n === safePage ? { backgroundColor: "var(--gf-accent)" } : { color: "var(--gf-text-secondary)" }}>{n}</button>
                ))}
                <button onClick={() => setPage((p) => Math.min(promptPages, p + 1))} disabled={safePage >= promptPages} className="rounded-lg p-1.5 hover:opacity-70 disabled:opacity-30" style={{ color: "var(--gf-text-secondary)" }}><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== MODELS & AGENTS TAB ===================== */}
      {activeTab === "models" && (
        <>
          {/* Model Provider Cards */}
          <div>
            <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>Model Providers</h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              {models.map((m) => {
                const sc = STATUS_COLORS[m.status];
                return (
                  <div key={m.id} className="rounded-xl p-5" style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: sc }} />
                        <span className="font-semibold" style={{ color: "var(--gf-text-primary)" }}>{m.provider}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setModelForm({ open: true, model: m })} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setDeleteModal({ type: "model", id: m.id, name: `${m.provider} - ${m.model}` })} className="rounded-lg p-1 hover:opacity-70 text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                    <p className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>{m.model}</p>
                    <p className="text-[10px] font-mono mt-1 truncate" style={{ color: "var(--gf-text-muted)" }}>{m.endpoint}</p>
                    <div className="mt-3 flex gap-4 border-t pt-3" style={{ borderColor: "var(--gf-border)" }}>
                      {[{ l: "Requests", v: m.requests }, { l: "Latency", v: m.avgLatency }, { l: "Cost", v: m.cost }].map((s) => (
                        <div key={s.l}><p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--gf-text-muted)" }}>{s.l}</p><p className="text-xs font-semibold" style={{ color: "var(--gf-text-primary)" }}>{s.v}</p></div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agent Workflows Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Workflow className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
                <h2 className="text-lg font-semibold" style={{ color: "var(--gf-text-primary)" }}>Agent Workflows</h2>
              </div>
            </div>
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                    {["Agent Name", "Type", "Status", "Executions", "Avg Duration", "Tools", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--gf-text-secondary)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAgents.map((a) => {
                    const sc = STATUS_COLORS[a.status];
                    const tc = TYPE_COLORS[a.type];
                    return (
                      <tr key={a.id} className="border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: "var(--gf-border)" }}>
                        <td className="px-5 py-3"><button onClick={() => setViewAgent(a)} className="text-xs font-medium hover:underline underline-offset-2" style={{ color: "var(--gf-text-primary)" }}>{a.name}</button></td>
                        <td className="px-5 py-3"><span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: tc.bg, color: tc.color }}>{a.type}</span></td>
                        <td className="px-5 py-3"><span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${sc}20`, color: sc }}>{a.status}</span></td>
                        <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{a.executions.toLocaleString()}</td>
                        <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{a.avgDuration}</td>
                        <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{a.tools}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleToggleAgent(a.id)} title={a.status === "Active" ? "Pause" : "Resume"} className="rounded-lg p-1.5 hover:opacity-70" style={{ color: a.status === "Active" ? "#f59e0b" : "#22c55e" }}>
                              {a.status === "Active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </button>
                            <button onClick={() => setAgentForm({ open: true, agent: a })} className="rounded-lg p-1.5 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><Pencil className="h-4 w-4" /></button>
                            <button onClick={() => setDeleteModal({ type: "agent", id: a.id, name: a.name })} className="rounded-lg p-1.5 hover:opacity-70 text-red-500"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ===================== GUARDRAILS TAB ===================== */}
      {activeTab === "guardrails" && (
        <div className="space-y-4">
          <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Toggle guardrails on or off. Changes take effect immediately across all tenants.</p>
          {guardrails.map((g) => {
            const severityColor = g.severity === "High" ? "#ef4444" : g.severity === "Medium" ? "#f59e0b" : "#3b82f6";
            return (
              <div key={g.id} className="flex items-center justify-between rounded-xl p-5" style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}>
                <div className="flex items-center gap-4">
                  <Shield className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>{g.name}</span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: `${severityColor}20`, color: severityColor }}>{g.severity}</span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "var(--gf-text-secondary)" }}>{g.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: "var(--gf-text-primary)" }}>{g.blocked}</p>
                    <p className="text-[10px]" style={{ color: "var(--gf-text-muted)" }}>blocked</p>
                  </div>
                  <button onClick={() => handleToggleGuardrail(g.id)} className="relative">
                    <div className={`h-6 w-11 rounded-full transition-colors ${g.enabled ? "bg-green-500" : "bg-gray-600"}`}>
                      <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow ${g.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                    </div>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===================== USAGE TAB ===================== */}
      {activeTab === "usage" && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {usage.map((t) => (
            <div key={t.id} className="rounded-xl p-5" style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>{t.tenant}</p>
                <button onClick={() => setBudgetModal(t)} className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md hover:opacity-80" style={{ backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" }}>
                  <Pencil className="h-3 w-3" />Budget
                </button>
              </div>
              <div className="space-y-2">
                {[{ l: "Tokens Used (MTD)", v: t.tokensUsed }, { l: "Budget", v: `$${t.budget}` }, { l: "Cost", v: t.cost }].map((r) => (
                  <div key={r.l} className="flex justify-between text-xs">
                    <span style={{ color: "var(--gf-text-secondary)" }}>{r.l}</span>
                    <span className="font-medium" style={{ color: "var(--gf-text-primary)" }}>{r.v}</span>
                  </div>
                ))}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: "var(--gf-text-secondary)" }}>Usage</span>
                    <span className="font-medium" style={{ color: "var(--gf-text-primary)" }}>{t.usagePct}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full" style={{ backgroundColor: "var(--gf-border)" }}>
                    <div className="h-2.5 rounded-full transition-all" style={{ width: `${t.usagePct}%`, backgroundColor: t.usagePct >= 80 ? "#ef4444" : t.usagePct >= 60 ? "#f59e0b" : "var(--gf-accent)" }} />
                  </div>
                </div>
                {t.usagePct >= 80 && (
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-red-500">
                    <AlertTriangle className="h-3 w-3" />Approaching budget limit
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===================== MODALS ===================== */}

      {promptForm.open && <PromptFormModal prompt={promptForm.prompt} onSave={promptForm.prompt ? handleEditPrompt : handleCreatePrompt} onCancel={() => setPromptForm({ open: false, prompt: null })} />}
      {modelForm.open && <ModelFormModal model={modelForm.model} onSave={modelForm.model ? handleEditModel : handleCreateModel} onCancel={() => setModelForm({ open: false, model: null })} />}
      {agentForm.open && <AgentFormModal agent={agentForm.agent} onSave={agentForm.agent ? handleEditAgent : handleCreateAgent} onCancel={() => setAgentForm({ open: false, agent: null })} />}
      {budgetModal && <BudgetModal usage={budgetModal} onSave={handleSaveBudget} onCancel={() => setBudgetModal(null)} />}

      {deleteModal && (
        <ConfirmModal
          title={`Delete ${deleteModal.type === "prompt" ? "Prompt" : deleteModal.type === "model" ? "Provider" : "Agent"}`}
          icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
          iconClass="bg-red-500/15"
          message={<>Are you sure you want to delete <strong style={{ color: "var(--gf-text-primary)" }}>{deleteModal.name}</strong>? This action cannot be undone.</>}
          confirmLabel="Delete"
          confirmClass="bg-red-600 hover:bg-red-700"
          onConfirm={handleDelete}
          onCancel={() => setDeleteModal(null)}
        />
      )}

      {viewPrompt && <PromptDetail prompt={viewPrompt} onClose={() => setViewPrompt(null)} onEdit={() => { setPromptForm({ open: true, prompt: viewPrompt }); setViewPrompt(null); }} />}
      {viewAgent && <AgentDetail agent={viewAgent} onClose={() => setViewAgent(null)} onEdit={() => { setAgentForm({ open: true, agent: viewAgent }); setViewAgent(null); }} />}
    </div>
  );
}
