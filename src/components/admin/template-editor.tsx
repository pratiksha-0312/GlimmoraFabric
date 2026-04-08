"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Mail,
  MessageSquare,
  Bell,
  Smartphone,
  Code2,
  Monitor,
  Tablet,
  Variable,
  Copy,
  CheckCircle2,
  Clock,
  Settings2,
  TestTube,
  Send,
} from "lucide-react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

// ============================================================================
// TYPES
// ============================================================================

interface TemplateData {
  id: string;
  name: string;
  subject: string;
  channel: "email" | "sms" | "push" | "in-app";
  category: string;
  status: "active" | "draft" | "archived";
  bodyHtml: string;
  bodyText: string;
  version: number;
  variables: string[];
  lastEdited: string;
  editedBy: string;
}

// ============================================================================
// SAMPLE TEMPLATES (keyed by id)
// ============================================================================

const TEMPLATES: Record<string, TemplateData> = {
  "tpl-001": { id: "tpl-001", name: "Welcome Email", subject: "Welcome to {{tenant_name}}!", channel: "email", category: "onboarding", status: "active", bodyHtml: "<h1>Welcome aboard, {{user_name}}!</h1><p>We're excited to have you on <strong>{{tenant_name}}</strong>. Your account is all set and ready to go.</p><h2>Getting Started</h2><ul><li>Complete your <a href='{{profile_url}}'>profile setup</a></li><li>Explore the <a href='{{dashboard_url}}'>dashboard</a></li><li>Invite your <a href='{{team_url}}'>team members</a></li></ul><p>If you need any help, our support team is just a click away.</p><p>Cheers,<br/>The {{tenant_name}} Team</p>", bodyText: "Welcome aboard, {{user_name}}! We're excited to have you on {{tenant_name}}.", version: 3, variables: ["user_name", "tenant_name", "profile_url", "dashboard_url", "team_url"], lastEdited: "2026-04-07 14:30", editedBy: "Vanshika Keswani" },
  "tpl-002": { id: "tpl-002", name: "Password Reset", subject: "Reset your password", channel: "email", category: "security", status: "active", bodyHtml: "<h2>Password Reset Request</h2><p>Hi {{user_name}},</p><p>We received a request to reset your password. Click the button below to set a new password:</p><p><a href='{{reset_url}}' style='display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;'>Reset Password</a></p><p>This link expires in <strong>{{expiry_minutes}} minutes</strong>.</p><p>If you didn't request this, you can safely ignore this email.</p>", bodyText: "Hi {{user_name}}, reset your password at {{reset_url}}. This link expires in {{expiry_minutes}} minutes.", version: 5, variables: ["user_name", "reset_url", "expiry_minutes"], lastEdited: "2026-04-06 10:15", editedBy: "Vanshika Keswani" },
  "tpl-003": { id: "tpl-003", name: "Invoice Generated", subject: "Your invoice #{{invoice_id}} is ready", channel: "email", category: "billing", status: "active", bodyHtml: "<h2>Invoice Ready</h2><p>Hi {{user_name}},</p><p>Your invoice <strong>#{{invoice_id}}</strong> for <strong>{{amount}}</strong> has been generated.</p><table style='width:100%;border-collapse:collapse;margin:16px 0;'><tr style='border-bottom:1px solid #e5e7eb;'><td style='padding:8px;font-weight:600;'>Plan</td><td style='padding:8px;'>{{plan_name}}</td></tr><tr style='border-bottom:1px solid #e5e7eb;'><td style='padding:8px;font-weight:600;'>Period</td><td style='padding:8px;'>{{billing_period}}</td></tr><tr><td style='padding:8px;font-weight:600;'>Amount</td><td style='padding:8px;font-weight:700;color:#059669;'>{{amount}}</td></tr></table><p><a href='{{invoice_url}}'>View Invoice</a></p>", bodyText: "Hi {{user_name}}, your invoice #{{invoice_id}} for {{amount}} is ready. View at {{invoice_url}}", version: 2, variables: ["user_name", "invoice_id", "amount", "plan_name", "billing_period", "invoice_url"], lastEdited: "2026-04-05 16:45", editedBy: "Pratiksha M." },
  "tpl-004": { id: "tpl-004", name: "Two-Factor Code", subject: "Your verification code: {{code}}", channel: "sms", category: "security", status: "active", bodyHtml: "", bodyText: "Your {{tenant_name}} verification code is {{code}}. It expires in {{expiry_minutes}} minutes. Do not share this code.", version: 1, variables: ["tenant_name", "code", "expiry_minutes"], lastEdited: "2026-04-04 09:00", editedBy: "Vanshika Keswani" },
  "tpl-005": { id: "tpl-005", name: "New Login Alert", subject: "New sign-in detected", channel: "push", category: "security", status: "active", bodyHtml: "", bodyText: "New sign-in to your account from {{device}} in {{location}}. If this wasn't you, secure your account immediately.", version: 2, variables: ["device", "location"], lastEdited: "2026-04-03 11:20", editedBy: "Pratiksha M." },
  "tpl-006": { id: "tpl-006", name: "Task Assigned", subject: "You have a new task: {{task_name}}", channel: "in-app", category: "team", status: "active", bodyHtml: "", bodyText: "{{assigner}} assigned you the task \"{{task_name}}\" with {{priority}} priority. Due: {{due_date}}.", version: 4, variables: ["assigner", "task_name", "priority", "due_date"], lastEdited: "2026-04-02 15:30", editedBy: "Vanshika Keswani" },
  "new": { id: "new", name: "", subject: "", channel: "email", category: "system", status: "draft", bodyHtml: "<p>Start writing your template here...</p>", bodyText: "", version: 1, variables: [], lastEdited: new Date().toISOString().slice(0, 16).replace("T", " "), editedBy: "You" },
};

