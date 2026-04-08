"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, MessageSquare, Pencil, Send, TestTube, Copy, Check } from "lucide-react";

interface PromptTemplate {
  id: string; name: string; version: string; category: string; model: string; status: string; uses: number; systemPrompt: string; created: string; updatedAt: string;
}

const ALL_PROMPTS: PromptTemplate[] = [
  { id: "p1", name: "auth-integration", version: "v2.1", category: "Service Integration", model: "Claude Opus 4.6", status: "Published", uses: 342, systemPrompt: "You are an authentication integration assistant. Help developers implement secure OAuth2 and JWT-based authentication flows.", created: "2026-01-15", updatedAt: "2026-03-10" },
  { id: "p2", name: "payment-checkout", version: "v1.4", category: "Service Integration", model: "GPT-4o", status: "Published", uses: 218, systemPrompt: "You are a payment integration specialist. Guide users through implementing checkout flows with Stripe and Razorpay.", created: "2026-01-20", updatedAt: "2026-02-28" },
  { id: "p3", name: "saas-scaffold", version: "v3.0", category: "Scaffolding", model: "Claude Opus 4.6", status: "Published", uses: 156, systemPrompt: "Generate production-ready SaaS boilerplate code with multi-tenancy, RBAC, and billing support.", created: "2026-02-01", updatedAt: "2026-03-15" },
  { id: "p4", name: "api-error-handler", version: "v1.2", category: "Pattern", model: "Claude Opus 4.6", status: "Published", uses: 489, systemPrompt: "Design robust API error handling patterns with proper HTTP status codes, error messages, and retry strategies.", created: "2026-01-10", updatedAt: "2026-03-05" },
  { id: "p5", name: "e2e-test-gen", version: "v2.0", category: "Testing", model: "GPT-4o", status: "Published", uses: 267, systemPrompt: "Generate comprehensive end-to-end tests using Playwright. Cover happy paths, edge cases, and accessibility.", created: "2026-02-10", updatedAt: "2026-03-20" },
  { id: "p6", name: "data-pipeline-design", version: "v1.0", category: "Analysis", model: "Llama 3.1 70B", status: "Draft", uses: 0, systemPrompt: "Design ETL data pipelines with proper error handling, monitoring, and scalability considerations.", created: "2026-03-25", updatedAt: "2026-03-25" },
  { id: "p7", name: "chatbot-persona", version: "v1.1", category: "Conversational", model: "Claude Opus 4.6", status: "Published", uses: 534, systemPrompt: "You are a friendly and knowledgeable customer support chatbot for a SaaS platform.", created: "2026-01-05", updatedAt: "2026-02-15" },
];

const STATUS_COLORS: Record<string, string> = { Published: "#22c55e", Draft: "#f59e0b", Archived: "#6b7280" };

export default function PromptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const promptId = params.id as string;
  const [prompt, setPrompt] = useState<PromptTemplate | null>(null);
  const [copied, setCopied] = useState(false);
  const [testInput, setTestInput] = useState("");
  const [testOutput, setTestOutput] = useState("");
  const [testing, setTesting] = useState(false);

  useEffect(() => { setPrompt(ALL_PROMPTS.find((p) => p.id === promptId) ?? null); }, [promptId]);

  const handleCopy = () => { if (!prompt) return; navigator.clipboard.writeText(prompt.systemPrompt); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const handleTest = async () => {
    if (!testInput.trim() || !prompt) return;
    setTesting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setTestOutput(`[AI Response Preview]\n\nUsing prompt "${prompt.name}" (${prompt.model}):\n\nInput: ${testInput}\n\n--- Simulated response for testing. In production, this calls the actual model API.`);
    setTesting(false);
  };

  if (!prompt) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <MessageSquare className="h-12 w-12 mb-4 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
        <p className="text-lg font-semibold" style={{ color: "var(--gf-text-primary)" }}>Prompt Not Found</p>
        <button onClick={() => router.push("/dashboard/ai-platform")} className="mt-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: "var(--gf-accent)" }}><ArrowLeft className="h-4 w-4" />Back</button>
      </div>
    );
  }

  const sc = STATUS_COLORS[prompt.status] ?? "#6b7280";

  return (
    <div className="space-y-6 max-w-4xl">
      <button onClick={() => router.push("/dashboard/ai-platform")} className="flex items-center gap-2 text-sm font-medium hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><ArrowLeft className="h-4 w-4" />Back to AI Platform</button>

      {/* Header */}
      <div className="rounded-xl border p-6" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-mono" style={{ color: "var(--gf-text-primary)" }}>{prompt.name}</h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" }}>{prompt.version}</span>
              <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: `${sc}20`, color: sc }}>{prompt.status}</span>
              <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-secondary)" }}>{prompt.category}</span>
              <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-secondary)" }}>{prompt.model}</span>
            </div>
          </div>
          <button onClick={() => router.push("/dashboard/ai-platform")} className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}><Pencil className="h-4 w-4" />Edit</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[{ l: "Uses", v: prompt.uses.toString() }, { l: "Model", v: prompt.model }, { l: "Created", v: prompt.created }, { l: "Last Updated", v: prompt.updatedAt }].map((s) => (
          <div key={s.l} className="rounded-xl border p-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            <p className="text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>{s.l}</p>
            <p className="text-sm font-bold mt-1" style={{ color: "var(--gf-text-primary)" }}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* System Prompt */}
      <div className="rounded-xl border p-6" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>System Prompt</h2>
          <button onClick={handleCopy} className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md hover:opacity-80" style={{ backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" }}>
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}{copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="rounded-lg border p-4 text-sm font-mono leading-relaxed whitespace-pre-wrap" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)", color: "var(--gf-text-secondary)" }}>{prompt.systemPrompt}</div>
      </div>

      {/* Playground */}
      <div className="rounded-xl border p-6" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--gf-text-primary)" }}><TestTube className="h-4 w-4" style={{ color: "var(--gf-accent)" }} />Test Playground</h2>
        <textarea value={testInput} onChange={(e) => setTestInput(e.target.value)} rows={3} placeholder="Enter a test message to simulate this prompt..." className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none resize-none mb-3 focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
        <button onClick={handleTest} disabled={testing || !testInput.trim()} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50" style={{ backgroundColor: "var(--gf-accent)" }}>
          <Send className="h-4 w-4" />{testing ? "Running..." : "Test Prompt"}
        </button>
        {testOutput && (
          <div className="mt-4 rounded-lg border p-4 text-sm font-mono whitespace-pre-wrap" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)", color: "var(--gf-text-secondary)" }}>{testOutput}</div>
        )}
      </div>
    </div>
  );
}
