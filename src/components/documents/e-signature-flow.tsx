"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  PenTool,
  UserPlus,
  Send,
  X,
  Mail,
  User,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import type { UserRole } from "@/lib/roles";

// ============================================================================
// TYPES
// ============================================================================

interface Signer {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface SignatureRequest {
  signers: Signer[];
  message: string;
  expiresIn: string;
  reminderDays: string;
}

const STEPS = ["Add Signers", "Configure", "Review & Send"];

// ============================================================================
// COMPONENT
// ============================================================================

export function ESignatureRequestFlow() {
  const router = useRouter();
  const params = useParams();
  const docId = params.id as string;
  const [docName, setDocName] = useState("Document");

  const [step, setStep] = useState(0);
  const [data, setData] = useState<SignatureRequest>({
    signers: [{ id: "1", name: "", email: "", role: "signer" }],
    message: "Please review and sign this document at your earliest convenience.",
    expiresIn: "7",
    reminderDays: "3",
  });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!docId) return;
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch(`/api/documents/${docId}`);
        if (!resp.ok) return;
        const d = await resp.json();
        if (!cancelled && d?.name) setDocName(d.name);
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [docId]);

  const addSigner = () => {
    setData(prev => ({
      ...prev,
      signers: [...prev.signers, { id: String(Date.now()), name: "", email: "", role: "signer" }],
    }));
  };

  const removeSigner = (id: string) => {
    if (data.signers.length <= 1) return;
    setData(prev => ({ ...prev, signers: prev.signers.filter(s => s.id !== id) }));
  };

  const updateSigner = (id: string, field: keyof Signer, value: string) => {
    setData(prev => ({
      ...prev,
      signers: prev.signers.map(s => s.id === id ? { ...s, [field]: value } : s),
    }));
  };

  const canNext = () => {
    if (step === 0) return data.signers.every(s => s.name.trim() && s.email.trim());
    return true;
  };

  const handleSend = async () => {
    setSending(true);
    setError(null);
    try {
      // POST one /sign/request per signer (backend creates one signature row per call)
      for (const s of data.signers) {
        const resp = await fetch(`/api/documents/${docId}/sign/request`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signerName: s.name, signerEmail: s.email }),
        });
        if (!resp.ok) {
          const body = await resp.json().catch(() => ({}));
          throw new Error(body?.error || `HTTP ${resp.status}`);
        }
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send signature requests");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <AuthGuard allowedRoles={["tenant_member"] as UserRole[]}>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--gf-accent-bg)" }}>
            <Check className="w-8 h-8" style={{ color: "var(--gf-accent)" }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Signature Request Sent!</h1>
          <p className="text-sm text-center max-w-md" style={{ color: "var(--gf-text-muted)" }}>
            E-signature requests have been sent to {data.signers.length} signer{data.signers.length > 1 ? "s" : ""}. You&apos;ll be notified when they sign.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <button onClick={() => router.push(`/documents/${docId}`)} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}>
              <FileText className="w-4 h-4" /> View Document
            </button>
            <button onClick={() => router.push("/documents")} className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors" style={{ backgroundColor: "var(--gf-accent)" }}>
              Back to Documents
            </button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard allowedRoles={["tenant_member"] as UserRole[]}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.push(`/documents/${docId}`)} className="rounded-lg border p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: "var(--gf-border)" }}>
            <ArrowLeft className="w-4 h-4" style={{ color: "var(--gf-text-secondary)" }} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Request E-Signature</h1>
            <p className="text-sm flex items-center gap-1" style={{ color: "var(--gf-text-muted)" }}>
              <FileText className="w-3.5 h-3.5" /> {docName}
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
                style={i <= step ? { backgroundColor: "var(--gf-accent)", color: "#fff" } : { backgroundColor: "var(--gf-bg-surface)", color: "var(--gf-text-muted)", border: "1px solid var(--gf-border)" }}
              >
                {i < step ? <Check className="w-3 h-3" /> : <span>{i + 1}</span>}
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4" style={{ color: "var(--gf-text-muted)" }} />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="rounded-xl border p-6" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
          {/* Step 0: Add Signers */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold" style={{ color: "var(--gf-text-primary)" }}>Add Signers</h2>
                <button onClick={addSigner} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: "var(--gf-border)", color: "var(--gf-accent)" }}>
                  <Plus className="w-3.5 h-3.5" /> Add Signer
                </button>
              </div>
              <div className="space-y-3">
                {data.signers.map((signer, idx) => (
                  <div key={signer.id} className="rounded-lg border p-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>Signer {idx + 1}</span>
                      {data.signers.length > 1 && (
                        <button onClick={() => removeSigner(signer.id)} className="rounded p-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-muted)" }}>Full Name *</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--gf-text-muted)" }} />
                          <input
                            value={signer.name}
                            onChange={e => updateSigner(signer.id, "name", e.target.value)}
                            placeholder="John Smith"
                            className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none"
                            style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-muted)" }}>Email *</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--gf-text-muted)" }} />
                          <input
                            value={signer.email}
                            onChange={e => updateSigner(signer.id, "email", e.target.value)}
                            placeholder="john@company.com"
                            type="email"
                            className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none"
                            style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-muted)" }}>Role</label>
                      <select
                        value={signer.role}
                        onChange={e => updateSigner(signer.id, "role", e.target.value)}
                        className="rounded-lg border px-3 py-2 text-sm outline-none"
                        style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
                      >
                        <option value="signer">Signer</option>
                        <option value="approver">Approver</option>
                        <option value="viewer">Viewer (CC)</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Configure */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold" style={{ color: "var(--gf-text-primary)" }}>Configure Request</h2>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--gf-text-secondary)" }}>Message to Signers</label>
                <textarea
                  value={data.message}
                  onChange={e => setData(prev => ({ ...prev, message: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none resize-y"
                  style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--gf-text-secondary)" }}>Expires In (days)</label>
                  <select
                    value={data.expiresIn}
                    onChange={e => setData(prev => ({ ...prev, expiresIn: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                    style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
                  >
                    <option value="3">3 days</option>
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--gf-text-secondary)" }}>Reminder Every (days)</label>
                  <select
                    value={data.reminderDays}
                    onChange={e => setData(prev => ({ ...prev, reminderDays: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                    style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
                  >
                    <option value="1">Every day</option>
                    <option value="2">Every 2 days</option>
                    <option value="3">Every 3 days</option>
                    <option value="7">Every week</option>
                    <option value="0">No reminders</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Review & Send */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold" style={{ color: "var(--gf-text-primary)" }}>Review & Send</h2>
              <div className="rounded-lg border p-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                <h3 className="text-sm font-medium mb-3" style={{ color: "var(--gf-text-secondary)" }}>Document</h3>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" style={{ color: "var(--gf-accent)" }} />
                  <span className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{docName}</span>
                </div>
              </div>
              <div className="rounded-lg border p-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                <h3 className="text-sm font-medium mb-3" style={{ color: "var(--gf-text-secondary)" }}>Signers ({data.signers.length})</h3>
                <div className="space-y-2">
                  {data.signers.map(s => (
                    <div key={s.id} className="flex items-center gap-3 text-sm">
                      <UserPlus className="w-4 h-4" style={{ color: "var(--gf-text-muted)" }} />
                      <span style={{ color: "var(--gf-text-primary)" }}>{s.name}</span>
                      <span style={{ color: "var(--gf-text-muted)" }}>&lt;{s.email}&gt;</span>
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-medium capitalize" style={{ backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" }}>{s.role}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border p-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                <h3 className="text-sm font-medium mb-2" style={{ color: "var(--gf-text-secondary)" }}>Settings</h3>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between"><dt style={{ color: "var(--gf-text-muted)" }}>Expires in</dt><dd style={{ color: "var(--gf-text-primary)" }}>{data.expiresIn} days</dd></div>
                  <div className="flex justify-between"><dt style={{ color: "var(--gf-text-muted)" }}>Reminders</dt><dd style={{ color: "var(--gf-text-primary)" }}>{data.reminderDays === "0" ? "Disabled" : `Every ${data.reminderDays} day(s)`}</dd></div>
                </dl>
              </div>
              {data.message && (
                <div className="rounded-lg border p-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                  <h3 className="text-sm font-medium mb-2" style={{ color: "var(--gf-text-secondary)" }}>Message</h3>
                  <p className="text-sm" style={{ color: "var(--gf-text-primary)" }}>{data.message}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : router.push(`/documents/${docId}`)}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}
          >
            <ArrowLeft className="w-4 h-4" /> {step === 0 ? "Cancel" : "Back"}
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-40"
              style={{ backgroundColor: "var(--gf-accent)" }}
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={handleSend}
                disabled={sending}
                className="inline-flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: "var(--gf-accent)" }}
              >
                <Send className="w-4 h-4" /> {sending ? "Sending..." : "Send Signature Request"}
              </button>
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