const CHANNEL_ICONS: Record<string, typeof Mail> = { email: Mail, sms: Smartphone, push: Bell, "in-app": MessageSquare };
const AVAILABLE_VARIABLES = ["user_name", "tenant_name", "email", "profile_url", "dashboard_url", "team_url", "reset_url", "expiry_minutes", "invoice_id", "amount", "plan_name", "billing_period", "invoice_url", "code", "device", "location", "assigner", "task_name", "priority", "due_date", "date", "time"];

// ============================================================================
// PREVIEW PANEL COMPONENT
// ============================================================================

function TemplatePreviewPanel({ template, previewDevice }: { template: TemplateData; previewDevice: "desktop" | "mobile" | "tablet" }) {
  const widths = { desktop: "100%", tablet: "768px", mobile: "375px" };
  const sampleVars: Record<string, string> = {
    user_name: "John Doe", tenant_name: "Acme Corp", email: "john@acme.com",
    profile_url: "#", dashboard_url: "#", team_url: "#", reset_url: "#",
    expiry_minutes: "15", invoice_id: "INV-2026-0042", amount: "$149.00",
    plan_name: "Business Pro", billing_period: "Apr 1 – Apr 30, 2026",
    invoice_url: "#", code: "483920", device: "Chrome on Windows 11",
    location: "Mumbai, India", assigner: "Vanshika K.", task_name: "Review PR #142",
    priority: "high", due_date: "Apr 10, 2026", date: "Apr 8, 2026", time: "2:00 PM IST",
  };

  const renderContent = (text: string) => {
    let result = text;
    Object.entries(sampleVars).forEach(([k, v]) => { result = result.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), v); });
    return result;
  };

  const isRich = template.channel === "email" && template.bodyHtml;

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: "var(--gf-border)" }}>
        <span className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>Preview</span>
        <div className="flex items-center gap-1 text-xs" style={{ color: "var(--gf-text-muted)" }}>
          <span className="capitalize">{previewDevice}</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 flex justify-center" style={{ backgroundColor: "var(--gf-bg-base)" }}>
        <div style={{ width: widths[previewDevice], maxWidth: "100%" }}>
          {template.channel === "email" ? (
            <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
              {/* Email header */}
              <div className="p-4 border-b" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-elevated)" }}>
                <div className="text-xs mb-1" style={{ color: "var(--gf-text-muted)" }}>From: noreply@glimmora.com</div>
                <div className="text-xs mb-1" style={{ color: "var(--gf-text-muted)" }}>To: {sampleVars.email}</div>
                <div className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>Subject: {renderContent(template.subject)}</div>
              </div>
              {/* Email body */}
              <div className="p-6 prose prose-sm max-w-none dark:prose-invert" style={{ color: "var(--gf-text-primary)" }}>
                {isRich ? (
                  <div dangerouslySetInnerHTML={{ __html: renderContent(template.bodyHtml) }} />
                ) : (
                  <p className="whitespace-pre-wrap">{renderContent(template.bodyText)}</p>
                )}
              </div>
            </div>
          ) : template.channel === "sms" ? (
            <div className="max-w-xs mx-auto">
              <div className="rounded-2xl border p-4" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b" style={{ borderColor: "var(--gf-border)" }}>
                  <Smartphone className="w-4 h-4" style={{ color: "var(--gf-accent)" }} />
                  <span className="text-xs font-medium" style={{ color: "var(--gf-text-primary)" }}>SMS Preview</span>
                </div>
                <div className="rounded-xl p-3" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--gf-text-primary)" }}>{renderContent(template.bodyText)}</p>
                </div>
                <p className="text-xs text-right mt-2" style={{ color: "var(--gf-text-muted)" }}>Now</p>
              </div>
            </div>
          ) : template.channel === "push" ? (
            <div className="max-w-sm mx-auto">
              <div className="rounded-2xl border p-4 flex gap-3" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--gf-accent-bg)" }}>
                  <Bell className="w-5 h-5" style={{ color: "var(--gf-accent)" }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold" style={{ color: "var(--gf-text-primary)" }}>Glimmora</p>
                  <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{renderContent(template.subject)}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--gf-text-secondary)" }}>{renderContent(template.bodyText)}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--gf-text-muted)" }}>now</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-sm mx-auto">
              <div className="rounded-2xl border p-4" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4" style={{ color: "var(--gf-accent)" }} />
                  <span className="text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>In-App Notification</span>
                </div>
                <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{renderContent(template.subject)}</p>
                <p className="text-xs mt-1" style={{ color: "var(--gf-text-secondary)" }}>{renderContent(template.bodyText)}</p>
                <p className="text-xs mt-2" style={{ color: "var(--gf-text-muted)" }}>Just now</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN EDITOR COMPONENT
