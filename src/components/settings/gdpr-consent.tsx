"use client";

import { useState } from "react";
import {
  Shield,
  Save,
  CheckCircle,
  Info,
  FileText,
  AlertTriangle,
  ExternalLink,
  Clock,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface ConsentItem {
  id: string;
  title: string;
  description: string;
  required: boolean;
  enabled: boolean;
  lastUpdated: string;
  legalBasis: string;
}

const INITIAL_CONSENTS: ConsentItem[] = [
  { id: "essential", title: "Essential Services", description: "Required for core platform functionality — authentication, session management, and security features.", required: true, enabled: true, lastUpdated: "2026-01-15", legalBasis: "Legitimate Interest" },
  { id: "analytics", title: "Usage Analytics", description: "Helps us improve the platform by collecting anonymized usage patterns, page views, and feature adoption metrics.", required: false, enabled: true, lastUpdated: "2026-03-20", legalBasis: "Consent" },
  { id: "marketing", title: "Marketing Communications", description: "Product updates, feature announcements, newsletters, and promotional content delivered via email.", required: false, enabled: false, lastUpdated: "2026-03-20", legalBasis: "Consent" },
  { id: "thirdparty", title: "Third-Party Integrations", description: "Sharing data with integrated services (Stripe, Twilio, AWS) for payment processing, notifications, and cloud services.", required: false, enabled: true, lastUpdated: "2026-02-10", legalBasis: "Contractual Obligation" },
  { id: "profiling", title: "Personalization & Profiling", description: "Using your usage data to personalize dashboard layout, recommend features, and optimize your experience.", required: false, enabled: false, lastUpdated: "2026-03-20", legalBasis: "Consent" },
  { id: "logging", title: "Audit & Compliance Logging", description: "Recording administrative actions, access events, and configuration changes for compliance purposes.", required: true, enabled: true, lastUpdated: "2026-01-15", legalBasis: "Legal Obligation" },
];

// ============================================================================
// TOGGLE
// ============================================================================

function Toggle({ enabled, onChange, disabled }: { enabled: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button onClick={onChange} disabled={disabled} className={`relative shrink-0 ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
      <div className={`h-5 w-9 rounded-full transition-colors ${enabled ? "bg-green-500" : "bg-gray-600"}`}>
        <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${enabled ? "translate-x-4" : "translate-x-0.5"}`} />
      </div>
    </button>
  );
}

// ============================================================================
// MAIN
// ============================================================================

export function GdprConsentPage() {
  const [consents, setConsents] = useState(INITIAL_CONSENTS);
  const [saved, setSaved] = useState(false);

  const toggleConsent = (id: string) => {
    setConsents((prev) => prev.map((c) => c.id === id && !c.required ? { ...c, enabled: !c.enabled, lastUpdated: new Date().toISOString().slice(0, 10) } : c));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Privacy & Consent</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>Manage your GDPR consent preferences and data privacy settings</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: saved ? "#22c55e" : "var(--gf-accent)" }}>
          {saved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? "Saved!" : "Save Preferences"}
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border p-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        <Info className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "var(--gf-accent)" }} />
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>Your Privacy Rights</p>
          <p className="text-xs mt-1" style={{ color: "var(--gf-text-secondary)" }}>
            Under GDPR, you have the right to access, rectify, delete, and port your personal data. You may withdraw consent at any time without affecting the lawfulness of prior processing. Required consents cannot be disabled as they are necessary for service operation.
          </p>
        </div>
      </div>

      {/* Consent toggles */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        <div className="border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
          <h3 className="text-base font-bold" style={{ color: "var(--gf-text-primary)" }}>Data Processing Consents</h3>
        </div>

        <div className="divide-y" style={{ borderColor: "var(--gf-border)" }}>
          {consents.map((consent) => (
            <div key={consent.id} className="px-6 py-5" style={{ borderColor: "var(--gf-border)" }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>{consent.title}</p>
                    {consent.required && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>Required</span>
                    )}
                  </div>
                  <p className="text-xs mb-3" style={{ color: "var(--gf-text-secondary)" }}>{consent.description}</p>
                  <div className="flex items-center gap-4 text-xs" style={{ color: "var(--gf-text-muted)" }}>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span>Legal basis: {consent.legalBasis}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Updated: {consent.lastUpdated}</span>
                    </div>
                  </div>
                </div>
                <Toggle enabled={consent.enabled} onChange={() => toggleConsent(consent.id)} disabled={consent.required} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data rights */}
      <div className="rounded-xl border p-6" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        <h3 className="text-base font-bold mb-4" style={{ color: "var(--gf-text-primary)" }}>Your Data Rights</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { title: "Right to Access", description: "Request a copy of all personal data we hold about you" },
            { title: "Right to Rectification", description: "Correct any inaccurate personal data" },
            { title: "Right to Erasure", description: "Request deletion of your personal data" },
            { title: "Right to Data Portability", description: "Receive your data in a machine-readable format" },
          ].map((right) => (
            <div key={right.title} className="rounded-lg border p-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
              <p className="text-sm font-medium mb-1" style={{ color: "var(--gf-text-primary)" }}>{right.title}</p>
              <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{right.description}</p>
            </div>
          ))}
        </div>
        <p className="text-xs mt-4" style={{ color: "var(--gf-text-muted)" }}>
          To exercise any of these rights, contact <a href="mailto:privacy@glimmora.com" className="font-medium underline" style={{ color: "var(--gf-accent)" }}>privacy@glimmora.com</a>
        </p>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 rounded-xl border p-4" style={{ borderColor: "rgba(239,68,68,0.3)", backgroundColor: "rgba(239,68,68,0.05)" }}>
        <AlertTriangle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-500">Withdrawal of Consent</p>
          <p className="text-xs mt-1" style={{ color: "var(--gf-text-secondary)" }}>
            Disabling non-essential consents may limit certain platform features. Essential services consent cannot be withdrawn while you maintain an active account.
          </p>
        </div>
      </div>
    </div>
  );
}
