
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
  Megaphone,
  Clock,
  Calendar,
  Info,
  Download,
  Settings,
  ArrowRight,
  EyeOff,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const stats = [];

interface Template {
  name: string;
  channel: "Email" | "SMS" | "WhatsApp" | "Push";
  subject: string;
  body: string;
  status: "Active" | "Draft";
  lastModified: string;
}

const initialTemplates: Template[] = [];

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
  { template: "Account Verification", channel: "Email", recipient: "newuser@gmail.com", status: "Delivered", time: "38 min ago" },
  { template: "Payment Receipt", channel: "Email", recipient: "buyer@shop.com", status: "Delivered", time: "42 min ago" },
  { template: "Delivery Completed", channel: "SMS", recipient: "+1 (555) 987-6543", status: "Delivered", time: "50 min ago" },
  { template: "Feedback Request", channel: "Email", recipient: "customer@inbox.com", status: "Pending", time: "55 min ago" },
  { template: "Subscription Renewal", channel: "Push", recipient: "device_token_a41", status: "Delivered", time: "1 hour ago" },
  { template: "Cart Abandonment", channel: "Email", recipient: "shopper@mail.com", status: "Delivered", time: "1.5 hours ago" },
  { template: "Appointment Reminder", channel: "WhatsApp", recipient: "+44 7700 900123", status: "Delivered", time: "2 hours ago" },
  { template: "Referral Invite", channel: "SMS", recipient: "+1 (555) 456-7890", status: "Failed", time: "2.5 hours ago" },
  { template: "Security Code", channel: "SMS", recipient: "+91 91234 56789", status: "Delivered", time: "3 hours ago" },
  { template: "Weekly Digest", channel: "Email", recipient: "team@company.io", status: "Delivered", time: "3.5 hours ago" },
  { template: "Feature Announcement", channel: "Push", recipient: "device_token_b73", status: "Delivered", time: "4 hours ago" },
  { template: "Return Confirmation", channel: "WhatsApp", recipient: "+61 400 123 456", status: "Pending", time: "4.5 hours ago" },
  { template: "Loyalty Points", channel: "Push", recipient: "device_token_c55", status: "Delivered", time: "5 hours ago" },
  { template: "Service Outage", channel: "Email", recipient: "ops@enterprise.com", status: "Bounced", time: "5.5 hours ago" },
  { template: "Birthday Greeting", channel: "WhatsApp", recipient: "+49 170 1234567", status: "Delivered", time: "6 hours ago" },
  { template: "Welcome Email", channel: "Email", recipient: "jane@startup.io", status: "Failed", time: "6.5 hours ago" },
  { template: "Order Confirmation", channel: "SMS", recipient: "+1 (555) 321-0987", status: "Delivered", time: "7 hours ago" },
  { template: "Password Reset", channel: "Email", recipient: "forgot@webmail.com", status: "Delivered", time: "7.5 hours ago" },
  { template: "Promo Alert", channel: "Push", recipient: "device_token_d19", status: "Pending", time: "8 hours ago" },
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
// Scheduled Queue data
// ---------------------------------------------------------------------------

interface ScheduledNotification {
  id: number;
  template: string;
  channel: string;
  recipient: string;
  scheduledAt: string;
  repeat: string;
  status: "Scheduled" | "Sent" | "Cancelled";
}

const initialScheduledQueue: ScheduledNotification[] = [
  { id: 1, template: "Weekly Digest", channel: "Email", recipient: "All Users", scheduledAt: "Apr 05, 2026 09:00 AM IST", repeat: "Weekly", status: "Scheduled" },
  { id: 2, template: "Promo Alert", channel: "Push", recipient: "Opted-in Users", scheduledAt: "Apr 03, 2026 02:00 PM UTC", repeat: "Once", status: "Scheduled" },
  { id: 3, template: "Subscription Renewal", channel: "SMS", recipient: "+1 (555) 123-4567", scheduledAt: "Apr 01, 2026 10:00 AM EST", repeat: "Monthly", status: "Sent" },
];

// ---------------------------------------------------------------------------
// Channel Settings data
// ---------------------------------------------------------------------------

interface ChannelSetting {
  channel: string;
  provider: string;
  dailyLimit: number;
  enabled: boolean;
  apiKey: string;
  icon: typeof Mail;
  providers: string[];
}

const initialChannelSettings: ChannelSetting[] = [
  { channel: "Email", provider: "AWS SES", dailyLimit: 10000, enabled: true, apiKey: "ses_••••••••••••abcd", icon: Mail, providers: ["AWS SES", "SendGrid", "Mailgun"] },
  { channel: "SMS", provider: "Twilio", dailyLimit: 5000, enabled: true, apiKey: "twilio_••••••••••••efgh", icon: MessageSquare, providers: ["Twilio", "Vonage", "Plivo"] },
  { channel: "WhatsApp", provider: "Twilio", dailyLimit: 3000, enabled: true, apiKey: "wa_••••••••••••ijkl", icon: MessageSquare, providers: ["Twilio", "360dialog", "MessageBird"] },
  { channel: "Push", provider: "Firebase FCM", dailyLimit: 50000, enabled: true, apiKey: "fcm_••••••••••••mnop", icon: Smartphone, providers: ["Firebase FCM", "OneSignal", "Pusher"] },
];

interface FallbackRule {
  id: number;
  primary: string;
  fallback: string;
}

const initialFallbackRules: FallbackRule[] = [
  { id: 1, primary: "Push", fallback: "SMS" },
  { id: 2, primary: "SMS", fallback: "Email" },
  { id: 3, primary: "WhatsApp", fallback: "SMS" },
];

// ---------------------------------------------------------------------------
// Opt-out data
// ---------------------------------------------------------------------------

interface OptOutUser {
  name: string;
  contact: string;
  date: string;
  reason: string;
}

