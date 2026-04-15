import { NextRequest, NextResponse } from "next/server";

export interface WebhookRecord {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: "active" | "inactive" | "failing";
  secret: string;
  createdAt: string;
  lastTriggered: string | null;
  successRate: number;
  totalDeliveries: number;
  failedDeliveries: number;
  retryPolicy: "none" | "linear" | "exponential";
  timeout: number;
  headers: Record<string, string>;
}

const globalKey = "__gf_webhooks__";
type G = typeof globalThis & { [globalKey]?: WebhookRecord[] };
const g = globalThis as G;

const webhooks: WebhookRecord[] = (g[globalKey] ??= [
  { id: "wh-001", name: "Slack Notifications", url: "https://hooks.slack.com/services/T0123/B4567/abc123xyz", events: ["user.created", "payment.completed", "payment.failed"], status: "active", secret: "whsec_sk_live_abc123def456", createdAt: "2026-03-15", lastTriggered: "2026-04-07 14:30", successRate: 99.2, totalDeliveries: 1245, failedDeliveries: 10, retryPolicy: "exponential", timeout: 30, headers: { "X-Custom-Source": "glimmora" } },
  { id: "wh-002", name: "CRM Sync", url: "https://api.salesforce.com/webhooks/glimmora", events: ["user.created", "user.updated", "tenant.created"], status: "active", secret: "whsec_crm_9876xyz", createdAt: "2026-03-20", lastTriggered: "2026-04-07 13:15", successRate: 97.5, totalDeliveries: 890, failedDeliveries: 22, retryPolicy: "linear", timeout: 15, headers: {} },
  { id: "wh-003", name: "Analytics Pipeline", url: "https://analytics.internal.glimmora.com/ingest", events: ["payment.completed", "invoice.generated", "invoice.paid"], status: "active", secret: "whsec_analytics_qwe789", createdAt: "2026-02-28", lastTriggered: "2026-04-07 12:00", successRate: 100, totalDeliveries: 3420, failedDeliveries: 0, retryPolicy: "exponential", timeout: 60, headers: { "Authorization": "Bearer analytics_token_xxx" } },
  { id: "wh-004", name: "PagerDuty Alerts", url: "https://events.pagerduty.com/integration/glimmora/enqueue", events: ["payment.failed", "workflow.failed", "notification.failed"], status: "failing", secret: "whsec_pd_alert_456", createdAt: "2026-03-10", lastTriggered: "2026-04-07 11:45", successRate: 45.0, totalDeliveries: 156, failedDeliveries: 86, retryPolicy: "exponential", timeout: 10, headers: { "X-Routing-Key": "pd_routing_xxx" } },
]);

export async function GET() {
  return NextResponse.json(webhooks);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<WebhookRecord>;
  const webhook: WebhookRecord = {
    id: `wh-${Date.now()}`,
    name: body.name ?? "",
    url: body.url ?? "",
    events: body.events ?? [],
    status: "active",
    secret: `whsec_${Math.random().toString(36).slice(2, 14)}`,
    createdAt: new Date().toISOString().slice(0, 10),
    lastTriggered: null,
    successRate: 100,
    totalDeliveries: 0,
    failedDeliveries: 0,
    retryPolicy: body.retryPolicy ?? "exponential",
    timeout: body.timeout ?? 30,
    headers: body.headers ?? {},
  };
  webhooks.unshift(webhook);
  return NextResponse.json(webhook, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = (await req.json()) as Partial<WebhookRecord> & { id: string };
  const idx = webhooks.findIndex((w) => w.id === body.id);
  if (idx === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  webhooks[idx] = { ...webhooks[idx], ...body };
  return NextResponse.json(webhooks[idx]);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const idx = webhooks.findIndex((w) => w.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const [removed] = webhooks.splice(idx, 1);
  return NextResponse.json({ deleted: true, webhook: removed });
}
