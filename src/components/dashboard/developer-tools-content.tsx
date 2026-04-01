"use client";

import { useState, useMemo } from "react";
import {
  Package,
  Download,
  Copy,
  Check,
  Search,
  Star,
  GitBranch,
  Play,
  Pause,
  Trash2,
  ExternalLink,
  Plus,
  X,
  Send,
  ChevronRight,
  Terminal,
  Zap,
} from "lucide-react";

// ── Data ──────────────────────────────────────────────────────────────

const SDKS = [
  { name: "JavaScript / TypeScript", pkg: "@glimmora/fabric-sdk", version: "3.4.1", downloads: "1.2M", status: "Stable" as const, install: "npm install @glimmora/fabric-sdk" },
  { name: "Python", pkg: "glimmora-fabric", version: "3.3.0", downloads: "840K", status: "Stable" as const, install: "pip install glimmora-fabric" },
  { name: "Go", pkg: "github.com/glimmora/fabric-go", version: "3.2.0", downloads: "310K", status: "Stable" as const, install: "go get github.com/glimmora/fabric-go" },
  { name: "Java", pkg: "com.glimmora:fabric-sdk", version: "3.1.2", downloads: "520K", status: "Stable" as const, install: "mvn install com.glimmora:fabric-sdk:3.1.2" },
  { name: "Ruby", pkg: "glimmora_fabric", version: "2.9.0-beta.3", downloads: "95K", status: "Beta" as const, install: "gem install glimmora_fabric" },
  { name: "PHP", pkg: "glimmora/fabric-php", version: "2.8.1-beta.1", downloads: "78K", status: "Beta" as const, install: "composer require glimmora/fabric-php" },
];

const REPOS = [
  { name: "fabric-starter-next", desc: "Next.js starter with auth, dashboards & theming", stack: "Next.js, TypeScript, Tailwind", stars: 2340, url: "https://github.com/glimmora/fabric-starter-next" },
  { name: "fabric-starter-express", desc: "Express API starter with middleware & validation", stack: "Node.js, Express, Prisma", stars: 1870, url: "https://github.com/glimmora/fabric-starter-express" },
  { name: "fabric-starter-django", desc: "Django REST starter with Celery & Redis", stack: "Python, Django, PostgreSQL", stars: 1450, url: "https://github.com/glimmora/fabric-starter-django" },
  { name: "fabric-starter-go", desc: "Go microservice starter with gRPC & protobuf", stack: "Go, gRPC, Docker", stars: 980, url: "https://github.com/glimmora/fabric-starter-go" },
  { name: "fabric-starter-mobile", desc: "React Native mobile starter with Expo", stack: "React Native, Expo, TypeScript", stars: 760, url: "https://github.com/glimmora/fabric-starter-mobile" },
  { name: "fabric-infra-terraform", desc: "Terraform modules for AWS/GCP deployment", stack: "Terraform, AWS, GCP", stars: 640, url: "https://github.com/glimmora/fabric-infra-terraform" },
];

const ENDPOINTS = [
  { method: "GET" as const, path: "/api/v1/users", service: "Identity", desc: "List all users with pagination & filters" },
  { method: "POST" as const, path: "/api/v1/users", service: "Identity", desc: "Create a new user account" },
  { method: "GET" as const, path: "/api/v1/orders", service: "Commerce", desc: "List orders with status filtering" },
  { method: "PUT" as const, path: "/api/v1/orders/:id", service: "Commerce", desc: "Update order status or details" },
  { method: "DELETE" as const, path: "/api/v1/orders/:id", service: "Commerce", desc: "Cancel and delete an order" },
  { method: "POST" as const, path: "/api/v1/events/publish", service: "EventBus", desc: "Publish a domain event to the bus" },
  { method: "GET" as const, path: "/api/v1/analytics/metrics", service: "Analytics", desc: "Retrieve aggregated platform metrics" },
  { method: "POST" as const, path: "/api/v1/notifications/send", service: "Notifications", desc: "Send push/email/SMS notification" },
];

