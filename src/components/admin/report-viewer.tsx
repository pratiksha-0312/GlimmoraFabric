"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Printer,
  Share2,
  CheckCircle,
  XCircle,
  Shield,
  FileText,
  Clock,
  User,
  Calendar,
  AlertTriangle,
} from "lucide-react";

// ============================================================================
// SAMPLE DATA
// ============================================================================

interface ReportData {
  id: string;
  name: string;
  type: string;
  framework: string;
  period: string;
  date: string;
  score: number;
  findings: number;
  size: string;
  generatedBy: string;
  sections: { name: string; score: number; status: "pass" | "fail" | "warning"; details: string }[];
  summary: string;
}

const REPORTS: Record<string, ReportData> = {
  "cr-001": {
    id: "cr-001", name: "SOC2 Type II - Q1 2026", type: "SOC2", framework: "SOC2 Type II", period: "Jan–Mar 2026", date: "2026-03-28", score: 98, findings: 0, size: "2.4 MB", generatedBy: "Vanshika Keswani",
    sections: [
      { name: "Access Control", score: 100, status: "pass", details: "All access controls properly implemented. MFA enforced for admin accounts. Role-based access correctly configured across all tenants." },
      { name: "Data Encryption", score: 100, status: "pass", details: "AES-256 encryption at rest, TLS 1.3 in transit. All database connections encrypted. Key rotation on 90-day schedule." },
      { name: "Audit Logging", score: 100, status: "pass", details: "Comprehensive audit trail for all administrative actions. Logs retained for 365 days. Tamper-proof storage implemented." },
      { name: "Incident Response", score: 95, status: "pass", details: "Incident response plan documented and tested. Average response time: 12 minutes. All incidents resolved within SLA." },
      { name: "Change Management", score: 98, status: "pass", details: "All changes tracked via version control. Approval workflow for production deployments. Rollback procedures tested quarterly." },
      { name: "Backup & Recovery", score: 96, status: "pass", details: "Daily backups with 30-day retention. RPO: 1 hour, RTO: 4 hours. Disaster recovery tested monthly." },
      { name: "Network Security", score: 100, status: "pass", details: "WAF and DDoS protection active. Network segmentation between tenants. Regular penetration testing performed." },
      { name: "Vendor Management", score: 95, status: "pass", details: "All vendors assessed annually. SLA compliance tracked. No critical vendor incidents in reporting period." },
    ],
    summary: "The SOC2 Type II audit for Q1 2026 demonstrates strong compliance across all trust service criteria. No critical findings were identified. The organization maintains robust security controls with a comprehensive audit trail."
  },
  "cr-002": {
    id: "cr-002", name: "GDPR Data Processing Assessment", type: "GDPR", framework: "GDPR Article 30", period: "Q1 2026", date: "2026-03-25", score: 94, findings: 2, size: "1.8 MB", generatedBy: "Pratiksha M.",
    sections: [
      { name: "Lawful Basis for Processing", score: 100, status: "pass", details: "All data processing activities have documented lawful basis. Consent management system properly configured." },
      { name: "Data Subject Rights", score: 90, status: "warning", details: "Right to access and deletion implemented. Finding: Response time for erasure requests averages 28 days (target: 30 days). Needs monitoring." },
      { name: "Data Protection Impact Assessment", score: 95, status: "pass", details: "DPIAs completed for all high-risk processing activities. Regular reviews scheduled." },
      { name: "Cross-Border Transfers", score: 88, status: "warning", details: "Finding: Two data transfers to non-adequate countries require updated Standard Contractual Clauses (SCCs)." },
      { name: "Data Breach Notification", score: 100, status: "pass", details: "72-hour notification process documented and tested. No breaches in reporting period." },
      { name: "Records of Processing", score: 95, status: "pass", details: "Article 30 records maintained and up-to-date for all processing activities." },
    ],
    summary: "The GDPR assessment for Q1 2026 shows overall compliance with 2 minor findings requiring attention. Cross-border transfer documentation and erasure response monitoring need improvement."
  },
};

