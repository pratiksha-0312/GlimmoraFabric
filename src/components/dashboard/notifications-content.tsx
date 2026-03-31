"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Mail,
  MessageSquare,
  Bell,
  Smartphone,
  FileText,
  RefreshCw,
  Users,
  Pencil,
  Eye,
  Trash2,
  X,
  Plus,
  Search,
  FilterX,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const stats = [
  { label: "Templates", value: "24", icon: FileText },
  { label: "Sent Today", value: "1,247", icon: Mail },
  { label: "Delivery Rate", value: "98.5%", icon: Bell },
  { label: "Failed", value: "3", icon: RefreshCw },
];

interface Template {
  name: string;
  channel: "Email" | "SMS" | "WhatsApp" | "Push";
  subject: string;
  body: string;
  status: "Active" | "Draft";
  lastModified: string;
}

const initialTemplates: Template[] = [
  {
    name: "Welcome Email",
    channel: "Email",
    subject: "Welcome to GlimmoraFabric!",
    body: "Hi {{userName}}, welcome aboard! We're excited to have you join GlimmoraFabric. Get started by exploring your dashboard.",
    status: "Active",
    lastModified: "Mar 28, 2026",
  },
  {
    name: "Order Confirmation",
    channel: "SMS",
    subject: "Your order #{{orderId}} is confirmed",
    body: "Hi {{userName}}, your order #{{orderId}} has been confirmed and is being processed. You'll receive a shipping update soon.",
    status: "Active",
    lastModified: "Mar 27, 2026",
  },
  {
    name: "Password Reset",
    channel: "Email",
    subject: "Reset your password",
    body: "Hi {{userName}}, click the link below to reset your password. This link expires in 24 hours.",
    status: "Active",
    lastModified: "Mar 25, 2026",
  },
  {
    name: "Promo Alert",
    channel: "Push",
    subject: "Flash sale — 40% off everything",
    body: "Hey {{userName}}! Don't miss our flash sale — 40% off everything for the next 24 hours!",
    status: "Draft",
    lastModified: "Mar 24, 2026",
  },
  {
    name: "Shipping Update",
    channel: "WhatsApp",
    subject: "Your package is on the way!",
    body: "Hi {{userName}}, your order #{{orderId}} has been shipped and is on its way to you! Track it here.",
    status: "Active",
    lastModified: "Mar 23, 2026",
  },
];

interface Channel {
  name: string;
  provider: string;
  status: "Active" | "Inactive";
  sent: number;
  icon: typeof Mail;
}

const channels: Channel[] = [
  { name: "Email", provider: "AWS SES", status: "Active", sent: 892, icon: Mail },
  { name: "SMS", provider: "Twilio", status: "Active", sent: 234, icon: MessageSquare },
  { name: "WhatsApp", provider: "Twilio", status: "Active", sent: 78, icon: MessageSquare },
  { name: "Push", provider: "Firebase FCM", status: "Active", sent: 43, icon: Smartphone },
];

interface DeliveryLog {
  template: string;
  channel: string;
  recipient: string;
  status: "Delivered" | "Pending" | "Failed" | "Bounced";
  time: string;
}

const deliveryLogs: DeliveryLog[] = [
  { template: "Welcome Email", channel: "Email", recipient: "user@example.com", status: "Delivered", time: "5 min ago" },
  { template: "Order Confirmation", channel: "SMS", recipient: "+1 (555) 123-4567", status: "Delivered", time: "12 min ago" },
  { template: "Password Reset", channel: "Email", recipient: "admin@example.com", status: "Pending", time: "18 min ago" },
  { template: "Promo Alert", channel: "Push", recipient: "device_token_x92", status: "Failed", time: "25 min ago" },
  { template: "Shipping Update", channel: "WhatsApp", recipient: "+91 98765 43210", status: "Bounced", time: "32 min ago" },
];

interface RetryRule {
  channel: string;
  maxRetries: number;
  interval: string;
  backoff: string;
}

const retryRules: RetryRule[] = [
  { channel: "Email", maxRetries: 3, interval: "5 min", backoff: "Exponential" },
  { channel: "SMS", maxRetries: 2, interval: "10 min", backoff: "Linear" },
  { channel: "WhatsApp", maxRetries: 2, interval: "15 min", backoff: "Linear" },
  { channel: "Push", maxRetries: 5, interval: "2 min", backoff: "Exponential" },
];

interface UserPref {
  channel: string;
  optedIn: number;
  optedOut: number;
  total: number;
}

