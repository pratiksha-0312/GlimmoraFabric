import { NextResponse } from "next/server";

export interface TemplateRecord {
  id: string;
  name: string;
  subject: string;
  channel: "email" | "sms" | "push" | "in-app";
  category: "security" | "billing" | "system" | "team" | "onboarding" | "marketing";
  status: "active" | "draft" | "archived";
  bodyHtml: string;
  bodyText: string;
  version: number;
  variables: string[];
  lastEdited: string;
  editedBy: string;
  usageCount: number;
}

const globalKey = "__gf_templates__";
type G = typeof globalThis & { [globalKey]?: TemplateRecord[] };
const g = globalThis as G;

const templates: TemplateRecord[] = (g[globalKey] ??= [
  { id: "tpl-001", name: "Welcome Email", subject: "Welcome to {{tenant_name}}!", channel: "email", category: "onboarding", status: "active", bodyHtml: "<h1>Welcome aboard, {{user_name}}!</h1><p>We're excited to have you on <strong>{{tenant_name}}</strong>.</p>", bodyText: "Welcome aboard, {{user_name}}! We're excited to have you on {{tenant_name}}.", version: 3, variables: ["user_name", "tenant_name"], lastEdited: "2026-04-07 14:30", editedBy: "Vanshika Keswani", usageCount: 1245 },
  { id: "tpl-002", name: "Password Reset", subject: "Reset your password", channel: "email", category: "security", status: "active", bodyHtml: "<h2>Password Reset Request</h2><p>Hi {{user_name}}, click to reset: <a href='{{reset_url}}'>Reset Password</a></p>", bodyText: "Hi {{user_name}}, reset your password at {{reset_url}}.", version: 5, variables: ["user_name", "reset_url"], lastEdited: "2026-04-06 10:15", editedBy: "Vanshika Keswani", usageCount: 890 },
  { id: "tpl-003", name: "Invoice Generated", subject: "Your invoice #{{invoice_id}} is ready", channel: "email", category: "billing", status: "active", bodyHtml: "<h2>Invoice Ready</h2><p>Your invoice #{{invoice_id}} for {{amount}} is ready.</p>", bodyText: "Your invoice #{{invoice_id}} for {{amount}} is ready.", version: 2, variables: ["invoice_id", "amount"], lastEdited: "2026-04-05 16:45", editedBy: "Pratiksha M.", usageCount: 3420 },
  { id: "tpl-004", name: "Two-Factor Code", subject: "Your verification code: {{code}}", channel: "sms", category: "security", status: "active", bodyHtml: "", bodyText: "Your {{tenant_name}} verification code is {{code}}.", version: 1, variables: ["tenant_name", "code"], lastEdited: "2026-04-04 09:00", editedBy: "Vanshika Keswani", usageCount: 5670 },
  { id: "tpl-005", name: "New Login Alert", subject: "New sign-in detected", channel: "push", category: "security", status: "active", bodyHtml: "", bodyText: "New sign-in from {{device}} in {{location}}.", version: 2, variables: ["device", "location"], lastEdited: "2026-04-03 11:20", editedBy: "Pratiksha M.", usageCount: 2100 },
  { id: "tpl-006", name: "Task Assigned", subject: "You have a new task: {{task_name}}", channel: "in-app", category: "team", status: "active", bodyHtml: "", bodyText: "{{assigner}} assigned you \"{{task_name}}\", due {{due_date}}.", version: 4, variables: ["assigner", "task_name", "due_date"], lastEdited: "2026-04-02 15:30", editedBy: "Vanshika Keswani", usageCount: 4500 },
]);

export function getTemplates() {
  return templates;
}

export async function GET() {
  return NextResponse.json(templates);
}