// Fallback for IDs not in the map
const DEFAULT_REPORT: ReportData = {
  id: "default", name: "Compliance Report", type: "Custom", framework: "Custom Framework", period: "Current Period", date: new Date().toISOString().slice(0, 10), score: 95, findings: 1, size: "2.0 MB", generatedBy: "System",
  sections: [
    { name: "Access Control", score: 98, status: "pass", details: "Access controls properly implemented and reviewed." },
    { name: "Data Protection", score: 95, status: "pass", details: "Data protection measures meet compliance requirements." },
    { name: "Audit Trail", score: 100, status: "pass", details: "Comprehensive audit logging in place." },
    { name: "Incident Response", score: 88, status: "warning", details: "Minor improvements needed in response time documentation." },
    { name: "Risk Management", score: 92, status: "pass", details: "Risk assessment framework reviewed and updated." },
  ],
  summary: "This compliance report shows overall adherence to the selected framework with minor areas for improvement."
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ReportViewer({ reportId }: { reportId: string }) {
  const [report, setReport] = useState<ReportData>(
    REPORTS[reportId] ?? { ...DEFAULT_REPORT, id: reportId, name: `Report ${reportId}` },
  );
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/compliance/reports/${reportId}`)
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((data: ReportData) => {
        if (cancelled) return;
        // API may return sections=[]; fall back to DEFAULT_REPORT sections so the UI isn't empty
        const sections = Array.isArray(data.sections) && data.sections.length > 0 ? data.sections : DEFAULT_REPORT.sections;
        setReport({ ...data, sections });
      })
      .catch(() => { /* keep fallback */ });
    return () => { cancelled = true; };
  }, [reportId]);

  const scoreColor = report.score >= 95 ? "#22c55e" : report.score >= 80 ? "#f59e0b" : "#ef4444";

  const handlePrint = () => window.print();

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = `/api/compliance/reports/${report.id}/pdf`;
    a.download = `${report.name.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/compliance/reports" className="flex items-center justify-center rounded-lg border h-9 w-9 hover:opacity-70" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{report.name}</h1>
            <p className="mt-0.5 text-sm" style={{ color: "var(--gf-text-secondary)" }}>{report.framework} &middot; {report.period}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrint} className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}><Printer className="h-4 w-4" />Print</button>
          <button onClick={handleDownload} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--gf-accent)" }}><Download className="h-4 w-4" />Download</button>
        </div>
      </div>

      {/* Report Meta */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: <Calendar className="h-4 w-4" />, label: "Date", value: report.date },
          { icon: <User className="h-4 w-4" />, label: "Generated By", value: report.generatedBy },
          { icon: <FileText className="h-4 w-4" />, label: "Size", value: report.size },
          { icon: <AlertTriangle className="h-4 w-4" />, label: "Findings", value: report.findings.toString() },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border p-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            <div className="flex items-center gap-1.5 mb-1" style={{ color: "var(--gf-text-muted)" }}>
              {m.icon}<span className="text-xs font-medium">{m.label}</span>
            </div>
            <p className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Score + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border p-6 flex flex-col items-center justify-center" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <p className="text-5xl font-extrabold" style={{ color: scoreColor }}>{report.score}%</p>
          <p className="text-sm mt-2" style={{ color: "var(--gf-text-secondary)" }}>Compliance Score</p>
          <div className="w-full mt-4 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${report.score}%`, backgroundColor: scoreColor }} />
          </div>
        </div>
        <div className="lg:col-span-2 rounded-xl border p-6" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>Executive Summary</h3>
          <p className="text-sm leading-relaxed" style={{ color: "var(--gf-text-secondary)" }}>{report.summary}</p>
        </div>
      </div>

      {/* Sections - PDF-like viewer */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        <div className="border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: "var(--gf-border)" }}>
          <h3 className="text-base font-bold" style={{ color: "var(--gf-text-primary)" }}>Detailed Findings</h3>
          <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{report.sections.length} sections</span>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Section navigation */}
          <div className="lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r overflow-x-auto lg:overflow-y-auto lg:max-h-[500px]" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
            <div className="flex lg:flex-col p-2 gap-1">
              {report.sections.map((s, i) => {
                const isActive = activeSection === i;
                const statusColor = s.status === "pass" ? "#22c55e" : s.status === "warning" ? "#f59e0b" : "#ef4444";
                return (
                  <button key={s.name} onClick={() => setActiveSection(i)} className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm whitespace-nowrap lg:whitespace-normal transition-colors ${isActive ? "font-medium" : ""}`} style={{ backgroundColor: isActive ? "var(--gf-bg-surface)" : "transparent", color: isActive ? "var(--gf-text-primary)" : "var(--gf-text-secondary)" }}>
                    <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: statusColor }} />
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section content */}
          <div className="flex-1 p-6">
            {report.sections[activeSection] && (() => {
              const s = report.sections[activeSection];
              const statusColor = s.status === "pass" ? "#22c55e" : s.status === "warning" ? "#f59e0b" : "#ef4444";
              const StatusIcon = s.status === "pass" ? CheckCircle : s.status === "warning" ? AlertTriangle : XCircle;
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <StatusIcon className="h-5 w-5" style={{ color: statusColor }} />
                      <h4 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>{s.name}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full capitalize" style={{ backgroundColor: `${statusColor}20`, color: statusColor }}>{s.status}</span>
                      <span className="text-sm font-bold" style={{ color: statusColor }}>{s.score}%</span>
                    </div>
                  </div>

                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                    <div className="h-full rounded-full" style={{ width: `${s.score}%`, backgroundColor: statusColor }} />
                  </div>

                  <div className="rounded-lg border p-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--gf-text-secondary)" }}>{s.details}</p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
