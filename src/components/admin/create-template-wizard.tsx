"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Code,
  Eye,
  ChevronRight,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import type { UserRole } from "@/lib/roles";

// ============================================================================
// TYPES
// ============================================================================

interface WizardData {
  name: string;
  description: string;
  type: string;
  format: string;
  content: string;
}

const TEMPLATE_TYPES = [
  { value: "invoice", label: "Invoice", desc: "Billing and payment documents" },
  { value: "legal", label: "Legal", desc: "Contracts, NDAs, agreements" },
  { value: "certificate", label: "Certificate", desc: "Completion and award certificates" },
  { value: "contract", label: "Contract", desc: "Service and employment contracts" },
  { value: "receipt", label: "Receipt", desc: "Payment receipts and confirmations" },
  { value: "report", label: "Report", desc: "Business and analytics reports" },
  { value: "letter", label: "Letter", desc: "Formal letters and correspondence" },
];

const STARTER_TEMPLATES: Record<string, string> = {
  invoice: `<h1>Invoice #{{invoice_id}}</h1>\n<p>Date: {{date}}</p>\n<p>Bill To: {{client_name}}</p>\n<p>From: {{company_name}}</p>\n\n<table>\n  <tr><th>Description</th><th>Amount</th></tr>\n  {{#items}}\n  <tr><td>{{description}}</td><td>{{amount}}</td></tr>\n  {{/items}}\n</table>\n\n<p><strong>Total: {{total}}</strong></p>`,
  legal: `<h1>{{document_title}}</h1>\n<p>This agreement is entered into on {{effective_date}} by and between:</p>\n<p><strong>Party A:</strong> {{party_a}}</p>\n<p><strong>Party B:</strong> {{party_b}}</p>\n\n<h2>Terms and Conditions</h2>\n<p>{{terms}}</p>\n\n<h2>Signatures</h2>\n<p>____________________<br/>{{party_a}}</p>\n<p>____________________<br/>{{party_b}}</p>`,
  certificate: `<div style="text-align:center; padding: 40px;">\n  <h1>Certificate of {{certificate_type}}</h1>\n  <p>This is to certify that</p>\n  <h2>{{recipient_name}}</h2>\n  <p>{{certificate_body}}</p>\n  <p>Date: {{date}}</p>\n  <p>____________________<br/>{{issuer}}</p>\n</div>`,
  contract: `<h1>Service Contract</h1>\n<p>Between {{provider}} ("Provider") and {{client}} ("Client")</p>\n\n<h2>1. Scope of Services</h2>\n<p>{{scope}}</p>\n\n<h2>2. Duration</h2>\n<p>From {{start_date}} to {{end_date}}</p>\n\n<h2>3. Compensation</h2>\n<p>{{compensation_details}}</p>`,
  receipt: `<h1>Payment Receipt</h1>\n<p>Receipt #: {{receipt_id}}</p>\n<p>Date: {{date}}</p>\n<p>Received from: {{payer_name}}</p>\n<p>Amount: {{amount}}</p>\n<p>Payment Method: {{payment_method}}</p>\n<p>Description: {{description}}</p>`,
  report: `<h1>{{report_title}}</h1>\n<p>Period: {{period}}</p>\n<p>Prepared by: {{author}}</p>\n\n<h2>Executive Summary</h2>\n<p>{{summary}}</p>\n\n<h2>Key Metrics</h2>\n<p>{{metrics}}</p>\n\n<h2>Recommendations</h2>\n<p>{{recommendations}}</p>`,
  letter: `<p>{{date}}</p>\n<p>{{recipient_name}}<br/>{{recipient_address}}</p>\n\n<p>Dear {{recipient_name}},</p>\n\n<p>{{letter_body}}</p>\n\n<p>Sincerely,<br/>{{sender_name}}<br/>{{sender_title}}</p>`,
};

const STEPS = ["Basic Info", "Template Type", "Content", "Review"];

// ============================================================================
// COMPONENT
// ============================================================================

