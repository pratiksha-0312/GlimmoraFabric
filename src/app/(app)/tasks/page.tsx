"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Inbox,
  Search,
  Filter,
  Eye,
  Check,
  Clock,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";

interface Task {
  id: string;
  title: string;
  type: string;
  workflow: string;
  priority: "Urgent" | "High" | "Medium" | "Low";
  status: "Pending" | "Approved" | "Rejected" | "Completed";
  assignee: string;
  requester: string;
  dueDate: string;
  createdAt: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  Pending: { bg: "bg-amber-500/15", text: "text-amber-500", icon: <Clock className="h-3 w-3" /> },
  Approved: { bg: "bg-green-500/15", text: "text-green-500", icon: <Check className="h-3 w-3" /> },
  Rejected: { bg: "bg-red-500/15", text: "text-red-500", icon: <XCircle className="h-3 w-3" /> },
  Completed: { bg: "bg-blue-500/15", text: "text-blue-500", icon: <Check className="h-3 w-3" /> },
};

const PRIORITY_STYLES: Record<string, { bg: string; text: string }> = {
  Urgent: { bg: "bg-red-500/15", text: "text-red-500" },
  High: { bg: "bg-orange-500/15", text: "text-orange-500" },
  Medium: { bg: "bg-blue-500/15", text: "text-blue-500" },
  Low: { bg: "bg-gray-500/15", text: "text-gray-400" },
};

const PAGE_SIZE = 5;

export default function TaskInboxPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("/api/tasks/my")
      .then((r) => r.json())
      .then((d) => { setTasks(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = tasks.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch = t.title.toLowerCase().includes(q) || t.workflow.toLowerCase().includes(q) || t.requester.toLowerCase().includes(q);
    const matchStatus = filterStatus === "All" || t.status === filterStatus;
    const matchPriority = filterPriority === "All" || t.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const pendingCount = tasks.filter((t) => t.status === "Pending").length;
  const urgentCount = tasks.filter((t) => t.priority === "Urgent" && t.status === "Pending").length;

  return (
    <AuthGuard>
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Task Inbox</h1>
        <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>
          Review and act on tasks assigned to you
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Tasks", value: tasks.length, color: "var(--gf-accent)" },
          { label: "Pending", value: pendingCount, color: "#f59e0b" },
          { label: "Urgent", value: urgentCount, color: "#ef4444" },
          { label: "Completed", value: tasks.filter((t) => t.status === "Completed" || t.status === "Approved").length, color: "#22c55e" },
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
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search tasks..."
            className="w-full rounded-lg border pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
            style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
        </div>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="rounded-lg border px-3 py-2.5 text-sm outline-none"
          style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Completed">Completed</option>
        </select>
        <select value={filterPriority} onChange={(e) => { setFilterPriority(e.target.value); setPage(1); }}
          className="rounded-lg border px-3 py-2.5 text-sm outline-none"
          style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
          <option value="All">All Priority</option>
          <option value="Urgent">Urgent</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                {["Task", "Type", "Workflow", "Priority", "Status", "Due Date", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--gf-text-secondary)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-sm" style={{ color: "var(--gf-text-muted)" }}>Loading...</td></tr>
              ) : paged.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center">
                  <Inbox className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
                  <p className="text-sm" style={{ color: "var(--gf-text-muted)" }}>No tasks found</p>
                </td></tr>
              ) : paged.map((t) => {
                const ss = STATUS_STYLES[t.status];
                const ps = PRIORITY_STYLES[t.priority];
                const isOverdue = t.status === "Pending" && new Date(t.dueDate) < new Date();
                return (
                  <tr key={t.id} className="border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer" style={{ borderColor: "var(--gf-border)" }}
                    onClick={() => router.push(`/tasks/${t.id}`)}>
                    <td className="px-5 py-3">
                      <p className="font-medium" style={{ color: "var(--gf-text-primary)" }}>{t.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--gf-text-muted)" }}>from {t.requester}</p>
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{t.type}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{t.workflow}</td>
                    <td className="px-5 py-3"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ps.bg} ${ps.text}`}>{t.priority}</span></td>
                    <td className="px-5 py-3"><span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${ss.bg} ${ss.text}`}>{ss.icon}{t.status}</span></td>
                    <td className="px-5 py-3">
                      <span className={`text-xs ${isOverdue ? "text-red-500 font-medium" : ""}`} style={isOverdue ? {} : { color: "var(--gf-text-muted)" }}>
                        {isOverdue && <AlertTriangle className="h-3 w-3 inline mr-1" />}{t.dueDate}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button className="p-1.5 rounded-lg hover:opacity-70" style={{ color: "var(--gf-accent)" }}>
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t px-6 py-3" style={{ borderColor: "var(--gf-border)" }}>
            <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Page {safePage} of {totalPages} ({filtered.length} tasks)</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1} className="rounded-lg p-1.5 hover:opacity-70 disabled:opacity-30" style={{ color: "var(--gf-text-secondary)" }}>
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages} className="rounded-lg p-1.5 hover:opacity-70 disabled:opacity-30" style={{ color: "var(--gf-text-secondary)" }}>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </AuthGuard>
  );
}
