"use client";

import {
  Code2,
  Terminal,
  Package,
  BookOpen,
  Play,
  GitBranch,
  Download,
  ExternalLink,
} from "lucide-react";

const stats = [
  { label: "SDKs Available", value: "6", icon: Package },
  { label: "API Endpoints", value: "128", icon: Code2 },
  { label: "Starter Repos", value: "8", icon: GitBranch },
  { label: "CI/CD Templates", value: "12", icon: Terminal },
];

const sdks = [
  { name: "JavaScript / TypeScript", package: "@glimmora/fabric-sdk", version: "2.4.1", downloads: "12.4K", status: "Stable" },
  { name: "Python", package: "glimmora-fabric", version: "2.3.0", downloads: "8.2K", status: "Stable" },
  { name: "Go", package: "github.com/glimmora/fabric-go", version: "1.2.0", downloads: "3.1K", status: "Stable" },
  { name: "Java / Kotlin", package: "com.glimmora:fabric-sdk", version: "2.1.0", downloads: "2.8K", status: "Stable" },
  { name: "Ruby", package: "glimmora-fabric", version: "1.1.0", downloads: "1.2K", status: "Beta" },
  { name: "PHP", package: "glimmora/fabric-php", version: "1.0.0", downloads: "0.9K", status: "Beta" },
];

const starterRepos = [
  { name: "fabric-nextjs-starter", description: "Next.js app with auth, payments, notifications pre-integrated", stack: "Next.js + TypeScript", stars: 124 },
  { name: "fabric-react-dashboard", description: "Admin dashboard template with all Fabric modules", stack: "React + Tailwind", stars: 98 },
  { name: "fabric-express-api", description: "Express.js REST API backend with Fabric middleware", stack: "Express + Node.js", stars: 76 },
  { name: "fabric-python-service", description: "Python microservice template with Fabric SDK", stack: "FastAPI + Python", stars: 54 },
  { name: "fabric-mobile-rn", description: "React Native app with push notifications and payments", stack: "React Native", stars: 42 },
  { name: "fabric-ai-agent", description: "AI agent template with prompt registry and RAG", stack: "Python + LangChain", stars: 89 },
];

const apiEndpoints = [
  { method: "POST", path: "/api/v1/auth/login", service: "Identity", description: "Authenticate user and return JWT" },
  { method: "POST", path: "/api/v1/auth/mfa/verify", service: "Identity", description: "Verify MFA code" },
  { method: "POST", path: "/api/v1/payments/charge", service: "Payment", description: "Create a payment charge" },
  { method: "GET", path: "/api/v1/payments/subscriptions", service: "Payment", description: "List active subscriptions" },
  { method: "POST", path: "/api/v1/notifications/send", service: "Notification", description: "Send notification via any channel" },
  { method: "POST", path: "/api/v1/ai/completions", service: "AI Platform", description: "Generate AI completion with prompt template" },
  { method: "POST", path: "/api/v1/documents/generate", service: "Document", description: "Generate document from template" },
  { method: "POST", path: "/api/v1/workflows/trigger", service: "Workflow", description: "Trigger a workflow execution" },
];

const methodColors: Record<string, string> = {
  GET: "#22c55e",
  POST: "#3b82f6",
  PUT: "#f59e0b",
  DELETE: "#ef4444",
  PATCH: "#8b5cf6",
};

export function DeveloperToolsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>
          Developer Tools
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>
          SDKs, API playground, starter repos, CI/CD templates, and developer documentation
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

      {/* SDKs */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
          Official SDKs
        </h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {sdks.map((sdk) => (
            <div
              key={sdk.name}
              className="rounded-xl p-5"
              style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
            >
              <div className="flex items-start justify-between">
                <Package className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    sdk.status === "Stable"
                      ? "bg-green-500/15 text-green-500"
                      : "bg-amber-500/15 text-amber-500"
                  }`}
                >
                  {sdk.status}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>
                {sdk.name}
              </h3>
              <p className="font-mono text-xs mt-1" style={{ color: "var(--gf-text-secondary)" }}>
                {sdk.package}
              </p>
              <div className="mt-3 flex items-center gap-4 text-xs" style={{ color: "var(--gf-text-muted)" }}>
                <span>v{sdk.version}</span>
                <span>{sdk.downloads} downloads</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Starter Repos */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
          Starter Repos
        </h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {starterRepos.map((repo) => (
            <div
              key={repo.name}
              className="rounded-xl p-5"
              style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold font-mono" style={{ color: "var(--gf-accent)" }}>
                    {repo.name}
                  </h3>
                  <p className="text-xs mt-1" style={{ color: "var(--gf-text-secondary)" }}>
                    {repo.description}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs" style={{ color: "var(--gf-text-muted)" }}>
                <span
                  className="px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" }}
                >
                  {repo.stack}
                </span>
                <span>{repo.stars} stars</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Playground */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
          API Reference
        </h2>
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["Method", "Endpoint", "Service", "Description"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: "var(--gf-text-secondary)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {apiEndpoints.map((ep, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid var(--gf-border)" }}>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-mono font-bold px-2 py-0.5 rounded"
                      style={{ backgroundColor: `${methodColors[ep.method]}20`, color: methodColors[ep.method] }}
                    >
                      {ep.method}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--gf-text-primary)" }}>
                    {ep.path}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                    {ep.service}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                    {ep.description}
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