const optOutData: Record<string, OptOutUser[]> = {
  Email: [
    { name: "John Doe", contact: "john@example.com", date: "Mar 28, 2026", reason: "Too many emails" },
    { name: "Jane Smith", contact: "jane@example.com", date: "Mar 25, 2026", reason: "Not relevant" },
    { name: "Mike Chen", contact: "mike@example.com", date: "Mar 20, 2026", reason: "Unsubscribed" },
    { name: "Sara Wilson", contact: "sara@example.com", date: "Mar 18, 2026", reason: "Spam" },
  ],
  SMS: [
    { name: "Alex Rivera", contact: "+1 (555) 234-5678", date: "Mar 27, 2026", reason: "Too frequent" },
    { name: "User 1", contact: "+91 98765 43210", date: "Mar 22, 2026", reason: "Not relevant" },
    { name: "Tom Brown", contact: "+1 (555) 876-5432", date: "Mar 15, 2026", reason: "Unsubscribed" },
  ],
  WhatsApp: [
    { name: "Lisa Park", contact: "+44 7700 900123", date: "Mar 26, 2026", reason: "Too many messages" },
    { name: "Emma Davis", contact: "+61 400 123 456", date: "Mar 21, 2026", reason: "Not relevant" },
  ],
  Push: [
    { name: "Carlos Rivera", contact: "device_token_x92", date: "Mar 24, 2026", reason: "Battery drain" },
    { name: "User 2", contact: "device_token_a41", date: "Mar 19, 2026", reason: "Too frequent" },
    { name: "Jordan Lee", contact: "device_token_b73", date: "Mar 14, 2026", reason: "Not useful" },
  ],
};

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
      <div style={{ background: "var(--gf-bg-elevated)", borderRadius: "0.75rem", overflow: "hidden", border: "1px solid var(--gf-border)" }}>
        {/* Email header bar */}
        <div style={{ background: "#f97316", padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Mail style={{ width: "1rem", height: "1rem", color: "#fff" }} />
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#fff" }}>GlimmoraFabric</span>
        </div>
        {/* Email meta */}
        <div style={{ padding: "1rem", borderBottom: "1px solid var(--gf-border)", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.75rem" }}>
            <span style={{ color: "var(--gf-text-muted)" }}>From:</span>
            <span style={{ color: "var(--gf-text-secondary)" }}>noreply@glimmorafabric.com</span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.75rem" }}>
            <span style={{ color: "var(--gf-text-muted)" }}>To:</span>
            <span style={{ color: "var(--gf-text-secondary)" }}>john@example.com</span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.75rem" }}>
            <span style={{ color: "var(--gf-text-muted)" }}>Subject:</span>
            <span style={{ color: "var(--gf-text-primary)", fontWeight: 500 }}>{subject}</span>
          </div>
        </div>
        {/* Email body */}
        <div style={{ padding: "1.25rem 1rem", fontSize: "0.875rem", lineHeight: 1.6, color: "var(--gf-text-secondary)" }}>
          {body}
        </div>
        {/* Email footer */}
        <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid var(--gf-border)", fontSize: "0.6875rem", color: "var(--gf-text-muted)", textAlign: "center" }}>
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
      <div style={{ background: "var(--gf-bg-base)", borderRadius: "1.5rem", padding: "1rem", border: "2px solid var(--gf-border)" }}>
        {/* Status bar */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0.5rem 0.75rem", fontSize: "0.6875rem", color: "var(--gf-text-muted)" }}>
          <span>9:41 AM</span>
          <span>GlimmoraFabric</span>
          <span>100%</span>
        </div>
        {/* Chat area */}
        <div style={{ minHeight: "10rem", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: "0.5rem", padding: "0.5rem" }}>
          <div style={{
            alignSelf: "flex-start",
            background: "var(--gf-bg-elevated)",
            color: "var(--gf-text-primary)",
            borderRadius: "1rem 1rem 1rem 0.25rem",
            padding: "0.75rem 1rem",
            fontSize: "0.8125rem",
            lineHeight: 1.5,
            maxWidth: "85%",
          }}>
            {body}
          </div>
          <div style={{ alignSelf: "flex-start", fontSize: "0.625rem", color: "var(--gf-text-muted)", paddingLeft: "0.25rem" }}>
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
      <div style={{ borderRadius: "1rem", overflow: "hidden", border: "1px solid var(--gf-border)" }}>
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
        <div style={{ background: "var(--gf-bg-base)", minHeight: "12rem", padding: "1rem", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div style={{
            alignSelf: "flex-start",
            background: "#dcf8c6",
            color: "#1a1a1a",
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
      <div style={{ background: "var(--gf-bg-base)", borderRadius: "1.5rem", padding: "1.25rem 1rem", border: "2px solid var(--gf-border)" }}>
        {/* Lock screen time */}
        <div style={{ textAlign: "center", padding: "1rem 0 1.5rem" }}>
          <div style={{ fontSize: "2.5rem", fontWeight: 300, color: "var(--gf-text-primary)" }}>9:41</div>
          <div style={{ fontSize: "0.75rem", color: "var(--gf-text-muted)" }}>Monday, March 31</div>
        </div>
        {/* Notification card */}
        <div style={{
          background: "var(--gf-bg-elevated)",
          borderRadius: "0.875rem",
          padding: "0.875rem",
          border: "1px solid var(--gf-border)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
            <div style={{ width: "1.25rem", height: "1.25rem", borderRadius: "0.25rem", background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bell style={{ width: "0.75rem", height: "0.75rem", color: "#fff" }} />
            </div>
            <span style={{ fontSize: "0.6875rem", fontWeight: 500, color: "var(--gf-text-muted)", textTransform: "uppercase" }}>GlimmoraFabric</span>
            <span style={{ fontSize: "0.6875rem", color: "var(--gf-text-muted)", marginLeft: "auto" }}>now</span>
          </div>
          <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--gf-text-primary)", marginBottom: "0.25rem" }}>
            {subject}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--gf-text-secondary)", lineHeight: 1.4 }}>
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
  const [logSearch, setLogSearch] = useState("");
  const [logChannelFilter, setLogChannelFilter] = useState<"All" | string>("All");
  const [logStatusFilter, setLogStatusFilter] = useState<"All" | string>("All");
  const [templatePage, setTemplatePage] = useState(1);
  const [logPage, setLogPage] = useState(1);

  // PART 1 — Broadcast
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [bcChannels, setBcChannels] = useState({ Email: true, SMS: true, WhatsApp: false, Push: false });
  const [bcTemplate, setBcTemplate] = useState("");
  const [bcAudience, setBcAudience] = useState<"all" | "opted" | "segment">("opted");
  const [bcSegment, setBcSegment] = useState("");
  const [bcConfirm, setBcConfirm] = useState(false);

  // PART 2 — Schedule
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [schTemplate, setSchTemplate] = useState("");
  const [schChannel, setSchChannel] = useState("Email");
  const [schRecipient, setSchRecipient] = useState("");
  const [schSendAll, setSchSendAll] = useState(false);
  const [schDate, setSchDate] = useState("");
  const [schTime, setSchTime] = useState("");
  const [schTimezone, setSchTimezone] = useState("IST");
  const [schRepeat, setSchRepeat] = useState("Once");
  const [schNotes, setSchNotes] = useState("");
  const [scheduledQueue, setScheduledQueue] = useState<ScheduledNotification[]>(initialScheduledQueue);
  const [nextSchId, setNextSchId] = useState(4);

  // PART 3 — Edit Retry Rules
  const [retryRulesState, setRetryRulesState] = useState(retryRules.map((r) => ({ ...r })));
  const [editRetryChannel, setEditRetryChannel] = useState<string | null>(null);
  const [retryForm, setRetryForm] = useState({ maxRetries: 3, intervalVal: 5, intervalUnit: "min" as "min" | "hours", backoff: "Exponential" });

  // PART 4 — Channel Settings + Fallback
  const [chSettings, setChSettings] = useState<ChannelSetting[]>(initialChannelSettings);
  const [editChSetting, setEditChSetting] = useState<ChannelSetting | null>(null);
  const [chForm, setChForm] = useState({ provider: "", dailyLimit: 0, apiKey: "" });
  const [showChApiKey, setShowChApiKey] = useState(false);
  const [fallbackRules, setFallbackRules] = useState<FallbackRule[]>(initialFallbackRules);
  const [nextFbId, setNextFbId] = useState(4);

  // PART 5 — View/Export Opt-outs
  const [optOutChannel, setOptOutChannel] = useState<string | null>(null);
  const [optOutSearch, setOptOutSearch] = useState("");

  // --- Filtering ---
  const ROWS_PER_PAGE = 10;

  const filtersActive = searchQuery !== "" || channelFilter !== "All" || statusFilter !== "All";
  const clearFilters = () => { setSearchQuery(""); setChannelFilter("All"); setStatusFilter("All"); setTemplatePage(1); };
  const filteredTemplates = templates.filter((t) => {
    const q = searchQuery.toLowerCase();
    if (q && !t.name.toLowerCase().includes(q) && !t.subject.toLowerCase().includes(q)) return false;
    if (channelFilter !== "All" && t.channel !== channelFilter) return false;
    if (statusFilter !== "All" && t.status !== statusFilter) return false;
    return true;
  });

  // Reset template page when filters or data change
  useEffect(() => { setTemplatePage(1); }, [searchQuery, channelFilter, statusFilter, templates.length]);
  const templateTotalPages = Math.ceil(filteredTemplates.length / ROWS_PER_PAGE);
  const pagedTemplates = filteredTemplates.slice((templatePage - 1) * ROWS_PER_PAGE, templatePage * ROWS_PER_PAGE);

  // --- Delivery Logs Filtering ---
  const logFiltersActive = logSearch !== "" || logChannelFilter !== "All" || logStatusFilter !== "All";
  const clearLogFilters = () => { setLogSearch(""); setLogChannelFilter("All"); setLogStatusFilter("All"); setLogPage(1); };
  const filteredLogs = deliveryLogs.filter((log) => {
    const q = logSearch.toLowerCase();
    if (q && !log.template.toLowerCase().includes(q) && !log.recipient.toLowerCase().includes(q)) return false;
    if (logChannelFilter !== "All" && log.channel !== logChannelFilter) return false;
    if (logStatusFilter !== "All" && log.status !== logStatusFilter) return false;
    return true;
  });

  // Reset log page when filters change
  useEffect(() => { setLogPage(1); }, [logSearch, logChannelFilter, logStatusFilter]);
  const logTotalPages = Math.ceil(filteredLogs.length / ROWS_PER_PAGE);
  const pagedLogs = filteredLogs.slice((logPage - 1) * ROWS_PER_PAGE, logPage * ROWS_PER_PAGE);

  // --- Scroll lock when any drawer/modal is open ---
  const anyOverlayOpen = editingIndex !== null || previewIndex !== null || deleteIndex !== null || createOpen || broadcastOpen || scheduleOpen || editRetryChannel !== null || editChSetting !== null || optOutChannel !== null;
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
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1001,
            width: "700px", maxWidth: "90vw", maxHeight: "85vh",
            background: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)",
            borderRadius: "0.75rem",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
            display: "flex", flexDirection: "column", overflow: "hidden",
            animation: "gf-slide-up 0.3s ease-out",
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--gf-border)" }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--gf-text-primary)" }}>Edit Template</h2>
              <button onClick={closeDrawer} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gf-text-muted)" }}>
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
                <span style={{ fontSize: "0.6875rem", color: "var(--gf-text-muted)" }}>
                  Supports placeholders: {"{{userName}}"}, {"{{orderId}}"}, etc.
                </span>
              </FieldGroup>
              {/* Status */}
              <FieldGroup label="Status">
                <div onClick={() => setDraft({ ...draft, status: draft.status === "Active" ? "Draft" : "Active" })} style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", userSelect: "none" }}>
                  <div style={{ width: "2.75rem", height: "1.5rem", borderRadius: "9999px", background: draft.status === "Active" ? "#22c55e" : "rgba(127,127,127,0.35)", position: "relative", transition: "background 0.2s" }}>
                    <div style={{ position: "absolute", top: "0.125rem", left: draft.status === "Active" ? "1.375rem" : "0.125rem", width: "1.25rem", height: "1.25rem", borderRadius: "9999px", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                  </div>
                  <span style={{ fontSize: "0.875rem", fontWeight: 500, color: draft.status === "Active" ? "#22c55e" : "var(--gf-text-muted)" }}>{draft.status}</span>
                </div>
              </FieldGroup>
            </div>
            {/* Footer */}
            <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--gf-border)", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              <button onClick={saveTemplate} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "none", background: "#f97316", color: "#fff", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>
                Save Changes
              </button>
              <button onClick={closeDrawer} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--gf-border)", background: "rgba(127,127,127,0.12)", color: "var(--gf-text-secondary)", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>
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
            background: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)", borderRadius: "1rem",
            boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
            animation: "gf-slide-up 0.3s ease-out",
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--gf-border)" }}>
              <div>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--gf-text-primary)" }}>Preview: {templates[previewIndex].name}</h2>
                <span style={{ fontSize: "0.75rem", color: "var(--gf-text-muted)" }}>{templates[previewIndex].channel} channel</span>
              </div>
              <button onClick={() => setPreviewIndex(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gf-text-muted)" }}>
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
            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--gf-border)" }}>
              <button onClick={() => setPreviewIndex(null)} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--gf-border)", background: "rgba(127,127,127,0.12)", color: "var(--gf-text-secondary)", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>
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
            width: "26rem", background: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)", borderRadius: "1rem",
            boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
            padding: "2rem 1.5rem",
            animation: "gf-slide-up 0.3s ease-out",
            textAlign: "center",
          }}>
            <div style={{ width: "3rem", height: "3rem", borderRadius: "9999px", background: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
              <Trash2 style={{ width: "1.25rem", height: "1.25rem", color: "#ef4444" }} />
            </div>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--gf-text-primary)", marginBottom: "0.5rem" }}>Delete Template</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--gf-text-secondary)", lineHeight: 1.5, marginBottom: "1.5rem" }}>
              Are you sure you want to delete <strong style={{ color: "var(--gf-text-primary)" }}>{templates[deleteIndex].name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setDeleteIndex(null)} style={{ flex: 1, padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--gf-border)", background: "rgba(127,127,127,0.12)", color: "var(--gf-text-secondary)", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>
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
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1001,
            width: "700px", maxWidth: "90vw", maxHeight: "85vh",
            background: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)",
            borderRadius: "0.75rem",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
            display: "flex", flexDirection: "column", overflow: "hidden",
            animation: "gf-slide-up 0.3s ease-out",
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--gf-border)" }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--gf-text-primary)" }}>Create New Template</h2>
              <button onClick={closeCreate} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gf-text-muted)" }}>
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
                <span style={{ fontSize: "0.6875rem", color: "var(--gf-text-muted)" }}>
                  Supports placeholders: {"{{userName}}"}, {"{{orderId}}"}, etc.
                </span>
              </FieldGroup>
              {/* Status */}
              <FieldGroup label="Status">
                <div onClick={() => setCreateDraft({ ...createDraft, status: createDraft.status === "Active" ? "Draft" : "Active" })} style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", userSelect: "none" }}>
                  <div style={{ width: "2.75rem", height: "1.5rem", borderRadius: "9999px", background: createDraft.status === "Active" ? "#22c55e" : "rgba(127,127,127,0.35)", position: "relative", transition: "background 0.2s" }}>
                    <div style={{ position: "absolute", top: "0.125rem", left: createDraft.status === "Active" ? "1.375rem" : "0.125rem", width: "1.25rem", height: "1.25rem", borderRadius: "9999px", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                  </div>
                  <span style={{ fontSize: "0.875rem", fontWeight: 500, color: createDraft.status === "Active" ? "#22c55e" : "var(--gf-text-muted)" }}>{createDraft.status}</span>
                </div>
              </FieldGroup>

              {/* Live Preview */}
              {createDraft.body.trim() && (
                <div style={{ borderTop: "1px solid var(--gf-border)", paddingTop: "1.25rem" }}>
                  <h3 style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--gf-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Live Preview</h3>
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
            <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--gf-border)", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              <button onClick={saveNewTemplate} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "none", background: "#f97316", color: "#fff", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>
                Save Template
              </button>
              <button onClick={closeCreate} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--gf-border)", background: "rgba(127,127,127,0.12)", color: "var(--gf-text-secondary)", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--gf-text-primary)" }}>
            Notification Hub
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--gf-text-muted)", marginTop: "0.25rem" }}>
            Email, SMS, WhatsApp, and push notification management
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => setScheduleOpen(true)}
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.375rem",
              padding: "0.5rem 1rem", borderRadius: "0.5rem",
              border: "1px solid #f97316", background: "transparent",
              color: "#f97316", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer",
            }}
          >
            <Calendar style={{ width: "0.875rem", height: "0.875rem" }} />
            + Schedule
          </button>
          <button
            onClick={() => setBroadcastOpen(true)}
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.375rem",
              padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "none",
              background: "#f97316", color: "#fff", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer",
            }}
          >
            <Megaphone style={{ width: "0.875rem", height: "0.875rem" }} />
            Broadcast
          </button>
        </div>
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
            <Search style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", width: "0.875rem", height: "0.875rem", color: "var(--gf-text-muted)", pointerEvents: "none" }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              style={{
                width: "100%", padding: "0.5rem 0.75rem 0.5rem 2.25rem",
                fontSize: "0.8125rem", borderRadius: "0.5rem",
                border: "1px solid var(--gf-border)", background: "var(--gf-bg-surface)", color: "var(--gf-text-primary)",
                outline: "none",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#f97316")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--gf-border)")}
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
                border: "1px solid var(--gf-border)", background: "rgba(127,127,127,0.1)",
                color: "var(--gf-text-secondary)", fontSize: "0.8125rem", fontWeight: 500, cursor: "pointer",
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
            <Search style={{ width: "2rem", height: "2rem", color: "var(--gf-text-muted)", margin: "0 auto 0.75rem" }} />
            <p style={{ fontSize: "0.875rem", color: "var(--gf-text-muted)" }}>No templates found</p>
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
              {pagedTemplates.map((t, fi) => {
                const realIndex = templates.indexOf(t);
                const sc = templateStatusColor(t.status);
                return (
                  <tr
                    key={`${t.name}-${realIndex}`}
                    style={{ borderBottom: fi < pagedTemplates.length - 1 ? "1px solid var(--gf-border)" : "none", transition: "background 0.15s" }}
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
                        <button onClick={() => setPreviewIndex(realIndex)} title="Preview" style={actionBtnStyle("var(--gf-text-muted)")}>
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
        {/* Template Pagination */}
        {filteredTemplates.length > ROWS_PER_PAGE && (
          <Pagination current={templatePage} total={templateTotalPages} count={filteredTemplates.length} perPage={ROWS_PER_PAGE} onChange={setTemplatePage} />
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

        {/* Search & Filter Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 14rem" }}>
            <Search style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", width: "0.875rem", height: "0.875rem", color: "var(--gf-text-muted)", pointerEvents: "none" }} />
            <input
              type="text"
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              placeholder="Search by template or recipient..."
              style={{ width: "100%", padding: "0.5rem 0.75rem 0.5rem 2.25rem", fontSize: "0.8125rem", borderRadius: "0.5rem", border: "1px solid var(--gf-border)", background: "var(--gf-bg-surface)", color: "var(--gf-text-primary)", outline: "none" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#f97316")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--gf-border)")}
            />
          </div>
          <select value={logChannelFilter} onChange={(e) => setLogChannelFilter(e.target.value)} style={filterSelectStyle}>
            <option value="All">All Channels</option>
            <option value="Email">Email</option>
            <option value="SMS">SMS</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Push">Push</option>
          </select>
          <select value={logStatusFilter} onChange={(e) => setLogStatusFilter(e.target.value)} style={filterSelectStyle}>
            <option value="All">All Status</option>
            <option value="Delivered">Delivered</option>
            <option value="Failed">Failed</option>
            <option value="Pending">Pending</option>
            <option value="Bounced">Bounced</option>
          </select>
          {logFiltersActive && (
            <button onClick={clearLogFilters} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--gf-border)", background: "rgba(127,127,127,0.1)", color: "var(--gf-text-secondary)", fontSize: "0.8125rem", fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}>
              <FilterX style={{ width: "0.875rem", height: "0.875rem" }} />
              Clear Filters
            </button>
          )}
        </div>

        {filteredLogs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
            <Search style={{ width: "2rem", height: "2rem", color: "var(--gf-text-muted)", margin: "0 auto 0.75rem" }} />
            <p style={{ fontSize: "0.875rem", color: "var(--gf-text-muted)" }}>No delivery logs found</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["Template", "Channel", "Recipient", "Status", "Time"].map((col) => (
                  <th key={col} style={thStyle}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedLogs.map((log, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: i < pagedLogs.length - 1 ? "1px solid var(--gf-border)" : "none", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(249,115,22,0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                >
                  <td style={tdPrimary}>{log.template}</td>
                  <td style={tdSecondary}>{log.channel}</td>
                  <td style={tdSecondary}>{log.recipient}</td>
                  <td style={{ padding: "0.75rem", fontSize: "0.875rem", fontWeight: 500, color: deliveryStatusColor(log.status) }}>{log.status}</td>
                  <td style={{ padding: "0.75rem", fontSize: "0.75rem", color: "var(--gf-text-muted)", whiteSpace: "nowrap" }}>{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Log Pagination */}
        {filteredLogs.length > ROWS_PER_PAGE && (
          <Pagination current={logPage} total={logTotalPages} count={filteredLogs.length} perPage={ROWS_PER_PAGE} onChange={setLogPage} />
        )}
      </div>

      {/* Retry Rules */}
      <div>
        <h2 style={sectionTitle}>Retry Rules</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
          {retryRulesState.map((rule) => (
            <div key={rule.channel} style={{ ...cardStyle, position: "relative" }}>
              <button
                onClick={() => {
                  setEditRetryChannel(rule.channel);
                  const parts = rule.interval.split(" ");
                  setRetryForm({ maxRetries: rule.maxRetries, intervalVal: parseInt(parts[0]) || 5, intervalUnit: parts[1] === "hours" || parts[1] === "hr" ? "hours" : "min", backoff: rule.backoff });
                }}
                style={{ position: "absolute", top: "0.75rem", right: "0.75rem", background: "none", border: "none", cursor: "pointer", color: "var(--gf-text-muted)", padding: "0.25rem" }}
                title="Edit retry rule"
              >
                <Pencil style={{ width: "0.875rem", height: "0.875rem" }} />
              </button>
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

      {/* Channel Settings — PART 4 */}
      <div>
        <h2 style={sectionTitle}>Channel Settings</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
          {chSettings.map((ch) => (
            <div key={ch.channel} style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <ch.icon style={{ width: "1.125rem", height: "1.125rem", color: "var(--gf-accent)" }} />
                  <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--gf-text-primary)" }}>{ch.channel}</span>
                </div>
                {/* ON/OFF Toggle */}
                <div
                  onClick={() => {
                    if (ch.enabled) {
                      const activeCount = chSettings.filter((c) => c.enabled).length;
                      if (activeCount <= 1) {
                        setToast({ message: "At least one channel must remain active", type: "error" });
                        return;
                      }
                    }
                    setChSettings((prev) => prev.map((c) => c.channel === ch.channel ? { ...c, enabled: !c.enabled } : c));
                    setToast({ message: `${ch.channel} channel ${ch.enabled ? "disabled" : "enabled"} \u2713`, type: "success" });
                  }}
                  style={{ width: "2.5rem", height: "1.25rem", borderRadius: "9999px", background: ch.enabled ? "#22c55e" : "rgba(127,127,127,0.35)", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}
                >
                  <div style={{ position: "absolute", top: "0.125rem", left: ch.enabled ? "1.375rem" : "0.125rem", width: "1rem", height: "1rem", borderRadius: "9999px", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--gf-text-muted)" }}>Provider: <span style={{ color: "var(--gf-text-primary)", fontWeight: 500 }}>{ch.provider}</span></span>
                <span style={{ fontSize: "0.75rem", color: "var(--gf-text-muted)" }}>Daily Limit: <span style={{ color: "var(--gf-text-primary)", fontWeight: 500 }}>{ch.dailyLimit.toLocaleString()} /user</span></span>
                <span style={{ fontSize: "0.75rem", color: "var(--gf-text-muted)" }}>Status: <span style={{ color: ch.enabled ? "#22c55e" : "#ef4444", fontWeight: 500 }}>{ch.enabled ? "Active" : "Disabled"}</span></span>
              </div>
              <button
                onClick={() => {
                  setEditChSetting(ch);
                  setChForm({ provider: ch.provider, dailyLimit: ch.dailyLimit, apiKey: ch.apiKey });
                  setShowChApiKey(false);
                }}
                style={{
                  marginTop: "0.75rem", width: "100%", padding: "0.5rem", borderRadius: "0.5rem",
                  border: "1px solid var(--gf-border)", background: "rgba(127,127,127,0.08)",
                  color: "var(--gf-text-secondary)", fontSize: "0.75rem", fontWeight: 500, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem",
                }}
              >
                <Settings style={{ width: "0.75rem", height: "0.75rem" }} /> Edit Settings
              </button>
            </div>
          ))}
        </div>

        {/* Fallback Rules */}
        <div style={{ marginTop: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--gf-text-primary)" }}>Fallback Rules</h3>
            <div style={{ position: "relative", display: "inline-flex" }} title="If primary channel fails, send via fallback">
              <Info style={{ width: "0.875rem", height: "0.875rem", color: "var(--gf-text-muted)", cursor: "help" }} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {fallbackRules.map((rule) => (
              <div key={rule.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--gf-border)", background: "var(--gf-bg-surface)" }}>
                <select
                  value={rule.primary}
                  onChange={(e) => setFallbackRules((prev) => prev.map((r) => r.id === rule.id ? { ...r, primary: e.target.value } : r))}
                  style={{ ...filterSelectStyle, flex: 1 }}
                >
                  {["Email", "SMS", "WhatsApp", "Push"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <span style={{ fontSize: "0.75rem", color: "var(--gf-text-muted)", fontWeight: 500 }}>fails →</span>
                <select
                  value={rule.fallback}
                  onChange={(e) => setFallbackRules((prev) => prev.map((r) => r.id === rule.id ? { ...r, fallback: e.target.value } : r))}
                  style={{ ...filterSelectStyle, flex: 1 }}
                >
                  {["Email", "SMS", "WhatsApp", "Push"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <button
                  onClick={() => setFallbackRules((prev) => prev.filter((r) => r.id !== rule.id))}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "0.25rem" }}
                  title="Delete rule"
                >
                  <Trash2 style={{ width: "0.875rem", height: "0.875rem" }} />
                </button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem" }}>
            <button
              onClick={() => { setFallbackRules((prev) => [...prev, { id: nextFbId, primary: "Email", fallback: "SMS" }]); setNextFbId((p) => p + 1); }}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.375rem",
                padding: "0.5rem 0.75rem", borderRadius: "0.5rem",
                border: "1px solid var(--gf-border)", background: "rgba(127,127,127,0.08)",
                color: "var(--gf-text-secondary)", fontSize: "0.8125rem", fontWeight: 500, cursor: "pointer",
              }}
            >
              <Plus style={{ width: "0.875rem", height: "0.875rem" }} /> Add Fallback Rule
            </button>
            <button
              onClick={() => setToast({ message: "Fallback rules saved \u2713", type: "success" })}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.375rem",
                padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "none",
                background: "#f97316", color: "#fff", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer",
              }}
            >
              Save Fallback Rules
            </button>
          </div>
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
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                  <button
                    onClick={() => { setOptOutChannel(pref.channel); setOptOutSearch(""); }}
                    style={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem",
                      padding: "0.375rem 0.5rem", borderRadius: "0.375rem",
                      border: "1px solid var(--gf-border)", background: "transparent",
                      color: "var(--gf-text-secondary)", fontSize: "0.6875rem", fontWeight: 500, cursor: "pointer",
                    }}
                  >
                    <Eye style={{ width: "0.75rem", height: "0.75rem" }} /> View Opt-outs
                  </button>
                  <button
                    onClick={() => {
                      const data = optOutData[pref.channel] || [];
                      const headers = "User Name,Contact,Opted Out On,Reason";
                      const rows = data.map((u) => [u.name, u.contact, u.date, u.reason].map((v) => `"${v}"`).join(","));
                      const csv = [headers, ...rows].join("\n");
                      const blob = new Blob([csv], { type: "text/csv" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      const today = new Date().toISOString().split("T")[0];
                      a.href = url;
                      a.download = `glimmora-optouts-${pref.channel.toLowerCase()}-${today}.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                      setToast({ message: "Opt-out list exported \u2713", type: "success" });
                    }}
                    style={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem",
                      padding: "0.375rem 0.5rem", borderRadius: "0.375rem",
                      border: "1px solid #f97316", background: "transparent",
                      color: "#f97316", fontSize: "0.6875rem", fontWeight: 500, cursor: "pointer",
                    }}
                  >
                    <Download style={{ width: "0.75rem", height: "0.75rem" }} /> Export CSV
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scheduled Queue — PART 2 */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <Calendar style={{ width: "1.125rem", height: "1.125rem", color: "var(--gf-accent)" }} />
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--gf-text-primary)" }}>Scheduled Queue</h2>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
              {["Template", "Channel", "Recipient", "Scheduled At", "Repeat", "Status", "Actions"].map((col) => (
                <th key={col} style={thStyle}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scheduledQueue.map((item) => (
              <tr key={item.id} style={{ borderBottom: "1px solid var(--gf-border)" }}>
                <td style={tdPrimary}>{item.template}</td>
                <td style={tdSecondary}>{item.channel}</td>
                <td style={tdSecondary}>{item.recipient}</td>
                <td style={{ ...tdSecondary, fontSize: "0.75rem", whiteSpace: "nowrap" }}>{item.scheduledAt}</td>
                <td style={tdSecondary}>{item.repeat}</td>
                <td style={{ padding: "0.75rem" }}>
                  <span style={{
                    fontSize: "0.75rem", fontWeight: 500, borderRadius: "9999px", padding: "0.125rem 0.5rem",
                    color: item.status === "Scheduled" ? "#3b82f6" : item.status === "Sent" ? "#22c55e" : "#6b7280",
                    background: item.status === "Scheduled" ? "rgba(59,130,246,0.12)" : item.status === "Sent" ? "rgba(34,197,94,0.12)" : "rgba(107,114,128,0.12)",
                  }}>
                    {item.status}
                  </span>
                </td>
                <td style={{ padding: "0.75rem" }}>
                  {item.status === "Scheduled" && (
                    <button
                      onClick={() => {
                        setScheduledQueue((prev) => prev.map((q) => q.id === item.id ? { ...q, status: "Cancelled" as const } : q));
                        setToast({ message: "Scheduled notification cancelled \u2713", type: "error" });
                      }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "0.25rem" }}
                      title="Cancel scheduled notification"
                    >
                      <Trash2 style={{ width: "0.875rem", height: "0.875rem" }} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================================================================= */}
      {/* BROADCAST MODAL — PART 1                                          */}
      {/* ================================================================= */}
      {broadcastOpen && createPortal(
        <>
          <div onClick={() => { setBroadcastOpen(false); setBcConfirm(false); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, animation: "gf-fade-in 0.2s ease-out" }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 10000,
            width: "36rem", maxWidth: "90vw", maxHeight: "85vh", overflowY: "auto",
            background: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)", borderRadius: "1rem",
            boxShadow: "0 24px 48px rgba(0,0,0,0.3)", animation: "gf-slide-up 0.3s ease-out",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--gf-border)" }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--gf-text-primary)" }}>Send Broadcast Notification</h2>
              <button onClick={() => { setBroadcastOpen(false); setBcConfirm(false); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gf-text-muted)" }}><X style={{ width: "1.25rem", height: "1.25rem" }} /></button>
            </div>
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Channels */}
              <FieldGroup label="Channel">
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  {(["Email", "SMS", "WhatsApp", "Push"] as const).map((ch) => (
                    <label key={ch} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem", color: "var(--gf-text-primary)" }}>
                      <input type="checkbox" checked={bcChannels[ch]} onChange={() => setBcChannels((p) => ({ ...p, [ch]: !p[ch] }))} style={{ accentColor: "#f97316" }} />
                      {ch}
                    </label>
                  ))}
                </div>
              </FieldGroup>
              {/* Template */}
              <FieldGroup label="Template">
                <select value={bcTemplate} onChange={(e) => setBcTemplate(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="">Select a template...</option>
                  {templates.filter((t) => t.status === "Active").map((t) => <option key={t.name} value={t.name}>{t.name} ({t.channel})</option>)}
                </select>
              </FieldGroup>
              {/* Audience */}
              <FieldGroup label="Audience">
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {([["all", "All Users"], ["opted", "Opted-in Only (recommended)"], ["segment", "Specific Segment"]] as const).map(([val, label]) => (
                    <label key={val} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem", color: "var(--gf-text-primary)" }}>
                      <input type="radio" name="bc-audience" checked={bcAudience === val} onChange={() => setBcAudience(val)} style={{ accentColor: "#f97316" }} />
                      {label}
                    </label>
                  ))}
                  {bcAudience === "segment" && (
                    <input type="text" value={bcSegment} onChange={(e) => setBcSegment(e.target.value)} placeholder="Enter segment name..." style={{ ...inputStyle, marginLeft: "1.5rem" }} />
                  )}
                </div>
              </FieldGroup>
              {/* Estimated Reach */}
              <div style={{ padding: "0.75rem", borderRadius: "0.5rem", background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)" }}>
                <span style={{ fontSize: "0.8125rem", color: "#f97316", fontWeight: 500 }}>
                  ~{bcAudience === "all" ? "4,700" : bcAudience === "opted" ? "4,520" : "1,200"} users will receive this across {Object.values(bcChannels).filter(Boolean).length} channel(s)
                </span>
              </div>
              {/* Preview */}
              {bcTemplate && (() => {
                const tpl = templates.find((t) => t.name === bcTemplate);
                if (!tpl) return null;
                return (
                  <div style={{ borderTop: "1px solid var(--gf-border)", paddingTop: "1rem" }}>
                    <h3 style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--gf-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Preview</h3>
                    <div style={{ transform: "scale(0.75)", transformOrigin: "top left", width: "133%" }}>
                      {tpl.channel === "Email" && <EmailPreview template={tpl} />}
                      {tpl.channel === "SMS" && <SMSPreview template={tpl} />}
                      {tpl.channel === "WhatsApp" && <WhatsAppPreview template={tpl} />}
                      {tpl.channel === "Push" && <PushPreview template={tpl} />}
                    </div>
                  </div>
                );
              })()}

              {/* Confirmation */}
              {bcConfirm && (
                <div style={{ padding: "0.75rem", borderRadius: "0.5rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <p style={{ fontSize: "0.8125rem", color: "#ef4444", fontWeight: 500, marginBottom: "0.75rem" }}>
                    Send to ~{bcAudience === "all" ? "4,700" : bcAudience === "opted" ? "4,520" : "1,200"} users across {Object.values(bcChannels).filter(Boolean).length} channel(s). This cannot be undone.
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => { setBroadcastOpen(false); setBcConfirm(false); setToast({ message: "Broadcast queued successfully \u2713", type: "success" }); }} style={{ flex: 1, padding: "0.625rem", borderRadius: "0.5rem", border: "none", background: "#22c55e", color: "#fff", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer" }}>
                      Yes, Send
                    </button>
                    <button onClick={() => setBcConfirm(false)} style={{ flex: 1, padding: "0.625rem", borderRadius: "0.5rem", border: "1px solid var(--gf-border)", background: "rgba(127,127,127,0.12)", color: "var(--gf-text-secondary)", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* Footer */}
            {!bcConfirm && (
              <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--gf-border)", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                <button onClick={() => setBcConfirm(true)} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "none", background: "#f97316", color: "#fff", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>
                  Send Broadcast
                </button>
                <button onClick={() => setBroadcastOpen(false)} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--gf-border)", background: "rgba(127,127,127,0.12)", color: "var(--gf-text-secondary)", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </>,
        document.body
      )}

      {/* ================================================================= */}
      {/* SCHEDULE DRAWER — PART 2                                          */}
      {/* ================================================================= */}
      {scheduleOpen && createPortal(
        <>
          <div onClick={() => setScheduleOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, animation: "gf-fade-in 0.2s ease-out" }} />
          <div style={{
            position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 10000,
            width: "28rem", maxWidth: "90vw",
            background: "var(--gf-bg-surface)", borderLeft: "1px solid var(--gf-border)",
            boxShadow: "0 24px 48px rgba(0,0,0,0.3)", animation: "gf-slide-right 0.3s ease-out",
            display: "flex", flexDirection: "column",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--gf-border)" }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--gf-text-primary)" }}>Schedule Notification</h2>
              <button onClick={() => setScheduleOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gf-text-muted)" }}><X style={{ width: "1.25rem", height: "1.25rem" }} /></button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <FieldGroup label="Template">
                <select value={schTemplate} onChange={(e) => setSchTemplate(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="">Select template...</option>
                  {templates.filter((t) => t.status === "Active").map((t) => <option key={t.name} value={t.name}>{t.name}</option>)}
                </select>
              </FieldGroup>
              <FieldGroup label="Channel">
                <select value={schChannel} onChange={(e) => setSchChannel(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                  {["Email", "SMS", "WhatsApp", "Push"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </FieldGroup>
              <FieldGroup label="Recipient">
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.375rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--gf-text-muted)" }}>Send to All</span>
                  <div
                    onClick={() => setSchSendAll((p) => !p)}
                    style={{ width: "2.25rem", height: "1.125rem", borderRadius: "9999px", background: schSendAll ? "#22c55e" : "rgba(127,127,127,0.35)", position: "relative", cursor: "pointer", transition: "background 0.2s" }}
                  >
                    <div style={{ position: "absolute", top: "0.0625rem", left: schSendAll ? "1.1875rem" : "0.0625rem", width: "1rem", height: "1rem", borderRadius: "9999px", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                  </div>
                </div>
                {!schSendAll && <input type="text" value={schRecipient} onChange={(e) => setSchRecipient(e.target.value)} placeholder="email / phone / token" style={inputStyle} />}
              </FieldGroup>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <div style={{ flex: 1 }}>
                  <FieldGroup label="Date"><input type="date" value={schDate} onChange={(e) => setSchDate(e.target.value)} style={inputStyle} /></FieldGroup>
                </div>
                <div style={{ flex: 1 }}>
                  <FieldGroup label="Time"><input type="time" value={schTime} onChange={(e) => setSchTime(e.target.value)} style={inputStyle} /></FieldGroup>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <div style={{ flex: 1 }}>
                  <FieldGroup label="Timezone">
                    <select value={schTimezone} onChange={(e) => setSchTimezone(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                      {["IST", "UTC", "EST", "PST"].map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                    </select>
                  </FieldGroup>
                </div>
                <div style={{ flex: 1 }}>
                  <FieldGroup label="Repeat">
                    <select value={schRepeat} onChange={(e) => setSchRepeat(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                      {["Once", "Daily", "Weekly", "Monthly"].map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </FieldGroup>
                </div>
              </div>
              <FieldGroup label="Notes (optional)">
                <textarea value={schNotes} onChange={(e) => setSchNotes(e.target.value)} rows={3} placeholder="Add notes..." style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
              </FieldGroup>
              {/* Live Preview */}
              {schTemplate && (() => {
                const tpl = templates.find((t) => t.name === schTemplate);
                if (!tpl) return null;
                return (
                  <div style={{ borderTop: "1px solid var(--gf-border)", paddingTop: "1rem" }}>
                    <h3 style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--gf-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Preview</h3>
                    <div style={{ transform: "scale(0.7)", transformOrigin: "top left", width: "142%" }}>
                      {tpl.channel === "Email" && <EmailPreview template={tpl} />}
                      {tpl.channel === "SMS" && <SMSPreview template={tpl} />}
                      {tpl.channel === "WhatsApp" && <WhatsAppPreview template={tpl} />}
                      {tpl.channel === "Push" && <PushPreview template={tpl} />}
                    </div>
                  </div>
                );
              })()}
            </div>
            <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--gf-border)", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              <button
                onClick={() => {
                  if (!schTemplate || (!schSendAll && !schRecipient) || !schDate || !schTime) return;
                  const dateObj = new Date(`${schDate}T${schTime}`);
                  const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
                  const timeStr = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
                  const newItem: ScheduledNotification = {
                    id: nextSchId, template: schTemplate, channel: schChannel,
                    recipient: schSendAll ? "All Users" : schRecipient,
                    scheduledAt: `${dateStr} ${timeStr} ${schTimezone}`, repeat: schRepeat, status: "Scheduled",
                  };
                  setScheduledQueue((prev) => [newItem, ...prev]);
                  setNextSchId((p) => p + 1);
                  setScheduleOpen(false);
                  setSchTemplate(""); setSchRecipient(""); setSchSendAll(false); setSchDate(""); setSchTime(""); setSchNotes("");
                  setToast({ message: `Notification scheduled for ${dateStr} ${timeStr} ${schTimezone} \u2713`, type: "success" });
                }}
                style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "none", background: "#f97316", color: "#fff", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}
              >
                Schedule
              </button>
              <button onClick={() => setScheduleOpen(false)} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--gf-border)", background: "rgba(127,127,127,0.12)", color: "var(--gf-text-secondary)", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* ================================================================= */}
      {/* EDIT RETRY RULE MODAL — PART 3                                    */}
      {/* ================================================================= */}
      {editRetryChannel !== null && createPortal(
        <>
          <div onClick={() => setEditRetryChannel(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, animation: "gf-fade-in 0.2s ease-out" }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 10000,
            width: "26rem", maxWidth: "90vw", background: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)", borderRadius: "1rem",
            boxShadow: "0 24px 48px rgba(0,0,0,0.3)", animation: "gf-slide-up 0.3s ease-out",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--gf-border)" }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--gf-text-primary)" }}>Edit Retry Rule — {editRetryChannel}</h2>
              <button onClick={() => setEditRetryChannel(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gf-text-muted)" }}><X style={{ width: "1.25rem", height: "1.25rem" }} /></button>
            </div>
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <FieldGroup label="Channel">
                <div style={{ padding: "0.625rem 0.75rem", fontSize: "0.875rem", borderRadius: "0.5rem", border: "1px solid var(--gf-border)", background: "var(--gf-bg-base)", color: "var(--gf-text-muted)" }}>{editRetryChannel}</div>
              </FieldGroup>
              <FieldGroup label="Max Retries">
                <input type="number" min={1} max={10} value={retryForm.maxRetries} onChange={(e) => setRetryForm({ ...retryForm, maxRetries: Number(e.target.value) })} style={inputStyle} />
              </FieldGroup>
              <FieldGroup label="Interval">
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input type="number" min={1} value={retryForm.intervalVal} onChange={(e) => setRetryForm({ ...retryForm, intervalVal: Number(e.target.value) })} style={{ ...inputStyle, flex: 1 }} />
                  <select value={retryForm.intervalUnit} onChange={(e) => setRetryForm({ ...retryForm, intervalUnit: e.target.value as "min" | "hours" })} style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="min">minutes</option>
                    <option value="hours">hours</option>
                  </select>
                </div>
              </FieldGroup>
              <FieldGroup label="Backoff Type">
                <select value={retryForm.backoff} onChange={(e) => setRetryForm({ ...retryForm, backoff: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="Linear">Linear</option>
                  <option value="Exponential">Exponential</option>
                </select>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.375rem", marginTop: "0.25rem" }}>
                  <Info style={{ width: "0.75rem", height: "0.75rem", color: "var(--gf-text-muted)", flexShrink: 0, marginTop: "0.125rem" }} />
                  <span style={{ fontSize: "0.6875rem", color: "var(--gf-text-muted)", lineHeight: 1.4 }}>
                    {retryForm.backoff === "Linear" ? "Retry every same interval (e.g. 5min, 5min, 5min)" : "Interval doubles each retry (e.g. 5min, 10min, 20min)"}
                  </span>
                </div>
              </FieldGroup>
            </div>
            <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--gf-border)", display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setEditRetryChannel(null)} style={{ flex: 1, padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--gf-border)", background: "rgba(127,127,127,0.12)", color: "var(--gf-text-secondary)", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
              <button
                onClick={() => {
                  setRetryRulesState((prev) => prev.map((r) => r.channel === editRetryChannel ? { ...r, maxRetries: retryForm.maxRetries, interval: `${retryForm.intervalVal} ${retryForm.intervalUnit}`, backoff: retryForm.backoff } : r));
                  setEditRetryChannel(null);
                  setToast({ message: "Retry rule updated \u2713", type: "success" });
                }}
                style={{ flex: 1, padding: "0.75rem", borderRadius: "0.5rem", border: "none", background: "#f97316", color: "#fff", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}
              >
                Save
              </button>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* ================================================================= */}
      {/* EDIT CHANNEL SETTINGS MODAL — PART 4                              */}
      {/* ================================================================= */}
      {editChSetting !== null && createPortal(
        <>
          <div onClick={() => setEditChSetting(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, animation: "gf-fade-in 0.2s ease-out" }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 10000,
            width: "26rem", maxWidth: "90vw", background: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)", borderRadius: "1rem",
            boxShadow: "0 24px 48px rgba(0,0,0,0.3)", animation: "gf-slide-up 0.3s ease-out",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--gf-border)" }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--gf-text-primary)" }}>Edit {editChSetting.channel} Settings</h2>
              <button onClick={() => setEditChSetting(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gf-text-muted)" }}><X style={{ width: "1.25rem", height: "1.25rem" }} /></button>
            </div>
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <FieldGroup label="Provider">
                <select value={chForm.provider} onChange={(e) => setChForm({ ...chForm, provider: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                  {editChSetting.providers.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </FieldGroup>
              <FieldGroup label="Daily Limit (per user)">
                <input type="number" min={0} value={chForm.dailyLimit} onChange={(e) => setChForm({ ...chForm, dailyLimit: Number(e.target.value) })} style={inputStyle} />
              </FieldGroup>
              <FieldGroup label="API Key">
                <div style={{ position: "relative" }}>
                  <input type={showChApiKey ? "text" : "password"} value={chForm.apiKey} onChange={(e) => setChForm({ ...chForm, apiKey: e.target.value })} style={{ ...inputStyle, paddingRight: "2.5rem", width: "100%", boxSizing: "border-box" }} />
                  <button
                    onClick={() => setShowChApiKey((p) => !p)}
                    style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--gf-text-muted)", padding: "0.25rem" }}
                  >
                    {showChApiKey ? <EyeOff style={{ width: "1rem", height: "1rem" }} /> : <Eye style={{ width: "1rem", height: "1rem" }} />}
                  </button>
                </div>
              </FieldGroup>
            </div>
            <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--gf-border)", display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setEditChSetting(null)} style={{ flex: 1, padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--gf-border)", background: "rgba(127,127,127,0.12)", color: "var(--gf-text-secondary)", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
              <button
                onClick={() => {
                  setChSettings((prev) => prev.map((c) => c.channel === editChSetting.channel ? { ...c, provider: chForm.provider, dailyLimit: chForm.dailyLimit, apiKey: chForm.apiKey } : c));
                  setEditChSetting(null);
                  setToast({ message: `${editChSetting.channel} settings saved \u2713`, type: "success" });
                }}
                style={{ flex: 1, padding: "0.75rem", borderRadius: "0.5rem", border: "none", background: "#f97316", color: "#fff", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}
              >
                Save
              </button>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* ================================================================= */}
      {/* VIEW OPT-OUTS MODAL — PART 5                                      */}
      {/* ================================================================= */}
      {optOutChannel !== null && createPortal(
        <>
          <div onClick={() => setOptOutChannel(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, animation: "gf-fade-in 0.2s ease-out" }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 10000,
            width: "36rem", maxWidth: "90vw", maxHeight: "85vh",
            background: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)", borderRadius: "1rem",
            boxShadow: "0 24px 48px rgba(0,0,0,0.3)", animation: "gf-slide-up 0.3s ease-out",
            display: "flex", flexDirection: "column", overflow: "hidden",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--gf-border)" }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--gf-text-primary)" }}>{optOutChannel} Opt-outs</h2>
              <button onClick={() => setOptOutChannel(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gf-text-muted)" }}><X style={{ width: "1.25rem", height: "1.25rem" }} /></button>
            </div>
            <div style={{ padding: "1rem 1.5rem 0" }}>
              <div style={{ position: "relative" }}>
                <Search style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", width: "0.875rem", height: "0.875rem", color: "var(--gf-text-muted)", pointerEvents: "none" }} />
                <input
                  type="text" value={optOutSearch} onChange={(e) => setOptOutSearch(e.target.value)}
                  placeholder="Search by name or contact..."
                  style={{ width: "100%", padding: "0.5rem 0.75rem 0.5rem 2.25rem", fontSize: "0.8125rem", borderRadius: "0.5rem", border: "1px solid var(--gf-border)", background: "var(--gf-bg-base)", color: "var(--gf-text-primary)", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                    {["User Name", "Contact", "Opted Out On", "Reason"].map((col) => (
                      <th key={col} style={thStyle}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(optOutData[optOutChannel] || [])
                    .filter((u) => {
                      if (!optOutSearch) return true;
                      const q = optOutSearch.toLowerCase();
                      return u.name.toLowerCase().includes(q) || u.contact.toLowerCase().includes(q);
                    })
                    .map((u, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--gf-border)" }}>
                        <td style={tdPrimary}>{u.name}</td>
                        <td style={tdSecondary}>{u.contact}</td>
                        <td style={{ ...tdSecondary, fontSize: "0.75rem", whiteSpace: "nowrap" }}>{u.date}</td>
                        <td style={tdSecondary}>{u.reason}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--gf-border)" }}>
              <button onClick={() => setOptOutChannel(null)} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--gf-border)", background: "rgba(127,127,127,0.12)", color: "var(--gf-text-secondary)", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>
                Close
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
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
  border: "1px solid var(--gf-border)",
  background: "var(--gf-bg-base)",
  color: "var(--gf-text-primary)",
  outline: "none",
};

const filterSelectStyle: React.CSSProperties = {
  padding: "0.5rem 0.75rem",
  fontSize: "0.8125rem",
  borderRadius: "0.5rem",
  border: "1px solid var(--gf-border)",
  background: "var(--gf-bg-surface)",
  color: "var(--gf-text-primary)",
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
      <label style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--gf-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Pagination({ current, total, count, perPage, onChange }: {
  current: number; total: number; count: number; perPage: number; onChange: (p: number) => void;
}) {
  const start = (current - 1) * perPage + 1;
  const end = Math.min(current * perPage, count);

  const pageBtnBase: React.CSSProperties = {
    padding: "0.375rem 0.75rem",
    fontSize: "0.8125rem",
    fontWeight: 500,
    borderRadius: "0.375rem",
    border: "1px solid var(--gf-border)",
    cursor: "pointer",
    transition: "all 0.15s",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "1rem", borderTop: "1px solid var(--gf-border)", marginTop: "0.75rem" }}>
      <span style={{ fontSize: "0.8125rem", color: "var(--gf-text-muted)" }}>
        Showing {start}-{end} of {count} results
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
        <button
          onClick={() => onChange(current - 1)}
          disabled={current === 1}
          style={{
            ...pageBtnBase,
            background: current === 1 ? "rgba(127,127,127,0.08)" : "var(--gf-bg-surface)",
            color: current === 1 ? "var(--gf-text-muted)" : "var(--gf-text-primary)",
            cursor: current === 1 ? "not-allowed" : "pointer",
          }}
        >
          Previous
        </button>
        {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            style={{
              ...pageBtnBase,
              background: p === current ? "#f97316" : "var(--gf-bg-surface)",
              color: p === current ? "#fff" : "var(--gf-text-secondary)",
              border: p === current ? "1px solid #f97316" : "1px solid var(--gf-border)",
            }}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onChange(current + 1)}
          disabled={current === total}
          style={{
            ...pageBtnBase,
            background: current === total ? "rgba(127,127,127,0.08)" : "var(--gf-bg-surface)",
            color: current === total ? "var(--gf-text-muted)" : "var(--gf-text-primary)",
            cursor: current === total ? "not-allowed" : "pointer",
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