const METHOD_COLORS: Record<string, string> = { GET: "#22c55e", POST: "#3b82f6", PUT: "#f59e0b", DELETE: "#ef4444" };

const EVENTS = [
  { name: "user.created", source: "Identity", schemaVersion: "2.1.0", subscribers: 5, lastEmitted: "2026-03-31T09:14:00Z" },
  { name: "order.placed", source: "Commerce", schemaVersion: "3.0.1", subscribers: 8, lastEmitted: "2026-03-31T09:12:30Z" },
  { name: "order.fulfilled", source: "Commerce", schemaVersion: "3.0.1", subscribers: 4, lastEmitted: "2026-03-31T08:55:00Z" },
  { name: "payment.completed", source: "Billing", schemaVersion: "1.4.0", subscribers: 6, lastEmitted: "2026-03-31T09:10:00Z" },
  { name: "notification.sent", source: "Notifications", schemaVersion: "1.2.0", subscribers: 2, lastEmitted: "2026-03-31T09:08:00Z" },
  { name: "analytics.aggregated", source: "Analytics", schemaVersion: "1.0.0", subscribers: 3, lastEmitted: "2026-03-31T08:00:00Z" },
  { name: "session.expired", source: "Identity", schemaVersion: "2.0.0", subscribers: 4, lastEmitted: "2026-03-31T07:45:00Z" },
  { name: "inventory.low", source: "Commerce", schemaVersion: "1.1.0", subscribers: 3, lastEmitted: "2026-03-31T06:30:00Z" },
];

const INITIAL_SANDBOXES = [
  { id: "sb-001", name: "Dev Environment", status: "Running" as const, services: ["Identity", "Commerce", "EventBus"], url: "https://sb-001.sandbox.glimmora.dev", createdBy: "admin@glimmora.io" },
  { id: "sb-002", name: "QA Integration", status: "Running" as const, services: ["Identity", "Commerce", "Analytics", "Notifications"], url: "https://sb-002.sandbox.glimmora.dev", createdBy: "qa-lead@glimmora.io" },
  { id: "sb-003", name: "Staging Mirror", status: "Stopped" as const, services: ["Identity", "Commerce", "Billing", "Analytics", "EventBus", "Notifications"], url: "https://sb-003.sandbox.glimmora.dev", createdBy: "admin@glimmora.io" },
  { id: "sb-004", name: "Load Testing", status: "Stopped" as const, services: ["Commerce", "Analytics"], url: "https://sb-004.sandbox.glimmora.dev", createdBy: "devops@glimmora.io" },
  { id: "sb-005", name: "Feature Branch A", status: "Running" as const, services: ["Identity", "Commerce"], url: "https://sb-005.sandbox.glimmora.dev", createdBy: "dev1@glimmora.io" },
  { id: "sb-006", name: "Demo Showcase", status: "Stopped" as const, services: ["Identity", "Commerce", "Analytics", "Notifications"], url: "https://sb-006.sandbox.glimmora.dev", createdBy: "sales@glimmora.io" },
];

const ALL_SERVICES = ["Identity", "Commerce", "Billing", "Analytics", "EventBus", "Notifications"];

// ── Helpers ───────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function mockSchema(eventName: string) {
  return JSON.stringify(
    {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      title: eventName,
      type: "object",
      properties: {
        eventId: { type: "string", format: "uuid" },
        timestamp: { type: "string", format: "date-time" },
        source: { type: "string" },
        payload: { type: "object", additionalProperties: true },
      },
      required: ["eventId", "timestamp", "source", "payload"],
    },
    null,
    2,
  );
}

function mockResponse(method: string, path: string) {
  return JSON.stringify(
    {
      status: method === "DELETE" ? 204 : 200,
      data:
        method === "GET"
          ? [{ id: "rec_01", createdAt: "2026-03-31T09:00:00Z" }]
          : { id: "rec_01", message: "Success" },
      meta: { requestId: "req_abc123", latency: "42ms", path },
    },
    null,
    2,
  );
}

// ── Component ─────────────────────────────────────────────────────────