const userPreferences: UserPref[] = [
  { channel: "Email", optedIn: 4_520, optedOut: 180, total: 4_700 },
  { channel: "SMS", optedIn: 3_100, optedOut: 600, total: 3_700 },
  { channel: "WhatsApp", optedIn: 2_840, optedOut: 460, total: 3_300 },
  { channel: "Push", optedIn: 3_900, optedOut: 310, total: 4_210 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const sampleValues: Record<string, string> = {
  "{{userName}}": "John Doe",
  "{{orderId}}": "#ORD-12345",
  "{{email}}": "john@example.com",
};

function replacePlaceholders(text: string): string {
  let result = text;
  for (const [key, val] of Object.entries(sampleValues)) {
    result = result.replaceAll(key, val);
  }
  return result;
}

function deliveryStatusColor(status: string): string {
  switch (status) {
    case "Delivered": return "#22c55e";
    case "Pending": return "#f59e0b";
    case "Failed": return "#ef4444";
    case "Bounced": return "#f97316";
    default: return "var(--gf-text-muted)";
  }
}

function templateStatusColor(status: string): { color: string; bg: string } {
  if (status === "Active") return { color: "#22c55e", bg: "rgba(34,197,94,0.12)" };
  return { color: "#f59e0b", bg: "rgba(245,158,11,0.12)" };
}

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const cardStyle: React.CSSProperties = {
  background: "var(--gf-bg-surface)",
  border: "1px solid var(--gf-border)",
  borderRadius: "0.75rem",
  padding: "1.25rem",
};

const sectionTitle: React.CSSProperties = {
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "var(--gf-text-primary)",
  marginBottom: "1rem",
};

const thStyle: React.CSSProperties = {
  textAlign: "left" as const,
  padding: "0.5rem 0.75rem",
  fontSize: "0.75rem",
  fontWeight: 500,
  color: "var(--gf-text-muted)",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
};

const tdPrimary: React.CSSProperties = {
  padding: "0.75rem",
  fontSize: "0.875rem",
  color: "var(--gf-text-primary)",
};

const tdSecondary: React.CSSProperties = {
  padding: "0.75rem",
  fontSize: "0.875rem",
  color: "var(--gf-text-secondary)",
};

// ---------------------------------------------------------------------------
// CSS keyframes (injected once)
// ---------------------------------------------------------------------------

const animationStyles = `
@keyframes gf-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes gf-slide-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes gf-slide-up { from { opacity: 0; transform: translate(-50%, -50%) translateY(1rem) scale(0.98); } to { opacity: 1; transform: translate(-50%, -50%) translateY(0) scale(1); } }
@keyframes gf-toast-in { from { opacity: 0; transform: translateX(1rem); } to { opacity: 1; transform: translateX(0); } }
`;

// ---------------------------------------------------------------------------
// Preview renderers
// ---------------------------------------------------------------------------

function EmailPreview({ template }: { template: Template }) {
  const subject = replacePlaceholders(template.subject);
  const body = replacePlaceholders(template.body);
  return (
    <div style={{ width: "100%", maxWidth: "28rem", margin: "0 auto" }}>
      <div style={{ background: "#1e2235", borderRadius: "0.75rem", overflow: "hidden", border: "1px solid #2a2d3e" }}>
        {/* Email header bar */}
        <div style={{ background: "#f97316", padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Mail style={{ width: "1rem", height: "1rem", color: "#fff" }} />
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#fff" }}>GlimmoraFabric</span>
        </div>
        {/* Email meta */}
        <div style={{ padding: "1rem", borderBottom: "1px solid #2a2d3e", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.75rem" }}>
            <span style={{ color: "#6b7280" }}>From:</span>
            <span style={{ color: "#d1d5db" }}>noreply@glimmorafabric.com</span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.75rem" }}>
            <span style={{ color: "#6b7280" }}>To:</span>
            <span style={{ color: "#d1d5db" }}>john@example.com</span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.75rem" }}>
            <span style={{ color: "#6b7280" }}>Subject:</span>
            <span style={{ color: "#fff", fontWeight: 500 }}>{subject}</span>
          </div>
        </div>
        {/* Email body */}
        <div style={{ padding: "1.25rem 1rem", fontSize: "0.875rem", lineHeight: 1.6, color: "#d1d5db" }}>
          {body}
        </div>
        {/* Email footer */}
        <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid #2a2d3e", fontSize: "0.6875rem", color: "#6b7280", textAlign: "center" }}>
          &copy; 2026 GlimmoraFabric &middot; Unsubscribe
        </div>
      </div>
    </div>
  );
}

function SMSPreview({ template }: { template: Template }) {
  const body = replacePlaceholders(template.body);
  return (
    <div style={{ width: "100%", maxWidth: "20rem", margin: "0 auto" }}>
      {/* Phone frame */}
      <div style={{ background: "#111318", borderRadius: "1.5rem", padding: "1rem", border: "2px solid #2a2d3e" }}>
        {/* Status bar */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0.5rem 0.75rem", fontSize: "0.6875rem", color: "#6b7280" }}>
          <span>9:41 AM</span>
          <span>GlimmoraFabric</span>
          <span>100%</span>
        </div>
        {/* Chat area */}
        <div style={{ minHeight: "10rem", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: "0.5rem", padding: "0.5rem" }}>
          <div style={{
            alignSelf: "flex-start",
            background: "#2a2d3e",
            color: "#e5e7eb",
            borderRadius: "1rem 1rem 1rem 0.25rem",
            padding: "0.75rem 1rem",
            fontSize: "0.8125rem",
            lineHeight: 1.5,
            maxWidth: "85%",
          }}>
            {body}
          </div>
          <div style={{ alignSelf: "flex-start", fontSize: "0.625rem", color: "#6b7280", paddingLeft: "0.25rem" }}>
            Just now
          </div>
        </div>
      </div>
    </div>
  );
}

function WhatsAppPreview({ template }: { template: Template }) {
  const body = replacePlaceholders(template.body);
  return (
    <div style={{ width: "100%", maxWidth: "22rem", margin: "0 auto" }}>
      <div style={{ borderRadius: "1rem", overflow: "hidden", border: "1px solid #2a2d3e" }}>
        {/* WhatsApp header */}
        <div style={{ background: "#075e54", padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "2rem", height: "2rem", borderRadius: "9999px", background: "#128c7e", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: "0.75rem", fontWeight: 700 }}>GF</span>
          </div>
          <div>
            <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#fff" }}>GlimmoraFabric</div>
            <div style={{ fontSize: "0.625rem", color: "#b0d4cf" }}>online</div>
          </div>
        </div>
        {/* Chat bg */}
        <div style={{ background: "#0b141a", minHeight: "12rem", padding: "1rem", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div style={{
            alignSelf: "flex-start",
            background: "#1f3a34",
            color: "#e5e7eb",
            borderRadius: "0 0.75rem 0.75rem 0.75rem",
            padding: "0.625rem 0.75rem",
            fontSize: "0.8125rem",
            lineHeight: 1.5,
            maxWidth: "85%",
            position: "relative",
          }}>
            {body}
            <div style={{ textAlign: "right", fontSize: "0.5625rem", color: "#6b9080", marginTop: "0.25rem" }}>
              10:42 AM ✓✓
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PushPreview({ template }: { template: Template }) {
  const subject = replacePlaceholders(template.subject);
  const body = replacePlaceholders(template.body);
  return (
    <div style={{ width: "100%", maxWidth: "22rem", margin: "0 auto" }}>
      {/* Phone frame */}
      <div style={{ background: "#111318", borderRadius: "1.5rem", padding: "1.25rem 1rem", border: "2px solid #2a2d3e" }}>
        {/* Lock screen time */}
        <div style={{ textAlign: "center", padding: "1rem 0 1.5rem" }}>
          <div style={{ fontSize: "2.5rem", fontWeight: 300, color: "#e5e7eb" }}>9:41</div>
          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>Monday, March 31</div>
        </div>
        {/* Notification card */}
        <div style={{
          background: "rgba(42,45,62,0.95)",
          borderRadius: "0.875rem",
          padding: "0.875rem",
          backdropFilter: "blur(20px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
            <div style={{ width: "1.25rem", height: "1.25rem", borderRadius: "0.25rem", background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bell style={{ width: "0.75rem", height: "0.75rem", color: "#fff" }} />
            </div>
            <span style={{ fontSize: "0.6875rem", fontWeight: 500, color: "#9ca3af", textTransform: "uppercase" }}>GlimmoraFabric</span>
            <span style={{ fontSize: "0.6875rem", color: "#6b7280", marginLeft: "auto" }}>now</span>
          </div>
          <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#f3f4f6", marginBottom: "0.25rem" }}>
            {subject}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#9ca3af", lineHeight: 1.4 }}>
            {body}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toast component
// ---------------------------------------------------------------------------

interface ToastState {
  message: string;
  type: "success" | "error";
}

function Toast({ toast, onDone }: { toast: ToastState | null; onDone: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDone, 3000);
    return () => clearTimeout(timer);
  }, [toast, onDone]);

  if (!toast) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 9999,
        background: toast.type === "success" ? "#16a34a" : "#dc2626",
        color: "#fff",
        padding: "0.75rem 1.25rem",
        borderRadius: "0.5rem",
        fontSize: "0.875rem",
        fontWeight: 500,
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        animation: "gf-toast-in 0.3s ease-out",
      }}
    >
      {toast.message}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const emptyTemplate: Template = { name: "", channel: "Email", subject: "", body: "", status: "Draft", lastModified: "" };

export function NotificationsContent() {
  const [templates, setTemplates] = useState(initialTemplates);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<Template | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState<Template>({ ...emptyTemplate });
  const [createErrors, setCreateErrors] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState<"All" | Template["channel"]>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Draft">("All");

  // --- Filtering ---
  const filtersActive = searchQuery !== "" || channelFilter !== "All" || statusFilter !== "All";
  const clearFilters = () => { setSearchQuery(""); setChannelFilter("All"); setStatusFilter("All"); };
  const filteredTemplates = templates.filter((t) => {
    const q = searchQuery.toLowerCase();
    if (q && !t.name.toLowerCase().includes(q) && !t.subject.toLowerCase().includes(q)) return false;
    if (channelFilter !== "All" && t.channel !== channelFilter) return false;
    if (statusFilter !== "All" && t.status !== statusFilter) return false;
    return true;
  });

  // --- Scroll lock when any drawer/modal is open ---
  const anyOverlayOpen = editingIndex !== null || previewIndex !== null || deleteIndex !== null || createOpen;
  useEffect(() => {
    if (anyOverlayOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [anyOverlayOpen]);

  // --- Edit ---
  const openDrawer = (index: number) => {
    setDraft({ ...templates[index] });
    setEditingIndex(index);
  };
  const closeDrawer = () => { setEditingIndex(null); setDraft(null); };
  const saveTemplate = () => {
    if (editingIndex === null || !draft) return;
    const today = new Date();
    const updated = { ...draft, lastModified: today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) };
    setTemplates((prev) => prev.map((t, i) => (i === editingIndex ? updated : t)));
    closeDrawer();
    setToast({ message: "Template updated successfully \u2713", type: "success" });
  };

  // --- Delete ---
  const confirmDelete = () => {
    if (deleteIndex === null) return;
    setTemplates((prev) => prev.filter((_, i) => i !== deleteIndex));
    setToast({ message: "Template deleted \u2713", type: "error" });
    setDeleteIndex(null);
  };

  // --- Create ---
  const openCreate = () => {
    setCreateDraft({ ...emptyTemplate });
    setCreateErrors({});
    setCreateOpen(true);
  };
  const closeCreate = () => {
    setCreateOpen(false);
    setCreateDraft({ ...emptyTemplate });
    setCreateErrors({});
  };
  const needsSubject = createDraft.channel === "Email" || createDraft.channel === "Push";
  const saveNewTemplate = () => {
    const errors: Record<string, boolean> = {};
    if (!createDraft.name.trim()) errors.name = true;
    if (!createDraft.body.trim()) errors.body = true;
    if (needsSubject && !createDraft.subject.trim()) errors.subject = true;
    if (Object.keys(errors).length > 0) { setCreateErrors(errors); return; }
    const today = new Date();
    const newT: Template = {
      ...createDraft,
      subject: needsSubject ? createDraft.subject : createDraft.subject || createDraft.name,
      lastModified: today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
    setTemplates((prev) => [newT, ...prev]);
    closeCreate();
    setToast({ message: "Template created successfully \u2713", type: "success" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Inject keyframe animations */}
      <style>{animationStyles}</style>

      {/* Toast */}
      <Toast toast={toast} onDone={() => setToast(null)} />

      {/* ================================================================= */}
      {/* EDIT DRAWER                                                        */}
      {/* ================================================================= */}
      {editingIndex !== null && draft && createPortal(
        <>
          <div onClick={closeDrawer} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, animation: "gf-fade-in 0.2s ease-out" }} />
          <div style={{
            position: "fixed", top: 0, right: 0, bottom: 0, width: "28rem", zIndex: 1001,
            background: "#1a1d2e", borderLeft: "1px solid #2a2d3e",
            boxShadow: "-4px 0 24px rgba(0,0,0,0.3)",
            display: "flex", flexDirection: "column", overflow: "hidden",
            animation: "gf-slide-right 0.3s ease-out",
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid #2a2d3e" }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#f3f4f6" }}>Edit Template</h2>
              <button onClick={closeDrawer} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}>
                <X style={{ width: "1.25rem", height: "1.25rem" }} />
              </button>
            </div>
            {/* Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Template Name */}
              <FieldGroup label="Template Name">
                <input type="text" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} style={inputStyle} />
              </FieldGroup>
              {/* Channel */}
              <FieldGroup label="Channel">
                <select value={draft.channel} onChange={(e) => setDraft({ ...draft, channel: e.target.value as Template["channel"] })} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="Email">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Push">Push</option>
                </select>
              </FieldGroup>
              {/* Subject */}
              <FieldGroup label="Subject">
                <input type="text" value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} style={inputStyle} />
              </FieldGroup>
              {/* Body */}
              <FieldGroup label="Body / Message">
                <textarea value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} rows={5} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
                <span style={{ fontSize: "0.6875rem", color: "#6b7280" }}>
                  Supports placeholders: {"{{userName}}"}, {"{{orderId}}"}, etc.
                </span>
              </FieldGroup>
              {/* Status */}
              <FieldGroup label="Status">
                <div onClick={() => setDraft({ ...draft, status: draft.status === "Active" ? "Draft" : "Active" })} style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", userSelect: "none" }}>
                  <div style={{ width: "2.75rem", height: "1.5rem", borderRadius: "9999px", background: draft.status === "Active" ? "#22c55e" : "rgba(127,127,127,0.35)", position: "relative", transition: "background 0.2s" }}>
                    <div style={{ position: "absolute", top: "0.125rem", left: draft.status === "Active" ? "1.375rem" : "0.125rem", width: "1.25rem", height: "1.25rem", borderRadius: "9999px", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                  </div>
                  <span style={{ fontSize: "0.875rem", fontWeight: 500, color: draft.status === "Active" ? "#22c55e" : "#6b7280" }}>{draft.status}</span>
                </div>
              </FieldGroup>
            </div>
            {/* Footer */}
            <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid #2a2d3e", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              <button onClick={saveTemplate} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "none", background: "#f97316", color: "#fff", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>
                Save Changes
              </button>
              <button onClick={closeDrawer} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #2a2d3e", background: "rgba(127,127,127,0.12)", color: "#9ca3af", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* ================================================================= */}
      {/* PREVIEW MODAL                                                      */}
      {/* ================================================================= */}
      {previewIndex !== null && templates[previewIndex] && createPortal(
        <>
          <div onClick={() => setPreviewIndex(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, animation: "gf-fade-in 0.2s ease-out" }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1001,
            width: "36rem", maxHeight: "85vh", overflowY: "auto",
            background: "#1a1d2e", border: "1px solid #2a2d3e", borderRadius: "1rem",
            boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
            animation: "gf-slide-up 0.3s ease-out",
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid #2a2d3e" }}>
              <div>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#f3f4f6" }}>Preview: {templates[previewIndex].name}</h2>
                <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{templates[previewIndex].channel} channel</span>
              </div>
              <button onClick={() => setPreviewIndex(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}>
                <X style={{ width: "1.25rem", height: "1.25rem" }} />
              </button>
            </div>
            {/* Preview body */}
            <div style={{ padding: "1.5rem" }}>
              {templates[previewIndex].channel === "Email" && <EmailPreview template={templates[previewIndex]} />}
              {templates[previewIndex].channel === "SMS" && <SMSPreview template={templates[previewIndex]} />}
              {templates[previewIndex].channel === "WhatsApp" && <WhatsAppPreview template={templates[previewIndex]} />}
              {templates[previewIndex].channel === "Push" && <PushPreview template={templates[previewIndex]} />}
            </div>
            {/* Footer */}
            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #2a2d3e" }}>
              <button onClick={() => setPreviewIndex(null)} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #2a2d3e", background: "rgba(127,127,127,0.12)", color: "#9ca3af", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>
                Close
              </button>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* ================================================================= */}
      {/* DELETE CONFIRMATION                                                */}
      {/* ================================================================= */}
      {deleteIndex !== null && templates[deleteIndex] && createPortal(
        <>
          <div onClick={() => setDeleteIndex(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, animation: "gf-fade-in 0.2s ease-out" }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1001,
            width: "26rem", background: "#1a1d2e", border: "1px solid #2a2d3e", borderRadius: "1rem",
            boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
            padding: "2rem 1.5rem",
            animation: "gf-slide-up 0.3s ease-out",
            textAlign: "center",
          }}>
            <div style={{ width: "3rem", height: "3rem", borderRadius: "9999px", background: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
              <Trash2 style={{ width: "1.25rem", height: "1.25rem", color: "#ef4444" }} />
            </div>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#f3f4f6", marginBottom: "0.5rem" }}>Delete Template</h3>
            <p style={{ fontSize: "0.875rem", color: "#9ca3af", lineHeight: 1.5, marginBottom: "1.5rem" }}>
              Are you sure you want to delete <strong style={{ color: "#f3f4f6" }}>{templates[deleteIndex].name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setDeleteIndex(null)} style={{ flex: 1, padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #2a2d3e", background: "rgba(127,127,127,0.12)", color: "#9ca3af", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={confirmDelete} style={{ flex: 1, padding: "0.75rem", borderRadius: "0.5rem", border: "none", background: "#dc2626", color: "#fff", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>
                Yes, Delete
              </button>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* ================================================================= */}
      {/* CREATE DRAWER                                                      */}
      {/* ================================================================= */}
      {createOpen && createPortal(
        <>
          <div onClick={closeCreate} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, animation: "gf-fade-in 0.2s ease-out" }} />
          <div style={{
            position: "fixed", top: 0, right: 0, bottom: 0, width: "30rem", zIndex: 1001,
            background: "#1a1d2e", borderLeft: "1px solid #2a2d3e",
            boxShadow: "-4px 0 24px rgba(0,0,0,0.3)",
            display: "flex", flexDirection: "column", overflow: "hidden",
            animation: "gf-slide-right 0.3s ease-out",
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid #2a2d3e" }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#f3f4f6" }}>Create New Template</h2>
              <button onClick={closeCreate} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}>
                <X style={{ width: "1.25rem", height: "1.25rem" }} />
              </button>
            </div>
            {/* Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Template Name */}
              <FieldGroup label="Template Name *">
                <input
                  type="text" value={createDraft.name} placeholder="e.g. Welcome Email"
                  onChange={(e) => { setCreateDraft({ ...createDraft, name: e.target.value }); setCreateErrors((p) => ({ ...p, name: false })); }}
                  style={{ ...inputStyle, ...(createErrors.name ? { border: "1px solid #ef4444" } : {}) }}
                />
                {createErrors.name && <span style={{ fontSize: "0.6875rem", color: "#ef4444" }}>Template name is required</span>}
              </FieldGroup>
              {/* Channel */}
              <FieldGroup label="Channel *">
                <select
                  value={createDraft.channel}
                  onChange={(e) => setCreateDraft({ ...createDraft, channel: e.target.value as Template["channel"] })}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="Email">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Push">Push</option>
                </select>
              </FieldGroup>
              {/* Subject (conditional) */}
              {needsSubject && (
                <FieldGroup label="Subject *">
                  <input
                    type="text" value={createDraft.subject} placeholder="e.g. Welcome to GlimmoraFabric!"
                    onChange={(e) => { setCreateDraft({ ...createDraft, subject: e.target.value }); setCreateErrors((p) => ({ ...p, subject: false })); }}
                    style={{ ...inputStyle, ...(createErrors.subject ? { border: "1px solid #ef4444" } : {}) }}
                  />
                  {createErrors.subject && <span style={{ fontSize: "0.6875rem", color: "#ef4444" }}>Subject is required for {createDraft.channel}</span>}
                </FieldGroup>
              )}
              {/* Body */}
              <FieldGroup label="Message Body *">
                <textarea
                  value={createDraft.body} rows={5} placeholder="Hi {{userName}}, ..."
                  onChange={(e) => { setCreateDraft({ ...createDraft, body: e.target.value }); setCreateErrors((p) => ({ ...p, body: false })); }}
                  style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit", ...(createErrors.body ? { border: "1px solid #ef4444" } : {}) }}
                />
                {createErrors.body && <span style={{ fontSize: "0.6875rem", color: "#ef4444" }}>Message body is required</span>}
                <span style={{ fontSize: "0.6875rem", color: "#6b7280" }}>
                  Supports placeholders: {"{{userName}}"}, {"{{orderId}}"}, etc.
                </span>
              </FieldGroup>
              {/* Status */}
              <FieldGroup label="Status">
                <div onClick={() => setCreateDraft({ ...createDraft, status: createDraft.status === "Active" ? "Draft" : "Active" })} style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", userSelect: "none" }}>
                  <div style={{ width: "2.75rem", height: "1.5rem", borderRadius: "9999px", background: createDraft.status === "Active" ? "#22c55e" : "rgba(127,127,127,0.35)", position: "relative", transition: "background 0.2s" }}>
                    <div style={{ position: "absolute", top: "0.125rem", left: createDraft.status === "Active" ? "1.375rem" : "0.125rem", width: "1.25rem", height: "1.25rem", borderRadius: "9999px", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                  </div>
                  <span style={{ fontSize: "0.875rem", fontWeight: 500, color: createDraft.status === "Active" ? "#22c55e" : "#6b7280" }}>{createDraft.status}</span>
                </div>
              </FieldGroup>

              {/* Live Preview */}
              {createDraft.body.trim() && (
                <div style={{ borderTop: "1px solid #2a2d3e", paddingTop: "1.25rem" }}>
                  <h3 style={{ fontSize: "0.75rem", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Live Preview</h3>
                  <div style={{ transform: "scale(0.85)", transformOrigin: "top left", width: "117.6%" }}>
                    {createDraft.channel === "Email" && <EmailPreview template={createDraft} />}
                    {createDraft.channel === "SMS" && <SMSPreview template={createDraft} />}
                    {createDraft.channel === "WhatsApp" && <WhatsAppPreview template={createDraft} />}
                    {createDraft.channel === "Push" && <PushPreview template={createDraft} />}
                  </div>
                </div>
              )}
            </div>
            {/* Footer */}
            <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid #2a2d3e", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              <button onClick={saveNewTemplate} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "none", background: "#f97316", color: "#fff", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>
                Save Template
              </button>
              <button onClick={closeCreate} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #2a2d3e", background: "rgba(127,127,127,0.12)", color: "#9ca3af", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--gf-text-primary)" }}>
          Notification Hub
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--gf-text-muted)", marginTop: "0.25rem" }}>
          Email, SMS, WhatsApp, and push notification management
        </p>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
        {stats.map((stat) => (
          <div key={stat.label} style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.875rem", color: "var(--gf-text-muted)" }}>{stat.label}</span>
              <stat.icon style={{ width: "1.125rem", height: "1.125rem", color: "var(--gf-accent)" }} />
            </div>
            <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--gf-text-primary)", marginTop: "0.5rem" }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Templates Table */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--gf-text-primary)" }}>Templates</h2>
          <button
            onClick={openCreate}
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.375rem",
              padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "none",
              background: "#f97316", color: "#fff", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer",
            }}
          >
            <Plus style={{ width: "0.875rem", height: "0.875rem" }} />
            Create New Template
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 14rem" }}>
            <Search style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", width: "0.875rem", height: "0.875rem", color: "#6b7280", pointerEvents: "none" }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              style={{
                width: "100%", padding: "0.5rem 0.75rem 0.5rem 2.25rem",
                fontSize: "0.8125rem", borderRadius: "0.5rem",
                border: "1px solid #2a2d3e", background: "#1a1d2e", color: "#f3f4f6",
                outline: "none",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#f97316")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2d3e")}
            />
          </div>
          {/* Channel filter */}
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value as typeof channelFilter)}
            style={{ ...filterSelectStyle }}
          >
            <option value="All">All Channels</option>
            <option value="Email">Email</option>
            <option value="SMS">SMS</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Push">Push</option>
          </select>
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            style={{ ...filterSelectStyle }}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
          </select>
          {/* Clear filters */}
          {filtersActive && (
            <button
              onClick={clearFilters}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.375rem",
                padding: "0.5rem 0.75rem", borderRadius: "0.5rem",
                border: "1px solid #2a2d3e", background: "rgba(127,127,127,0.1)",
                color: "#9ca3af", fontSize: "0.8125rem", fontWeight: 500, cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              <FilterX style={{ width: "0.875rem", height: "0.875rem" }} />
              Clear Filters
            </button>
          )}
        </div>

        {filteredTemplates.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
            <Search style={{ width: "2rem", height: "2rem", color: "#4b5563", margin: "0 auto 0.75rem" }} />
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>No templates found</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["Name", "Channel", "Subject", "Status", "Last Modified", "Actions"].map((col) => (
                  <th key={col} style={{ ...thStyle, ...(col === "Actions" ? { textAlign: "center" } : {}) }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTemplates.map((t, fi) => {
                const realIndex = templates.indexOf(t);
                const sc = templateStatusColor(t.status);
                return (
                  <tr
                    key={`${t.name}-${realIndex}`}
                    style={{ borderBottom: fi < filteredTemplates.length - 1 ? "1px solid var(--gf-border)" : "none", transition: "background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(249,115,22,0.04)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                  >
                    <td style={tdPrimary}>{t.name}</td>
                    <td style={tdSecondary}>{t.channel}</td>
                    <td style={{ ...tdSecondary, maxWidth: "16rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.subject}
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 500, color: sc.color, background: sc.bg, borderRadius: "9999px", padding: "0.125rem 0.5rem" }}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ ...tdSecondary, fontSize: "0.75rem", color: "var(--gf-text-muted)", whiteSpace: "nowrap" }}>
                      {t.lastModified}
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem" }}>
                        <button onClick={() => setPreviewIndex(realIndex)} title="Preview" style={actionBtnStyle("#6b7280")}>
                          <Eye style={{ width: "0.875rem", height: "0.875rem" }} />
                        </button>
                        <button onClick={() => openDrawer(realIndex)} title="Edit template" style={actionBtnStyle("#3b82f6")}>
                          <Pencil style={{ width: "0.875rem", height: "0.875rem" }} />
                        </button>
                        <button onClick={() => setDeleteIndex(realIndex)} title="Delete template" style={actionBtnStyle("#ef4444")}>
                          <Trash2 style={{ width: "0.875rem", height: "0.875rem" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Channel Settings */}
      <div>
        <h2 style={sectionTitle}>Channel Settings</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
          {channels.map((ch) => (
            <div key={ch.name} style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <ch.icon style={{ width: "1.25rem", height: "1.25rem", color: "var(--gf-accent)" }} />
                <span style={{
                  fontSize: "0.75rem", fontWeight: 500,
                  color: ch.status === "Active" ? "#22c55e" : "var(--gf-text-muted)",
                  background: ch.status === "Active" ? "rgba(34,197,94,0.12)" : "rgba(127,127,127,0.12)",
                  borderRadius: "9999px", padding: "0.125rem 0.5rem",
                }}>{ch.status}</span>
              </div>
              <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--gf-text-primary)", marginTop: "0.75rem" }}>{ch.name}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--gf-text-muted)", marginTop: "0.25rem" }}>Provider: {ch.provider}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--gf-text-muted)", marginTop: "0.125rem" }}>{ch.sent} sent today</p>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Logs Table */}
      <div style={cardStyle}>
        <h2 style={sectionTitle}>Delivery Logs</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
              {["Template", "Channel", "Recipient", "Status", "Time"].map((col) => (
                <th key={col} style={thStyle}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {deliveryLogs.map((log, i) => (
              <tr key={i} style={{ borderBottom: i < deliveryLogs.length - 1 ? "1px solid var(--gf-border)" : "none" }}>
                <td style={tdPrimary}>{log.template}</td>
                <td style={tdSecondary}>{log.channel}</td>
                <td style={tdSecondary}>{log.recipient}</td>
                <td style={{ padding: "0.75rem", fontSize: "0.875rem", fontWeight: 500, color: deliveryStatusColor(log.status) }}>{log.status}</td>
                <td style={{ padding: "0.75rem", fontSize: "0.75rem", color: "var(--gf-text-muted)", whiteSpace: "nowrap" }}>{log.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Retry Rules */}
      <div>
        <h2 style={sectionTitle}>Retry Rules</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
          {retryRules.map((rule) => (
            <div key={rule.channel} style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <RefreshCw style={{ width: "1rem", height: "1rem", color: "var(--gf-accent)" }} />
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--gf-text-primary)" }}>{rule.channel}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--gf-text-muted)" }}>
                  Max Retries: <span style={{ color: "var(--gf-text-primary)", fontWeight: 500 }}>{rule.maxRetries}</span>
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--gf-text-muted)" }}>
                  Interval: <span style={{ color: "var(--gf-text-primary)", fontWeight: 500 }}>{rule.interval}</span>
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--gf-text-muted)" }}>
                  Backoff: <span style={{ color: "var(--gf-text-primary)", fontWeight: 500 }}>{rule.backoff}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Preferences */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <Users style={{ width: "1.125rem", height: "1.125rem", color: "var(--gf-accent)" }} />
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--gf-text-primary)" }}>User Preferences</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
          {userPreferences.map((pref) => {
            const pct = Math.round((pref.optedIn / pref.total) * 100);
            return (
              <div key={pref.channel} style={{ background: "var(--gf-bg-page, var(--gf-bg-surface))", border: "1px solid var(--gf-border)", borderRadius: "0.75rem", padding: "1rem" }}>
                <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--gf-text-primary)", marginBottom: "0.5rem" }}>{pref.channel}</p>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--gf-text-muted)", marginBottom: "0.25rem" }}>
                  <span>Opt-in: <span style={{ color: "#22c55e", fontWeight: 500 }}>{pref.optedIn.toLocaleString()}</span></span>
                  <span>Opt-out: <span style={{ color: "#ef4444", fontWeight: 500 }}>{pref.optedOut.toLocaleString()}</span></span>
                </div>
                <div style={{ height: "0.375rem", borderRadius: "9999px", background: "rgba(239,68,68,0.2)", marginTop: "0.5rem" }}>
                  <div style={{ height: "100%", width: `${pct}%`, borderRadius: "9999px", background: "#22c55e" }} />
                </div>
                <p style={{ fontSize: "0.6875rem", color: "var(--gf-text-muted)", marginTop: "0.375rem", textAlign: "right" }}>{pct}% opted in</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small shared pieces
// ---------------------------------------------------------------------------

const inputStyle: React.CSSProperties = {
  padding: "0.625rem 0.75rem",
  fontSize: "0.875rem",
  borderRadius: "0.5rem",
  border: "1px solid #2a2d3e",
  background: "#0f1117",
  color: "#f3f4f6",
  outline: "none",
};

const filterSelectStyle: React.CSSProperties = {
  padding: "0.5rem 0.75rem",
  fontSize: "0.8125rem",
  borderRadius: "0.5rem",
  border: "1px solid #2a2d3e",
  background: "#1a1d2e",
  color: "#f3f4f6",
  outline: "none",
  cursor: "pointer",
};

function actionBtnStyle(color: string): React.CSSProperties {
  return {
    background: "none",
    border: "none",
    cursor: "pointer",
    color,
    padding: "0.25rem",
    borderRadius: "0.375rem",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
      <label style={{ fontSize: "0.75rem", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </label>
      {children}
    </div>
  );
}
