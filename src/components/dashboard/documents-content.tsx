"use client";

import {
  FileText,
  FilePlus,
  FileCheck,
  PenTool,
  Download,
  Clock,
  Shield,
  Settings,
  AlertCircle,
  History,
} from "lucide-react";

const stats = [
  { label: "Total Templates", value: "24", icon: FileText },
  { label: "Generated Today", value: "47", icon: FilePlus },
  { label: "Pending E-Sign", value: "8", icon: PenTool },
  { label: "Completed", value: "1,284", icon: FileCheck },
];

type DocStatus = "Generated" | "Pending Sign" | "Signed" | "Expired";

const recentDocuments: {
  name: string;
  template: string;
  tenant: string;
  status: DocStatus;
  time: string;
}[] = [
  { name: "Invoice #INV-2024-0847", template: "Invoice Template v3", tenant: "Acme Corp", status: "Generated", time: "5 min ago" },
  { name: "NDA - Project Falcon", template: "NDA Template v2", tenant: "TechVault", status: "Pending Sign", time: "12 min ago" },
  { name: "Certificate - ISO 27001", template: "Certificate Template", tenant: "DataShield", status: "Signed", time: "1 hr ago" },
  { name: "Contract - Enterprise Plan", template: "Contract Template v4", tenant: "GlobalFinance", status: "Pending Sign", time: "2 hr ago" },
  { name: "Receipt #RCP-9921", template: "Receipt Template", tenant: "CloudBase", status: "Generated", time: "3 hr ago" },
];

const statusColors: Record<DocStatus, string> = {
  Generated: "#3b82f6",
  "Pending Sign": "#f59e0b",
  Signed: "#22c55e",
  Expired: "#ef4444",
};

const esignProviders = [
  { name: "DocuSign", status: "Connected" as const, pendingSignatures: 5, lastSync: "2 min ago" },
  { name: "Adobe Sign", status: "Disconnected" as const, pendingSignatures: 0, lastSync: "N/A" },
  { name: "HelloSign", status: "Connected" as const, pendingSignatures: 3, lastSync: "10 min ago" },
];

const esignStatusColors: Record<string, string> = {
  Connected: "#22c55e",
  Disconnected: "#ef4444",
};

const versionHistory: {
  templateName: string;
  version: string;
  changedBy: string;
  changeDescription: string;
  date: string;
}[] = [
  { templateName: "Invoice Template", version: "v3.2", changedBy: "Alice Martin", changeDescription: "Updated tax calculation fields", date: "2026-03-29" },
  { templateName: "NDA Template", version: "v2.1", changedBy: "Bob Chen", changeDescription: "Added mutual NDA clause", date: "2026-03-28" },
  { templateName: "Contract Template", version: "v4.0", changedBy: "Carol Rivera", changeDescription: "Major revision: new payment terms section", date: "2026-03-27" },
  { templateName: "Certificate Template", version: "v1.4", changedBy: "Dave Okoye", changeDescription: "Fixed certificate border styling", date: "2026-03-25" },
  { templateName: "Receipt Template", version: "v2.0", changedBy: "Alice Martin", changeDescription: "Added multi-currency support", date: "2026-03-24" },
];

const templates = [
  { name: "Invoice Template", version: "v3.2", uses: 482, format: "PDF" },
  { name: "NDA Template", version: "v2.1", uses: 156, format: "PDF / DOCX" },
  { name: "Certificate Template", version: "v1.4", uses: 234, format: "PDF" },
  { name: "Contract Template", version: "v4.0", uses: 98, format: "PDF / DOCX" },
  { name: "Receipt Template", version: "v2.0", uses: 712, format: "PDF / HTML" },
];

export function DocumentsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>
          Documents &amp; Templates
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>
          PDF generation, contract templates, e-signatures, and batch document processing
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

      {/* Templates Library */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
          Template Library
        </h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((tpl) => (
            <div
              key={tpl.name}
              className="rounded-xl p-5"
              style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
            >
              <div className="flex items-start justify-between">
                <FileText className="h-6 w-6" style={{ color: "var(--gf-accent)" }} />
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" }}
                >
                  {tpl.version}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>
                {tpl.name}
              </h3>
              <div className="mt-2 flex gap-4 text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                <span>{tpl.uses} uses</span>
                <span>{tpl.format}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Documents */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
          Recent Documents
        </h2>
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["Document", "Template", "Tenant", "Status", "Time"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 font-medium"
                    style={{ color: "var(--gf-text-secondary)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentDocuments.map((doc, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid var(--gf-border)" }}>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--gf-text-primary)" }}>
                    {doc.name}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>
                    {doc.template}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>
                    {doc.tenant}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${statusColors[doc.status]}20`,
                        color: statusColors[doc.status],
                      }}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                    {doc.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* E-Sign Setup */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
          E-Sign Setup
        </h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {esignProviders.map((provider) => (
            <div
              key={provider.name}
              className="rounded-xl p-5"
              style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
            >
              <div className="flex items-start justify-between">
                <Shield className="h-6 w-6" style={{ color: "var(--gf-accent)" }} />
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${esignStatusColors[provider.status]}20`,
                    color: esignStatusColors[provider.status],
                  }}
                >
                  {provider.status}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>
                {provider.name}
              </h3>
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                  <Settings className="h-3.5 w-3.5" />
                  <span>Last synced: {provider.lastSync}</span>
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Pending signatures: {provider.pendingSignatures}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Version History */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
          Version History
        </h2>
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["Template Name", "Version", "Changed By", "Change Description", "Date"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 font-medium"
                    style={{ color: "var(--gf-text-secondary)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {versionHistory.map((entry, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid var(--gf-border)" }}>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--gf-text-primary)" }}>
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4" style={{ color: "var(--gf-accent)" }} />
                      {entry.templateName}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" }}
                    >
                      {entry.version}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>
                    {entry.changedBy}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>
                    {entry.changeDescription}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                    {entry.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
