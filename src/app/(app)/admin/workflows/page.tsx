"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  GitBranch,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Pencil,
  History,
  Archive,
  Play,
  Clock,
  X,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import type { UserRole } from "@/lib/roles";

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: "Published" | "Draft" | "Archived";
  version: number;
  trigger: string;
  steps: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  Published: { bg: "bg-green-500/15", text: "text-green-500" },
  Draft: { bg: "bg-amber-500/15", text: "text-amber-500" },
  Archived: { bg: "bg-gray-500/15", text: "text-gray-400" },
};

const TRIGGER_ICONS: Record<string, React.ReactNode> = {
  Manual: <Play className="h-3 w-3" />,
  Event: <GitBranch className="h-3 w-3" />,
  API: <Clock className="h-3 w-3" />,
  Schedule: <Clock className="h-3 w-3" />,
};

export default function WorkflowListPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/workflows")
      .then((r) => r.json())
      .then((d) => { setWorkflows(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = workflows.filter((w) => {
    const q = search.toLowerCase();
    const matchSearch = w.name.toLowerCase().includes(q) || w.description.toLowerCase().includes(q);
    const matchStatus = filterStatus === "All" || w.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: workflows.length,
    published: workflows.filter((w) => w.status === "Published").length,
    draft: workflows.filter((w) => w.status === "Draft").length,
  };

  return (
    <AuthGuard allowedRoles={["workflow_manager", "super_admin"] as UserRole[]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Workflows</h1>
            <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>Build, manage, and monitor automated workflows</p>
          </div>
          <button
            onClick={() => router.push("/admin/workflows/builder")}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--gf-accent)" }}
          >
            <Plus className="h-4 w-4" />New Workflow
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Workflows", value: stats.total, color: "var(--gf-accent)" },
            { label: "Published", value: stats.published, color: "#22c55e" },
            { label: "Drafts", value: stats.draft, color: "#f59e0b" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
              <p className="text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>{s.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--gf-text-muted)" }} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search workflows..."
              className="w-full rounded-lg border pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
              style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border px-4 py-2.5 text-sm outline-none"
            style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
            <option value="All">All Status</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        {/* Table */}
        <div className="rounded-xl border" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                  {["Workflow", "Status", "Trigger", "Steps", "Version", "Updated", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--gf-text-secondary)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-sm" style={{ color: "var(--gf-text-muted)" }}>Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-12 text-center">
                    <GitBranch className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
                    <p className="text-sm" style={{ color: "var(--gf-text-muted)" }}>No workflows found</p>
                  </td></tr>
                ) : filtered.map((w) => {
                  const s = STATUS_STYLES[w.status];
                  return (
                    <tr key={w.id} className="border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: "var(--gf-border)" }}>
                      <td className="px-5 py-3">
                        <p className="font-medium" style={{ color: "var(--gf-text-primary)" }}>{w.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--gf-text-muted)" }}>{w.description}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>{w.status}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                          {TRIGGER_ICONS[w.trigger]}{w.trigger}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{w.steps}</td>
                      <td className="px-5 py-3 text-xs font-mono" style={{ color: "var(--gf-text-muted)" }}>v{w.version}</td>
                      <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-muted)" }}>{w.updatedAt}</td>
                      <td className="px-5 py-3">
                        <div className="relative">
                          <button onClick={() => setOpenActionId(openActionId === w.id ? null : w.id)} className="rounded-lg p-1.5 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                          {openActionId === w.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setOpenActionId(null)} />
                              <div className="absolute right-0 z-50 w-44 rounded-xl border py-1 shadow-xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
                                <button onClick={() => { router.push("/admin/workflows/builder"); setOpenActionId(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--gf-text-primary)" }}>
                                  <Pencil className="h-4 w-4" style={{ color: "var(--gf-text-secondary)" }} />Edit
                                </button>
                                <button onClick={() => { router.push(`/admin/workflows/${w.id}/versions`); setOpenActionId(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--gf-text-primary)" }}>
                                  <History className="h-4 w-4" style={{ color: "var(--gf-text-secondary)" }} />Version History
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