export function DeveloperToolsContent() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ["SDKs & Repos", "API Reference", "Event Catalog", "Sandboxes"];

  // Shared
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Tab 1 state
  const [sdkSearch, setSdkSearch] = useState("");
  const [sdkStatusFilter, setSdkStatusFilter] = useState<"All" | "Stable" | "Beta">("All");

  // Tab 2 state
  const [apiSearch, setApiSearch] = useState("");
  const [apiMethodFilter, setApiMethodFilter] = useState("All");
  const [apiServiceFilter, setApiServiceFilter] = useState("All");
  const [tryEndpoint, setTryEndpoint] = useState<(typeof ENDPOINTS)[number] | null>(null);
  const [tryBody, setTryBody] = useState('{\n  "key": "value"\n}');
  const [tryResponse, setTryResponse] = useState<string | null>(null);
  const [trySending, setTrySending] = useState(false);

  // Tab 3 state
  const [eventSearch, setEventSearch] = useState("");
  const [eventSourceFilter, setEventSourceFilter] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState<(typeof EVENTS)[number] | null>(null);

  // Tab 4 state
  const [sandboxes, setSandboxes] = useState(INITIAL_SANDBOXES);
  const [sandboxStatusFilter, setSandboxStatusFilter] = useState<"All" | "Running" | "Stopped">("All");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSbName, setNewSbName] = useState("");
  const [newSbServices, setNewSbServices] = useState<string[]>([]);

  // ── Filtered data ───────────────────────────────────────────────────

  const filteredSdks = useMemo(() => {
    const q = sdkSearch.toLowerCase();
    return SDKS.filter(
      (s) =>
        (sdkStatusFilter === "All" || s.status === sdkStatusFilter) &&
        (s.name.toLowerCase().includes(q) || s.pkg.toLowerCase().includes(q)),
    );
  }, [sdkSearch, sdkStatusFilter]);

  const filteredRepos = useMemo(() => {
    const q = sdkSearch.toLowerCase();
    return REPOS.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.desc.toLowerCase().includes(q) ||
        r.stack.toLowerCase().includes(q),
    );
  }, [sdkSearch]);

  const filteredEndpoints = useMemo(() => {
    const q = apiSearch.toLowerCase();
    return ENDPOINTS.filter(
      (e) =>
        (apiMethodFilter === "All" || e.method === apiMethodFilter) &&
        (apiServiceFilter === "All" || e.service === apiServiceFilter) &&
        (e.path.toLowerCase().includes(q) ||
          e.service.toLowerCase().includes(q) ||
          e.desc.toLowerCase().includes(q)),
    );
  }, [apiSearch, apiMethodFilter, apiServiceFilter]);

  const filteredEvents = useMemo(() => {
    const q = eventSearch.toLowerCase();
    return EVENTS.filter(
      (ev) =>
        (eventSourceFilter === "All" || ev.source === eventSourceFilter) &&
        (ev.name.toLowerCase().includes(q) || ev.source.toLowerCase().includes(q)),
    );
  }, [eventSearch, eventSourceFilter]);

  const filteredSandboxes = useMemo(() => {
    return sandboxes.filter(
      (sb) => sandboxStatusFilter === "All" || sb.status === sandboxStatusFilter,
    );
  }, [sandboxes, sandboxStatusFilter]);

  const apiServices = [...new Set(ENDPOINTS.map((e) => e.service))];
  const eventSources = [...new Set(EVENTS.map((e) => e.source))];

  // ── Sandbox actions ─────────────────────────────────────────────────

  const toggleSandbox = (id: string) => {
    setSandboxes((prev) =>
      prev.map((sb) =>
        sb.id === id
          ? { ...sb, status: sb.status === "Running" ? ("Stopped" as const) : ("Running" as const) }
          : sb,
      ),
    );
  };

  const deleteSandbox = (id: string) => {
    setSandboxes((prev) => prev.filter((sb) => sb.id !== id));
    setDeleteConfirm(null);
  };

  const createSandbox = () => {
    if (!newSbName.trim() || newSbServices.length === 0) return;
    const id = `sb-${String(sandboxes.length + 1).padStart(3, "0")}`;
    setSandboxes((prev) => [
      ...prev,
      {
        id,
        name: newSbName.trim(),
        status: "Stopped" as const,
        services: newSbServices,
        url: `https://${id}.sandbox.glimmora.dev`,
        createdBy: "admin@glimmora.io",
      },
    ]);
    setNewSbName("");
    setNewSbServices([]);
    setShowCreateModal(false);
  };

  // ── Try-It handler ──────────────────────────────────────────────────

  const sendRequest = () => {
    setTrySending(true);
    setTryResponse(null);
    setTimeout(() => {
      setTryResponse(mockResponse(tryEndpoint!.method, tryEndpoint!.path));
      setTrySending(false);
    }, 1500);
  };

  // ── Shared UI styles ───────────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    background: "var(--gf-bg-base)",
    border: "1px solid var(--gf-border)",
    color: "var(--gf-text-primary)",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 13,
    outline: "none",
  };

  const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer" };

  const btnPrimary: React.CSSProperties = {
    background: "var(--gf-accent)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "6px 14px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  };

  const btnGhost: React.CSSProperties = {
    background: "transparent",
    color: "var(--gf-text-secondary)",
    border: "1px solid var(--gf-border)",
    borderRadius: 8,
    padding: "5px 10px",
    fontSize: 12,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
  };

  const cardStyle: React.CSSProperties = {
    background: "var(--gf-bg-elevated)",
    border: "1px solid var(--gf-border)",
    borderRadius: 12,
    padding: 16,
  };

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const modalStyle: React.CSSProperties = {
    background: "var(--gf-bg-elevated)",
    border: "1px solid var(--gf-border)",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 560,
    maxHeight: "80vh",
    overflowY: "auto",
    color: "var(--gf-text-primary)",
  };

  const slideOverStyle: React.CSSProperties = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "100%",
    maxWidth: 700,
    maxHeight: "85vh",
    background: "var(--gf-bg-elevated)",
    border: "1px solid var(--gf-border)",
    borderRadius: 12,
    zIndex: 50,
    padding: 24,
    overflowY: "auto",
    color: "var(--gf-text-primary)",
  };

  const codeBlockStyle: React.CSSProperties = {
    background: "var(--gf-bg-base)",
    border: "1px solid var(--gf-border)",
    borderRadius: 8,
    padding: 12,
    fontSize: 12,
    fontFamily: "monospace",
    whiteSpace: "pre-wrap",
    overflowX: "auto",
    color: "var(--gf-text-primary)",
  };

  // ── Stats ───────────────────────────────────────────────────────────

  const stats = [
    { label: "SDKs", value: SDKS.length },
    { label: "API Endpoints", value: ENDPOINTS.length },
    { label: "Starter Repos", value: REPOS.length },
    { label: "Sandboxes", value: sandboxes.length },
  ];

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div style={{ color: "var(--gf-text-primary)" }}>
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: "var(--gf-text-primary)" }}
        >
          Developer Tools
        </h1>
        <p
          className="text-sm mb-4"
          style={{ color: "var(--gf-text-secondary)" }}
        >
          SDKs, APIs, events, and sandbox environments for the Glimmora Fabric
          platform.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div key={s.label} style={cardStyle} className="text-center">
              <div
                className="text-xl font-bold"
                style={{ color: "var(--gf-accent)" }}
              >
                {s.value}
              </div>
              <div
                className="text-xs mt-1"
                style={{ color: "var(--gf-text-muted)" }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div
        className="flex gap-1 rounded-lg p-1 mb-5"
        style={{
          background: "var(--gf-bg-surface)",
          border: "1px solid var(--gf-border)",
        }}
      >
        {tabs.map((t, i) => (
          <button
            key={t}
            onClick={() => setActiveTab(i)}
            className="flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors"
            style={
              activeTab === i
                ? { background: "var(--gf-accent)", color: "#fff" }
                : {
                    background: "transparent",
                    color: "var(--gf-text-secondary)",
                    cursor: "pointer",
                  }
            }
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── TAB 1: SDKs & Repos ──────────────────────────────────────── */}
      {activeTab === 0 && (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: 10,
                  top: 9,
                  color: "var(--gf-text-muted)",
                }}
              />
              <input
                placeholder="Search SDKs & repos..."
                value={sdkSearch}
                onChange={(e) => setSdkSearch(e.target.value)}
                style={{ ...inputStyle, width: "100%", paddingLeft: 32 }}
              />
            </div>
            <select
              value={sdkStatusFilter}
              onChange={(e) =>
                setSdkStatusFilter(e.target.value as typeof sdkStatusFilter)
              }
              style={selectStyle}
            >
              <option value="All">All Status</option>
              <option value="Stable">Stable</option>
              <option value="Beta">Beta</option>
            </select>
          </div>

          {/* SDKs */}
          <h3
            className="text-sm font-semibold mb-3 flex items-center gap-2"
            style={{ color: "var(--gf-text-primary)" }}
          >
            <Package size={15} /> SDKs ({filteredSdks.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {filteredSdks.map((sdk) => (
              <div key={sdk.pkg} style={cardStyle}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div
                      className="font-semibold text-sm"
                      style={{ color: "var(--gf-text-primary)" }}
                    >
                      {sdk.name}
                    </div>
                    <div
                      className="text-xs font-mono mt-0.5"
                      style={{ color: "var(--gf-text-muted)" }}
                    >
                      {sdk.pkg}
                    </div>
                  </div>
                  <span
                    className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background:
                        sdk.status === "Stable"
                          ? "rgba(34,197,94,0.15)"
                          : "rgba(245,158,11,0.15)",
                      color: sdk.status === "Stable" ? "#22c55e" : "#f59e0b",
                    }}
                  >
                    {sdk.status}
                  </span>
                </div>
                <div
                  className="flex gap-3 text-xs mb-3"
                  style={{ color: "var(--gf-text-muted)" }}
                >
                  <span>v{sdk.version}</span>
                  <span className="flex items-center gap-1">
                    <Download size={11} />
                    {sdk.downloads}
                  </span>
                </div>
                <button
                  style={btnGhost}
                  onClick={() => copy(sdk.install, `sdk-${sdk.pkg}`)}
                >
                  {copiedKey === `sdk-${sdk.pkg}` ? (
                    <>
                      <Check size={12} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={12} /> Copy Install
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Starter Repos */}
          <h3
            className="text-sm font-semibold mb-3 flex items-center gap-2"
            style={{ color: "var(--gf-text-primary)" }}
          >
            <GitBranch size={15} /> Starter Repos ({filteredRepos.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredRepos.map((repo) => (
              <div key={repo.name} style={cardStyle}>
                <div
                  className="font-semibold text-sm mb-1"
                  style={{ color: "var(--gf-text-primary)" }}
                >
                  {repo.name}
                </div>
                <div
                  className="text-xs mb-2"
                  style={{ color: "var(--gf-text-secondary)" }}
                >
                  {repo.desc}
                </div>
                <div
                  className="text-xs mb-3 flex items-center gap-3"
                  style={{ color: "var(--gf-text-muted)" }}
                >
                  <span>{repo.stack}</span>
                  <span className="flex items-center gap-1">
                    <Star size={11} />
                    {repo.stars.toLocaleString()}
                  </span>
                </div>
                <button
                  style={btnGhost}
                  onClick={() =>
                    copy(
                      `git clone ${repo.url}.git`,
                      `repo-${repo.name}`,
                    )
                  }
                >
                  {copiedKey === `repo-${repo.name}` ? (
                    <>
                      <Check size={12} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={12} /> Clone
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 2: API Reference ─────────────────────────────────────── */}
      {activeTab === 1 && (
        <div>
          <div className="flex flex-wrap gap-3 mb-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: 10,
                  top: 9,
                  color: "var(--gf-text-muted)",
                }}
              />
              <input
                placeholder="Search path, service, description..."
                value={apiSearch}
                onChange={(e) => setApiSearch(e.target.value)}
                style={{ ...inputStyle, width: "100%", paddingLeft: 32 }}
              />
            </div>
            <select
              value={apiMethodFilter}
              onChange={(e) => setApiMethodFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="All">All Methods</option>
              {["GET", "POST", "PUT", "DELETE"].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={apiServiceFilter}
              onChange={(e) => setApiServiceFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="All">All Services</option>
              {apiServices.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            {filteredEndpoints.map((ep, i) => (
              <div
                key={`${ep.method}-${ep.path}`}
                style={cardStyle}
                className="flex flex-wrap items-center gap-3"
              >
                <span
                  className="text-xs font-bold px-2 py-1 rounded"
                  style={{
                    background: METHOD_COLORS[ep.method] + "20",
                    color: METHOD_COLORS[ep.method],
                    minWidth: 52,
                    textAlign: "center",
                  }}
                >
                  {ep.method}
                </span>
                <code
                  className="text-sm font-mono"
                  style={{ color: "var(--gf-text-primary)" }}
                >
                  {ep.path}
                </code>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--gf-accent-bg)",
                    color: "var(--gf-accent)",
                  }}
                >
                  {ep.service}
                </span>
                <span
                  className="text-xs flex-1"
                  style={{ color: "var(--gf-text-muted)" }}
                >
                  {ep.desc}
                </span>
                <div className="flex gap-2">
                  <button
                    style={btnGhost}
                    onClick={() => copy(ep.path, `path-${i}`)}
                  >
                    {copiedKey === `path-${i}` ? (
                      <Check size={12} />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                  <button
                    style={btnPrimary}
                    onClick={() => {
                      setTryEndpoint(ep);
                      setTryResponse(null);
                      setTryBody('{\n  "key": "value"\n}');
                    }}
                  >
                    <Terminal size={13} /> Try It
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Try It Slide-over */}
          {tryEndpoint && (
            <>
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.4)",
                  zIndex: 49,
                }}
                onClick={() => setTryEndpoint(null)}
              />
              <div style={slideOverStyle}>
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg font-bold">Try Endpoint</h3>
                  <button
                    onClick={() => setTryEndpoint(null)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--gf-text-muted)",
                      cursor: "pointer",
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="text-xs font-bold px-2 py-1 rounded"
                    style={{
                      background: METHOD_COLORS[tryEndpoint.method] + "20",
                      color: METHOD_COLORS[tryEndpoint.method],
                    }}
                  >
                    {tryEndpoint.method}
                  </span>
                  <code className="text-sm font-mono">{tryEndpoint.path}</code>
                </div>
                <label
                  className="text-xs font-medium mb-1 block"
                  style={{ color: "var(--gf-text-secondary)" }}
                >
                  Request Body (JSON)
                </label>
                <textarea
                  value={tryBody}
                  onChange={(e) => setTryBody(e.target.value)}
                  rows={6}
                  style={{
                    ...inputStyle,
                    width: "100%",
                    fontFamily: "monospace",
                    fontSize: 12,
                    resize: "vertical",
                  }}
                />
                <button
                  style={{ ...btnPrimary, marginTop: 12 }}
                  onClick={sendRequest}
                  disabled={trySending}
                >
                  {trySending ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send size={13} /> Send Request
                    </>
                  )}
                </button>
                {tryResponse && (
                  <div className="mt-5">
                    <label
                      className="text-xs font-medium mb-1 block"
                      style={{ color: "var(--gf-text-secondary)" }}
                    >
                      Response
                    </label>
                    <div style={codeBlockStyle}>{tryResponse}</div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB 3: Event Catalog ─────────────────────────────────────── */}
      {activeTab === 2 && (
        <div>
          <div className="flex flex-wrap gap-3 mb-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: 10,
                  top: 9,
                  color: "var(--gf-text-muted)",
                }}
              />
              <input
                placeholder="Search events by name or source..."
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                style={{ ...inputStyle, width: "100%", paddingLeft: 32 }}
              />
            </div>
            <select
              value={eventSourceFilter}
              onChange={(e) => setEventSourceFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="All">All Sources</option>
              {eventSources.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            {filteredEvents.map((ev) => (
              <div
                key={ev.name}
                style={cardStyle}
                className="flex flex-wrap items-center gap-3 cursor-pointer hover:opacity-90"
                onClick={() => setSelectedEvent(ev)}
              >
                <Zap size={15} style={{ color: "var(--gf-accent)" }} />
                <span
                  className="font-mono text-sm font-semibold"
                  style={{ color: "var(--gf-text-primary)" }}
                >
                  {ev.name}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--gf-accent-bg)",
                    color: "var(--gf-accent)",
                  }}
                >
                  {ev.source}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--gf-text-muted)" }}
                >
                  v{ev.schemaVersion}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--gf-text-muted)" }}
                >
                  {ev.subscribers} subscribers
                </span>
                <span
                  className="text-xs ml-auto"
                  style={{ color: "var(--gf-text-muted)" }}
                >
                  {timeAgo(ev.lastEmitted)}
                </span>
                <ChevronRight
                  size={14}
                  style={{ color: "var(--gf-text-muted)" }}
                />
              </div>
            ))}
          </div>

          {/* Event Detail Slide-over */}
          {selectedEvent && (
            <>
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.4)",
                  zIndex: 49,
                }}
                onClick={() => setSelectedEvent(null)}
              />
              <div style={slideOverStyle}>
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg font-bold">Event Detail</h3>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--gf-text-muted)",
                      cursor: "pointer",
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-3 mb-5">
                  <div>
                    <div
                      className="text-xs"
                      style={{ color: "var(--gf-text-muted)" }}
                    >
                      Event Name
                    </div>
                    <div className="font-mono font-semibold text-sm">
                      {selectedEvent.name}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div
                        className="text-xs"
                        style={{ color: "var(--gf-text-muted)" }}
                      >
                        Source
                      </div>
                      <div className="text-sm">{selectedEvent.source}</div>
                    </div>
                    <div>
                      <div
                        className="text-xs"
                        style={{ color: "var(--gf-text-muted)" }}
                      >
                        Schema Version
                      </div>
                      <div className="text-sm">
                        v{selectedEvent.schemaVersion}
                      </div>
                    </div>
                    <div>
                      <div
                        className="text-xs"
                        style={{ color: "var(--gf-text-muted)" }}
                      >
                        Subscribers
                      </div>
                      <div className="text-sm">{selectedEvent.subscribers}</div>
                    </div>
                    <div>
                      <div
                        className="text-xs"
                        style={{ color: "var(--gf-text-muted)" }}
                      >
                        Last Emitted
                      </div>
                      <div className="text-sm">
                        {timeAgo(selectedEvent.lastEmitted)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mb-5">
                  <div
                    className="text-xs font-medium mb-1"
                    style={{ color: "var(--gf-text-secondary)" }}
                  >
                    JSON Schema
                  </div>
                  <div style={codeBlockStyle}>
                    {mockSchema(selectedEvent.name)}
                  </div>
                </div>
                <div>
                  <div
                    className="text-xs font-medium mb-2"
                    style={{ color: "var(--gf-text-secondary)" }}
                  >
                    Subscribers
                  </div>
                  <div className="space-y-1">
                    {Array.from(
                      { length: selectedEvent.subscribers },
                      (_, i) => (
                        <div
                          key={i}
                          className="text-xs px-3 py-2 rounded-lg"
                          style={{
                            background: "var(--gf-bg-base)",
                            border: "1px solid var(--gf-border)",
                          }}
                        >
                          {selectedEvent.source.toLowerCase()}-consumer-{i + 1}
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB 4: Sandboxes ─────────────────────────────────────────── */}
      {activeTab === 3 && (
        <div>
          <div className="flex flex-wrap gap-3 mb-4 items-center">
            <select
              value={sandboxStatusFilter}
              onChange={(e) =>
                setSandboxStatusFilter(
                  e.target.value as typeof sandboxStatusFilter,
                )
              }
              style={selectStyle}
            >
              <option value="All">All Status</option>
              <option value="Running">Running</option>
              <option value="Stopped">Stopped</option>
            </select>
            <div className="ml-auto">
              <button
                style={btnPrimary}
                onClick={() => setShowCreateModal(true)}
              >
                <Plus size={14} /> Create Sandbox
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSandboxes.map((sb) => (
              <div key={sb.id} style={cardStyle}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div
                      className="font-semibold text-sm"
                      style={{ color: "var(--gf-text-primary)" }}
                    >
                      {sb.name}
                    </div>
                    <div
                      className="text-xs font-mono mt-0.5"
                      style={{ color: "var(--gf-text-muted)" }}
                    >
                      {sb.id}
                    </div>
                  </div>
                  <span
                    className="text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1"
                    style={{
                      background:
                        sb.status === "Running"
                          ? "rgba(34,197,94,0.15)"
                          : "rgba(245,158,11,0.15)",
                      color: sb.status === "Running" ? "#22c55e" : "#f59e0b",
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background:
                          sb.status === "Running" ? "#22c55e" : "#f59e0b",
                      }}
                    />
                    {sb.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {sb.services.map((svc) => (
                    <span
                      key={svc}
                      className="text-[11px] px-2 py-0.5 rounded"
                      style={{
                        background: "var(--gf-bg-base)",
                        color: "var(--gf-text-muted)",
                        border: "1px solid var(--gf-border)",
                      }}
                    >
                      {svc}
                    </span>
                  ))}
                </div>
                <div
                  className="text-xs mb-3"
                  style={{ color: "var(--gf-text-muted)" }}
                >
                  {sb.createdBy}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button style={btnGhost} onClick={() => toggleSandbox(sb.id)}>
                    {sb.status === "Running" ? (
                      <>
                        <Pause size={12} style={{ color: "#f59e0b" }} /> Stop
                      </>
                    ) : (
                      <>
                        <Play size={12} style={{ color: "#22c55e" }} /> Start
                      </>
                    )}
                  </button>
                  <a
                    href={sb.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ...btnGhost, textDecoration: "none" }}
                  >
                    <ExternalLink size={12} /> Open
                  </a>
                  {deleteConfirm === sb.id ? (
                    <div className="flex gap-1">
                      <button
                        style={{
                          ...btnGhost,
                          color: "#ef4444",
                          borderColor: "#ef4444",
                        }}
                        onClick={() => deleteSandbox(sb.id)}
                      >
                        Confirm
                      </button>
                      <button
                        style={btnGhost}
                        onClick={() => setDeleteConfirm(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      style={{ ...btnGhost, color: "#ef4444" }}
                      onClick={() => setDeleteConfirm(sb.id)}
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Create Sandbox Modal */}
          {showCreateModal && (
            <div
              style={overlayStyle}
              onClick={() => setShowCreateModal(false)}
            >
              <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Create Sandbox</h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--gf-text-muted)",
                      cursor: "pointer",
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="mb-4">
                  <label
                    className="text-xs font-medium mb-1 block"
                    style={{ color: "var(--gf-text-secondary)" }}
                  >
                    Sandbox Name
                  </label>
                  <input
                    value={newSbName}
                    onChange={(e) => setNewSbName(e.target.value)}
                    placeholder="e.g. Feature Branch B"
                    style={{ ...inputStyle, width: "100%" }}
                  />
                </div>
                <div className="mb-5">
                  <label
                    className="text-xs font-medium mb-2 block"
                    style={{ color: "var(--gf-text-secondary)" }}
                  >
                    Services
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ALL_SERVICES.map((svc) => (
                      <label
                        key={svc}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                        style={{ color: "var(--gf-text-primary)" }}
                      >
                        <input
                          type="checkbox"
                          checked={newSbServices.includes(svc)}
                          onChange={(e) =>
                            setNewSbServices((prev) =>
                              e.target.checked
                                ? [...prev, svc]
                                : prev.filter((s) => s !== svc),
                            )
                          }
                        />
                        {svc}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    style={btnGhost}
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    style={{
                      ...btnPrimary,
                      opacity:
                        !newSbName.trim() || newSbServices.length === 0
                          ? 0.5
                          : 1,
                    }}
                    onClick={createSandbox}
                  >
                    <Plus size={14} /> Create
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
