"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Brain, Rocket } from "lucide-react";

const TYPES = ["Conversational", "RAG", "Task"] as const;
const MODELS = ["Claude Opus 4.6", "GPT-4o", "Llama 3.1 70B"];

export default function CreateAgentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: "",
    type: "Task" as (typeof TYPES)[number],
    model: "Claude Opus 4.6",
    tools: "",
    description: "",
  });

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Agent name is required";
    if (!form.tools.trim()) e.tools = "At least one tool is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsSubmitting(false);
    setSuccess(true);
    setTimeout(() => router.push("/dashboard/ai-platform"), 1500);
  };

  const fs = { backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15 mb-4"><Brain className="h-8 w-8 text-green-500" /></div>
        <h2 className="text-xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Agent Created!</h2>
        <p className="text-sm mt-2" style={{ color: "var(--gf-text-secondary)" }}><strong>{form.name}</strong> is now active. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <button onClick={() => router.push("/dashboard/ai-platform")} className="flex items-center gap-2 text-sm font-medium hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><ArrowLeft className="h-4 w-4" />Back to AI Platform</button>
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Create Agent Workflow</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>Configure a new AI agent with model, tools, and behavior</p>
      </div>
      <form onSubmit={handleSubmit} className="rounded-xl border p-6 space-y-6" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Agent Name *</label>
            <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Support Bot" className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fs} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Type</label>
            <select value={form.type} onChange={(e) => update("type", e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fs}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <p className="text-xs mt-1" style={{ color: "var(--gf-text-muted)" }}>
              {form.type === "Conversational" && "Multi-turn dialogue with context retention"}
              {form.type === "RAG" && "Retrieval-augmented generation with knowledge base"}
              {form.type === "Task" && "Single-task execution with tool orchestration"}
            </p>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Model</label>
          <div className="grid grid-cols-3 gap-2">
            {MODELS.map((m) => (
              <button key={m} type="button" onClick={() => update("model", m)} className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${form.model === m ? "ring-2 ring-[var(--gf-accent)]" : "hover:opacity-80"}`} style={{ borderColor: form.model === m ? "var(--gf-accent)" : "var(--gf-border)", backgroundColor: form.model === m ? "var(--gf-accent-bg)" : "var(--gf-bg-base)", color: "var(--gf-text-primary)" }}>{m}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Tools * (comma-separated)</label>
          <input type="text" value={form.tools} onChange={(e) => update("tools", e.target.value)} placeholder="e.g. KB Search, Ticket API, Escalation" className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fs} />
          {errors.tools && <p className="text-xs text-red-500 mt-1">{errors.tools}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Description</label>
          <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} placeholder="Describe what this agent does..." className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none resize-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fs} />
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t" style={{ borderColor: "var(--gf-border)" }}>
          <button type="button" onClick={() => router.push("/dashboard/ai-platform")} className="rounded-lg px-5 py-2.5 text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60" style={{ backgroundColor: "var(--gf-accent)" }}>
            <Rocket className="h-4 w-4" />{isSubmitting ? "Creating..." : "Deploy Agent"}
          </button>
        </div>
      </form>
    </div>
  );
}