export function CreateTemplateWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>({
    name: "",
    description: "",
    type: "",
    format: "html",
    content: "",
  });

  const canNext = () => {
    if (step === 0) return data.name.trim().length > 0;
    if (step === 1) return data.type.length > 0;
    if (step === 2) return data.content.trim().length > 0;
    return true;
  };

  const handleTypeSelect = (type: string) => {
    setData(prev => ({
      ...prev,
      type,
      content: prev.content || STARTER_TEMPLATES[type] || "",
    }));
  };

  const handleCreate = () => {
    router.push("/admin/doc-templates");
  };

  return (
    <AuthGuard allowedRoles={["super_admin"] as UserRole[]}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/admin/doc-templates")} className="rounded-lg border p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: "var(--gf-border)" }}>
            <ArrowLeft className="w-4 h-4" style={{ color: "var(--gf-text-secondary)" }} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Create Template</h1>
            <p className="text-sm" style={{ color: "var(--gf-text-muted)" }}>Step {step + 1} of {STEPS.length}</p>
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
          {/* Step 0: Basic Info */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold" style={{ color: "var(--gf-text-primary)" }}>Basic Information</h2>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--gf-text-secondary)" }}>Template Name *</label>
                <input
                  value={data.name}
                  onChange={e => setData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Monthly Invoice Template"
                  className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none"
                  style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--gf-text-secondary)" }}>Description</label>
                <textarea
                  value={data.description}
                  onChange={e => setData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of what this template is used for..."
                  rows={3}
                  className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none resize-y"
                  style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
                />
              </div>
            </div>
          )}

          {/* Step 1: Template Type */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold" style={{ color: "var(--gf-text-primary)" }}>Select Template Type</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TEMPLATE_TYPES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => handleTypeSelect(t.value)}
                    className="flex items-start gap-3 rounded-xl border p-4 text-left transition-all"
                    style={data.type === t.value
                      ? { borderColor: "var(--gf-accent)", backgroundColor: "var(--gf-accent-bg)" }
                      : { borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}
                  >
                    <FileText className="w-5 h-5 mt-0.5 shrink-0" style={{ color: data.type === t.value ? "var(--gf-accent)" : "var(--gf-text-muted)" }} />
                    <div>
                      <span className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{t.label}</span>
                      <p className="text-xs mt-0.5" style={{ color: "var(--gf-text-muted)" }}>{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Content */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold" style={{ color: "var(--gf-text-primary)" }}>Template Content</h2>
                <div className="flex items-center gap-1 text-xs">
                  <Code className="w-3.5 h-3.5" style={{ color: "var(--gf-text-muted)" }} />
                  <span style={{ color: "var(--gf-text-muted)" }}>HTML + Mustache</span>
                </div>
              </div>
              <textarea
                value={data.content}
                onChange={e => setData(prev => ({ ...prev, content: e.target.value }))}
                spellCheck={false}
                className="w-full min-h-[400px] rounded-lg border p-4 font-mono text-sm outline-none resize-y"
                style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
              />
              <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Use {"{{variable}}"} for dynamic content. A starter template has been pre-filled based on your type selection.</p>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold" style={{ color: "var(--gf-text-primary)" }}>Review & Create</h2>
              <div className="space-y-3">
                <div className="rounded-lg border p-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between"><dt style={{ color: "var(--gf-text-muted)" }}>Name</dt><dd className="font-medium" style={{ color: "var(--gf-text-primary)" }}>{data.name}</dd></div>
                    <div className="flex justify-between"><dt style={{ color: "var(--gf-text-muted)" }}>Type</dt><dd className="font-medium capitalize" style={{ color: "var(--gf-text-primary)" }}>{data.type}</dd></div>
                    <div className="flex justify-between"><dt style={{ color: "var(--gf-text-muted)" }}>Format</dt><dd className="font-medium uppercase" style={{ color: "var(--gf-text-primary)" }}>{data.format}</dd></div>
                    {data.description && <div><dt style={{ color: "var(--gf-text-muted)" }}>Description</dt><dd className="mt-1" style={{ color: "var(--gf-text-primary)" }}>{data.description}</dd></div>}
                  </dl>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5" style={{ color: "var(--gf-text-secondary)" }}><Eye className="w-3.5 h-3.5" /> Content Preview</h3>
                  <div className="rounded-lg border p-6 prose prose-sm max-w-none" style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
                    <div dangerouslySetInnerHTML={{ __html: data.content }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : router.push("/admin/doc-templates")}
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
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: "var(--gf-accent)" }}
            >
              <Check className="w-4 h-4" /> Create Template
            </button>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