// ============================================================================

export function TemplateEditorPage({ templateId }: { templateId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = TEMPLATES[templateId] || TEMPLATES["new"];

  const [template, setTemplate] = useState<TemplateData>({ ...initial });
  const [showPreview, setShowPreview] = useState(searchParams.get("preview") === "true");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile" | "tablet">("desktop");
  const [viewMode, setViewMode] = useState<"visual" | "html">("visual");
  const [showVariables, setShowVariables] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [showTest, setShowTest] = useState(false);

  const update = useCallback((patch: Partial<TemplateData>) => {
    setTemplate(prev => ({ ...prev, ...patch }));
    setSaved(false);
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const insertVariable = (varName: string) => {
    const tag = `{{${varName}}}`;
    if (template.channel === "email") {
      update({ bodyHtml: template.bodyHtml + tag });
    } else {
      update({ bodyText: template.bodyText + tag });
    }
    navigator.clipboard.writeText(tag);
  };

  const isNew = templateId === "new";
  const ChIcon = CHANNEL_ICONS[template.channel];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b mb-4" style={{ borderColor: "var(--gf-border)" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/admin/notification-templates")} className="rounded-lg border p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: "var(--gf-border)" }}>
            <ArrowLeft className="w-4 h-4" style={{ color: "var(--gf-text-secondary)" }} />
          </button>
          <div>
            <h1 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>{isNew ? "Create Template" : `Edit: ${initial.name}`}</h1>
            {!isNew && <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>v{template.version} &middot; Last edited {template.lastEdited} by {template.editedBy}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPreview(!showPreview)} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}>
            {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {showPreview ? "Hide Preview" : "Preview"}
          </button>
          {template.channel === "email" && (
            <button onClick={() => setShowTest(!showTest)} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}>
              <TestTube className="w-3.5 h-3.5" /> Test Send
            </button>
          )}
          <button onClick={handleSave} className="inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-medium text-white transition-colors" style={{ backgroundColor: saved ? "#059669" : "var(--gf-accent)" }}>
            {saved ? <><CheckCircle2 className="w-3.5 h-3.5" /> Saved</> : <><Save className="w-3.5 h-3.5" /> Save</>}
          </button>
        </div>
      </div>

      {/* Test send bar */}
      {showTest && (
        <div className="flex items-center gap-3 mb-4 rounded-lg border p-3" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
          <TestTube className="w-4 h-4" style={{ color: "var(--gf-accent)" }} />
          <input value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="Enter email for test send..." className="flex-1 text-sm outline-none bg-transparent" style={{ color: "var(--gf-text-primary)" }} />
          <button onClick={() => { setShowTest(false); setTestEmail(""); }} className="inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-medium text-white" style={{ backgroundColor: "var(--gf-accent)" }}><Send className="w-3 h-3" /> Send Test</button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Editor side */}
        <div className={`flex-1 flex flex-col min-w-0 ${showPreview ? "w-1/2" : "w-full"}`}>
          {/* Metadata fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--gf-text-muted)" }}>Template Name</label>
              <input value={template.name} onChange={e => update({ name: e.target.value })} placeholder="e.g. Welcome Email" className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--gf-text-muted)" }}>Subject Line</label>
              <input value={template.subject} onChange={e => update({ subject: e.target.value })} placeholder="e.g. Welcome to {{tenant_name}}" className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--gf-text-muted)" }}>Channel</label>
              <select value={template.channel} onChange={e => update({ channel: e.target.value as TemplateData["channel"] })} className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
                {Object.keys(CHANNEL_ICONS).map(ch => <option key={ch} value={ch}>{ch.charAt(0).toUpperCase() + ch.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--gf-text-muted)" }}>Status</label>
              <select value={template.status} onChange={e => update({ status: e.target.value as TemplateData["status"] })} className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Variables bar */}
          <div className="mb-3">
            <button onClick={() => setShowVariables(!showVariables)} className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--gf-accent)" }}>
              <Variable className="w-3.5 h-3.5" /> {showVariables ? "Hide Variables" : "Insert Variable"}
            </button>
            {showVariables && (
              <div className="flex flex-wrap gap-1.5 mt-2 p-3 rounded-lg border" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
                {AVAILABLE_VARIABLES.map(v => (
                  <button key={v} onClick={() => insertVariable(v)} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}>
                    <Copy className="w-3 h-3" /> {"{{" + v + "}}"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Editor area */}
          {template.channel === "email" ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => setViewMode("visual")} className={`text-xs px-3 py-1 rounded-md transition-colors ${viewMode === "visual" ? "font-medium" : ""}`} style={viewMode === "visual" ? { backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" } : { color: "var(--gf-text-muted)" }}>
                  <span className="inline-flex items-center gap-1"><Settings2 className="w-3 h-3" /> Visual</span>
                </button>
                <button onClick={() => setViewMode("html")} className={`text-xs px-3 py-1 rounded-md transition-colors ${viewMode === "html" ? "font-medium" : ""}`} style={viewMode === "html" ? { backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" } : { color: "var(--gf-text-muted)" }}>
                  <span className="inline-flex items-center gap-1"><Code2 className="w-3 h-3" /> HTML</span>
                </button>
              </div>
              {viewMode === "visual" ? (
                <div className="flex-1 min-h-[300px]">
                  <RichTextEditor value={template.bodyHtml} onChange={v => update({ bodyHtml: v })} placeholder="Write your email template..." minHeight={300} />
                </div>
              ) : (
                <textarea value={template.bodyHtml} onChange={e => update({ bodyHtml: e.target.value })} className="flex-1 min-h-[300px] rounded-lg border p-4 text-sm font-mono outline-none resize-none" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
              )}
            </div>
          ) : (
            <div className="flex-1">
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--gf-text-muted)" }}>Message Body</label>
              <textarea value={template.bodyText} onChange={e => update({ bodyText: e.target.value })} className="w-full min-h-[300px] rounded-lg border p-4 text-sm outline-none resize-none" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} placeholder={`Write your ${template.channel} message...`} />
              <p className="text-xs mt-1" style={{ color: "var(--gf-text-muted)" }}>{template.bodyText.length} characters {template.channel === "sms" && `(${Math.ceil(template.bodyText.length / 160)} SMS segment${Math.ceil(template.bodyText.length / 160) !== 1 ? "s" : ""})`}</p>
            </div>
          )}
        </div>

        {/* Preview panel */}
        {showPreview && (
          <div className="w-1/2 rounded-xl border overflow-hidden flex flex-col" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            {/* Preview device toggle */}
            {template.channel === "email" && (
              <div className="flex items-center gap-1 p-2 border-b" style={{ borderColor: "var(--gf-border)" }}>
                {([["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]] as [typeof previewDevice, typeof Monitor][]).map(([dev, Icon]) => (
                  <button key={dev} onClick={() => setPreviewDevice(dev)} className={`rounded-md p-1.5 text-xs transition-colors ${previewDevice === dev ? "font-medium" : ""}`} style={previewDevice === dev ? { backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" } : { color: "var(--gf-text-muted)" }}>
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            )}
            <TemplatePreviewPanel template={template} previewDevice={previewDevice} />
          </div>
        )}
      </div>
    </div>
  );
}
