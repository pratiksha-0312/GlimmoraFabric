"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye, GitBranch, Filter, RefreshCw } from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import type { UserRole } from "@/lib/roles";

interface Instance {
  id: string;
  workflowId: string;
  workflowName: string;
  triggeredBy: string;
  status: "Running" | "Completed" | "Failed" | "Cancelled";
  currentStep: string;
  progress: number;
  startedAt: string;
  sla: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  Running: { bg: "bg-blue-500/15", text: "text-blue-500" },
  Completed: { bg: "bg-green-500/15", text: "text-green-500" },
  Failed: { bg: "bg-red-500/15", text: "text-red-500" },
  Cancelled: { bg: "bg-gray-500/15", text: "text-gray-400" },
};

const SLA_STYLES: Record<string, { bg: string; text: string }> = {
  "Within SLA": { bg: "bg-green-500/15", text: "text-green-500" },
  "At Risk": { bg: "bg-amber-500/15", text: "text-amber-500" },
  "Breached": { bg: "bg-red-500/15", text: "text-red-500" },
  "N/A": { bg: "bg-gray-500/15", text: "text-gray-400" },
};

export default function WorkflowInstancesPage() {
  const router = useRouter();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterSla, setFilterSla] = useState("All");

  const fetchInstances = () => {
    setLoading(true);
    fetch("/api/workflow-instances")
      .then((r) => r.json())
      .then((d) => { setInstances(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchInstances(); }, []);

  const filtered = instances.filter((i) => {
    const q = search.toLowerCase();
    const matchSearch = i.workflowName.toLowerCase().includes(q) || i.triggeredBy.toLowerCase().includes(q) || i.currentStep.toLowerCase().includes(q);
    const matchStatus = filterStatus === "All" || i.status === filterStatus;
    const matchSla = filterSla === "All" || i.sla === filterSla;
    return matchSearch && matchStatus && matchSla;
  });

  const running = instances.filter((i) => i.status === "Running").length;
  const failed = instances.filter((i) => i.status === "Failed").length;

  return (
    <AuthGuard allowedRoles={["workflow_manager"] as UserRole[]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Active Instances</h1>
            <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>Monitor running workflow instances</p>
          </div>
          <button onClick={fetchInstances} className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:opacity-80"
            style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { label: "Total", value: instances.length, color: "var(--gf-accent)" },
            { label: "Running", value: running, color: "#3b82f6" },
            { label: "Failed", value: failed, color: "#ef4444" },
            { label: "Completed", value: instances.filter((i) => i.status === "Completed").length, color: "#22c55e" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border p-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
              <p className="text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>{s.label}</p>
              <p className="text-xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--gf-text-muted)" }} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by workflow, trigger, or step..."
              className="w-full rounded-lg border pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
              style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border px-3 py-2.5 text-sm outline-none"
            style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
            <option value="All">All Status</option>
            <option value="Running">Running</option>
            <option value="Completed">Completed</option>
            <option value="Failed">Failed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <select value={filterSla} onChange={(e) => setFilterSla(e.target.value)} className="rounded-lg border px-3 py-2.5 text-sm outline-none"
            style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
            <option value="All">All SLA</option>
            <option value="Within SLA">Within SLA</option>
            <option value="At Risk">At Risk</option>
            <option value="Breached">Breached</option>
          </select>
        </div>

        {/* Table */}
        <div className="rounded-xl border" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                  {["Workflow", "Triggered By", "Status", "Current Step", "Progress", "SLA", "Started", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--gf-text-secondary)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="px-5 py-12 text-center text-sm" style={{ color: "var(--gf-text-muted)" }}>Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-5 py-12 text-center">
                    <GitBranch className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
                    <p className="text-sm" style={{ color: "var(--gf-text-muted)" }}>No instances found</p>
                  </td></tr>
                ) : filtered.map((inst) => {
                  const ss = STATUS_STYLES[inst.status];
                  const sl = SLA_STYLES[inst.sla];
                  return (
                    <tr key={inst.id} className="border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: "var(--gf-border)" }}>
                      <td className="px-5 py-3 font-medium" style={{ color: "var(--gf-text-primary)" }}>{inst.workflowName}</td>
                      <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{inst.triggeredBy}</td>
                      <td className="px-5 py-3"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ss.bg} ${ss.text}`}>{inst.status}</span></td>
                      <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{inst.currentStep}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 rounded-full" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                            <div className="h-full rounded-full" style={{ width: `${inst.progress}%`, backgroundColor: inst.progress === 100 ? "#22c55e" : "var(--gf-accent)" }} />
                          </div>
                          <span className="text-xs font-mono" style={{ color: "var(--gf-text-muted)" }}>{inst.progress}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${sl.bg} ${sl.text}`}>{inst.sla}</span></td>
                      <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-muted)" }}>{new Date(inst.startedAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3">
                        <button onClick={() => router.push(`/workflow/instances/${inst.id}`)} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: "var(--gf-accent)" }}>
                          <Eye className="h-4 w-4" />
                        </button>
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
