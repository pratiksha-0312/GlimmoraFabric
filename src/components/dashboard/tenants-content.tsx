"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  Globe,
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Ban,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Tenant {
  id: string;
  name: string;
  plan: "Enterprise" | "Pro" | "Starter";
  users: number;
  region: string;
  domain: string;
  status: "Active" | "Provisioning" | "Suspended";
  apiCalls: string;
  created: string;
  email: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Initial mock data
// ---------------------------------------------------------------------------

const INITIAL_TENANTS: Tenant[] = [
  { id: "t1", name: "Glimmora HQ", plan: "Enterprise", users: 120, region: "US-East", domain: "app.glimmora.com", status: "Active", apiCalls: "324K", created: "2026-01-10", email: "admin@glimmora.com", description: "Primary headquarters tenant" },
  { id: "t2", name: "VerifAI", plan: "Pro", users: 85, region: "US-West", domain: "verifai.glimmora.io", status: "Active", apiCalls: "218K", created: "2026-01-18", email: "ops@verifai.com", description: "AI verification platform" },
  { id: "t3", name: "Diamond Corp", plan: "Pro", users: 62, region: "EU-West", domain: "diamond.glimmora.io", status: "Active", apiCalls: "156K", created: "2026-02-05", email: "it@diamondcorp.com", description: "European diamond trading" },
  { id: "t4", name: "Hospitality Co", plan: "Starter", users: 34, region: "AP-South", domain: "hospitality.glimmora.io", status: "Active", apiCalls: "89K", created: "2026-02-20", email: "tech@hospitality.co", description: "Hospitality management" },
  { id: "t5", name: "Tax Solutions", plan: "Pro", users: 48, region: "US-East", domain: "tax.glimmora.io", status: "Active", apiCalls: "67K", created: "2026-03-01", email: "dev@taxsolutions.com", description: "Tax filing and compliance" },
  { id: "t6", name: "Aero Systems", plan: "Enterprise", users: 133, region: "EU-Central", domain: "aero.glimmora.io", status: "Provisioning", apiCalls: "—", created: "2026-03-15", email: "platform@aerosys.io", description: "Aerospace systems integration" },
];

const PLAN_BADGE_STYLES: Record<Tenant["plan"], { bg: string; color: string }> = {
  Enterprise: { bg: "rgba(20, 184, 166, 0.15)", color: "#14b8a6" },
  Pro: { bg: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" },
  Starter: { bg: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" },
};

const STATUS_DOT_COLORS: Record<Tenant["status"], string> = {
  Active: "#22c55e",
  Provisioning: "#f59e0b",
  Suspended: "#ef4444",
};

const REGIONS = ["US-East", "US-West", "EU-West", "EU-Central", "AP-South", "AP-East"];
const PLANS: Tenant["plan"][] = ["Starter", "Pro", "Enterprise"];
const STATUSES: Tenant["status"][] = ["Active", "Provisioning", "Suspended"];
const PAGE_SIZE = 5;

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

function StatCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string | number; detail?: string }) {
  return (
    <div
      className="flex items-center gap-4 rounded-xl border p-5"
      style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium" style={{ color: "var(--gf-text-secondary)" }}>{label}</p>
        <p className="text-xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{value}</p>
        {detail && <p className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>{detail}</p>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Delete Confirmation Modal
// ---------------------------------------------------------------------------

function DeleteModal({ tenant, onConfirm, onCancel }: { tenant: Tenant; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div
        className="w-full max-w-md rounded-2xl border p-6 shadow-2xl"
        style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Delete Tenant</h2>
        </div>
        <p className="text-sm mb-6" style={{ color: "var(--gf-text-secondary)" }}>
          Are you sure you want to delete <strong style={{ color: "var(--gf-text-primary)" }}>{tenant.name}</strong>? This action cannot be undone. All data, users, and configurations for this tenant will be permanently removed.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium border transition-colors hover:opacity-80"
            style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-red-600 transition-colors hover:bg-red-700"
          >
            Delete Tenant
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Suspend / Activate Confirmation Modal
// ---------------------------------------------------------------------------

function StatusChangeModal({ tenant, action, onConfirm, onCancel }: { tenant: Tenant; action: "suspend" | "activate"; onConfirm: () => void; onCancel: () => void }) {
  const isSuspend = action === "suspend";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div
        className="w-full max-w-md rounded-2xl border p-6 shadow-2xl"
        style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isSuspend ? "bg-amber-500/15" : "bg-green-500/15"}`}>
            {isSuspend ? <Ban className="h-5 w-5 text-amber-500" /> : <CheckCircle2 className="h-5 w-5 text-green-500" />}
          </div>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>
            {isSuspend ? "Suspend" : "Activate"} Tenant
          </h2>
        </div>
        <p className="text-sm mb-6" style={{ color: "var(--gf-text-secondary)" }}>
          {isSuspend
            ? <>Are you sure you want to suspend <strong style={{ color: "var(--gf-text-primary)" }}>{tenant.name}</strong>? Users will lose access until the tenant is reactivated.</>
            : <>Activate <strong style={{ color: "var(--gf-text-primary)" }}>{tenant.name}</strong>? This will restore access for all users.</>
          }
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium border transition-colors hover:opacity-80"
            style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${isSuspend ? "bg-amber-600 hover:bg-amber-700" : "bg-green-600 hover:bg-green-700"}`}
          >
            {isSuspend ? "Suspend" : "Activate"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create / Edit Modal
// ---------------------------------------------------------------------------

function TenantFormModal({
  tenant,
  onSave,
  onCancel,
}: {
  tenant?: Tenant | null;
  onSave: (data: Omit<Tenant, "id" | "apiCalls" | "created">) => void;
  onCancel: () => void;
}) {
  const isEdit = !!tenant;
  const [name, setName] = useState(tenant?.name ?? "");
  const [email, setEmail] = useState(tenant?.email ?? "");
  const [plan, setPlan] = useState<Tenant["plan"]>(tenant?.plan ?? "Starter");
  const [region, setRegion] = useState(tenant?.region ?? "US-East");
  const [domain, setDomain] = useState(tenant?.domain ?? "");
  const [users, setUsers] = useState(tenant?.users ?? 0);
  const [status, setStatus] = useState<Tenant["status"]>(tenant?.status ?? "Provisioning");
  const [description, setDescription] = useState(tenant?.description ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Tenant name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email address";
    if (!domain.trim()) e.domain = "Domain is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({ name, email, plan, region, domain, users, status, description });
  };

  const fieldStyle = {
    backgroundColor: "var(--gf-bg-base)",
    borderColor: "var(--gf-border)",
    color: "var(--gf-text-primary)",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl"
        style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>
            {isEdit ? "Edit Tenant" : "Create New Tenant"}
          </h2>
          <button onClick={onCancel} className="rounded-lg p-1 transition-colors hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Row 1: Name + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>
                Tenant Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={fieldStyle}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>
                Admin Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@company.com"
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={fieldStyle}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Row 2: Plan + Region */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>
                Plan
              </label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value as Tenant["plan"])}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={fieldStyle}
              >
                {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>
                Region
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={fieldStyle}
              >
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* Row 3: Domain + Users */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>
                Domain *
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="company.glimmora.io"
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={fieldStyle}
              />
              {errors.domain && <p className="text-xs text-red-500 mt-1">{errors.domain}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>
                Initial Users
              </label>
              <input
                type="number"
                min={0}
                value={users}
                onChange={(e) => setUsers(Number(e.target.value))}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={fieldStyle}
              />
            </div>
          </div>

          {/* Row 4: Status (edit only) */}
          {isEdit && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Tenant["status"])}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                  style={fieldStyle}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief description of the tenant..."
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
              style={fieldStyle}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg px-4 py-2 text-sm font-medium border transition-colors hover:opacity-80"
              style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: "var(--gf-accent)" }}
            >
              {isEdit ? "Save Changes" : "Create Tenant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// View Tenant Slide-Over
// ---------------------------------------------------------------------------

function TenantDetail({ tenant, onClose, onEdit }: { tenant: Tenant; onClose: () => void; onEdit: () => void }) {
  const planStyle = PLAN_BADGE_STYLES[tenant.plan];
  const statusColor = STATUS_DOT_COLORS[tenant.status];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-lg h-full overflow-y-auto border-l shadow-2xl animate-in slide-in-from-right"
        style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Tenant Details</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors hover:opacity-80"
              style={{ borderColor: "var(--gf-border)", color: "var(--gf-accent)" }}
            >
              <Pencil className="h-3 w-3 inline mr-1" />
              Edit
            </button>
            <button onClick={onClose} className="rounded-lg p-1 transition-colors hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tenant avatar & name */}
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold"
              style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}
            >
              {tenant.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{tenant.name}</h3>
              <p className="text-sm" style={{ color: "var(--gf-text-secondary)" }}>{tenant.description}</p>
            </div>
          </div>

          {/* Status & Plan badges */}
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: planStyle.bg, color: planStyle.color }}
            >
              {tenant.plan}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${statusColor}20`, color: statusColor }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
              {tenant.status}
            </span>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Admin Email", value: tenant.email },
              { label: "Domain", value: tenant.domain },
              { label: "Region", value: tenant.region },
              { label: "Users", value: tenant.users.toString() },
              { label: "API Calls", value: tenant.apiCalls },
              { label: "Created", value: tenant.created },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                <p className="text-xs font-medium mb-0.5" style={{ color: "var(--gf-text-muted)" }}>{item.label}</p>
                <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Quick stats */}
          <div>
            <h4 className="text-sm font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>Usage Overview</h4>
            <div className="space-y-3">
              {[
                { label: "Storage Used", value: "12.4 GB", pct: 62 },
                { label: "API Rate Limit", value: "80%", pct: 80 },
                { label: "User Seats", value: `${tenant.users} / ${tenant.plan === "Enterprise" ? 500 : tenant.plan === "Pro" ? 200 : 50}`, pct: Math.min(100, (tenant.users / (tenant.plan === "Enterprise" ? 500 : tenant.plan === "Pro" ? 200 : 50)) * 100) },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: "var(--gf-text-secondary)" }}>{item.label}</span>
                    <span style={{ color: "var(--gf-text-primary)" }}>{item.value}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${item.pct}%`, backgroundColor: item.pct > 85 ? "#ef4444" : "var(--gf-accent)" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sort helpers
// ---------------------------------------------------------------------------

type SortKey = "name" | "plan" | "users" | "region" | "status" | "created";
type SortDir = "asc" | "desc";

function sortTenants(list: Tenant[], key: SortKey, dir: SortDir): Tenant[] {
  return [...list].sort((a, b) => {
    const va = a[key];
    const vb = b[key];
    if (typeof va === "number" && typeof vb === "number") return dir === "asc" ? va - vb : vb - va;
    return dir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
  });
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function TenantsContent() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);

  // Search & filter
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState<Tenant["plan"] | "All">("All");
  const [filterStatus, setFilterStatus] = useState<Tenant["status"] | "All">("All");
  const [filterRegion, setFilterRegion] = useState<string>("All");
  const [showFilters, setShowFilters] = useState(false);

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Pagination
  const [page, setPage] = useState(1);

  // Modals
  const [formModal, setFormModal] = useState<{ open: boolean; tenant: Tenant | null }>({ open: false, tenant: null });
  const [deleteModal, setDeleteModal] = useState<Tenant | null>(null);
  const [statusModal, setStatusModal] = useState<{ tenant: Tenant; action: "suspend" | "activate" } | null>(null);
  const [viewTenant, setViewTenant] = useState<Tenant | null>(null);

  // Action dropdown
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const filtered = useMemo(() => {
    let list = tenants;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q) || t.domain.toLowerCase().includes(q) || t.email.toLowerCase().includes(q));
    }
    if (filterPlan !== "All") list = list.filter((t) => t.plan === filterPlan);
    if (filterStatus !== "All") list = list.filter((t) => t.status === filterStatus);
    if (filterRegion !== "All") list = list.filter((t) => t.region === filterRegion);
    return sortTenants(list, sortKey, sortDir);
  }, [tenants, search, filterPlan, filterStatus, filterRegion, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Stats
  const activeTenants = tenants.filter((t) => t.status === "Active").length;
  const totalUsers = tenants.reduce((s, t) => s + t.users, 0);
  const uniqueRegions = new Set(tenants.map((t) => t.region)).size;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleCreate = (data: Omit<Tenant, "id" | "apiCalls" | "created">) => {
    const newTenant: Tenant = {
      ...data,
      id: `t${Date.now()}`,
      apiCalls: "—",
      created: new Date().toISOString().slice(0, 10),
    };
    setTenants((prev) => [newTenant, ...prev]);
    setFormModal({ open: false, tenant: null });
  };

  const handleEdit = (data: Omit<Tenant, "id" | "apiCalls" | "created">) => {
    if (!formModal.tenant) return;
    setTenants((prev) =>
      prev.map((t) => (t.id === formModal.tenant!.id ? { ...t, ...data } : t))
    );
    setFormModal({ open: false, tenant: null });
    if (viewTenant?.id === formModal.tenant.id) {
      setViewTenant((prev) => (prev ? { ...prev, ...data } : null));
    }
  };

  const handleDelete = () => {
    if (!deleteModal) return;
    setTenants((prev) => prev.filter((t) => t.id !== deleteModal.id));
    setDeleteModal(null);
    if (viewTenant?.id === deleteModal.id) setViewTenant(null);
  };

  const handleStatusChange = () => {
    if (!statusModal) return;
    const newStatus: Tenant["status"] = statusModal.action === "suspend" ? "Suspended" : "Active";
    setTenants((prev) =>
      prev.map((t) => (t.id === statusModal.tenant.id ? { ...t, status: newStatus } : t))
    );
    if (viewTenant?.id === statusModal.tenant.id) {
      setViewTenant((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    setStatusModal(null);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const handleExport = () => {
    const header = "Name,Plan,Users,Region,Domain,Status,API Calls,Created,Email\n";
    const rows = tenants.map((t) => `"${t.name}","${t.plan}",${t.users},"${t.region}","${t.domain}","${t.status}","${t.apiCalls}","${t.created}","${t.email}"`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tenants-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  const clearFilters = () => {
    setSearch("");
    setFilterPlan("All");
    setFilterStatus("All");
    setFilterRegion("All");
    setPage(1);
  };

  const hasActiveFilters = search || filterPlan !== "All" || filterStatus !== "All" || filterRegion !== "All";

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>
            Tenant Management
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>
            Multi-tenant onboarding, plans, entitlements, and isolation configuration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition-colors hover:opacity-80"
            style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={() => setFormModal({ open: true, tenant: null })}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors text-white"
            style={{ backgroundColor: "var(--gf-accent)" }}
          >
            <Plus className="h-4 w-4" />
            Create Tenant
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Building2 className="h-5 w-5" />} label="Active Tenants" value={activeTenants} />
        <StatCard icon={<Users className="h-5 w-5" />} label="Total Users" value={totalUsers} />
        <StatCard icon={<Building2 className="h-5 w-5" />} label="Plans" value={3} detail="Starter / Pro / Enterprise" />
        <StatCard icon={<Globe className="h-5 w-5" />} label="Regions" value={uniqueRegions} />
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--gf-text-muted)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search tenants by name, domain, or email..."
            className="w-full rounded-lg border pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
            style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${showFilters ? "ring-2 ring-[var(--gf-accent)]/40" : ""}`}
          style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)", backgroundColor: "var(--gf-bg-surface)" }}
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>
              {[filterPlan !== "All", filterStatus !== "All", filterRegion !== "All"].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filter Dropdowns */}
      {showFilters && (
        <div
          className="flex flex-wrap items-center gap-3 rounded-xl border p-4"
          style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}
        >
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-muted)" }}>Plan</label>
            <select
              value={filterPlan}
              onChange={(e) => { setFilterPlan(e.target.value as Tenant["plan"] | "All"); setPage(1); }}
              className="rounded-lg border px-3 py-1.5 text-sm outline-none"
              style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
            >
              <option value="All">All Plans</option>
              {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-muted)" }}>Status</label>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value as Tenant["status"] | "All"); setPage(1); }}
              className="rounded-lg border px-3 py-1.5 text-sm outline-none"
              style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
            >
              <option value="All">All Statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-muted)" }}>Region</label>
            <select
              value={filterRegion}
              onChange={(e) => { setFilterRegion(e.target.value); setPage(1); }}
              className="rounded-lg border px-3 py-1.5 text-sm outline-none"
              style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
            >
              <option value="All">All Regions</option>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:text-red-400"
            >
              <X className="h-3 w-3" />
              Clear All
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      {hasActiveFilters && (
        <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>
          Showing {filtered.length} of {tenants.length} tenants
        </p>
      )}

      {/* Tenants Table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className="text-xs uppercase"
                style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-secondary)" }}
              >
                {([
                  { key: "name" as SortKey, label: "Tenant Name" },
                  { key: "plan" as SortKey, label: "Plan" },
                  { key: "users" as SortKey, label: "Users" },
                  { key: "region" as SortKey, label: "Region" },
                  { key: null, label: "Domain" },
                  { key: null, label: "API Calls" },
                  { key: "status" as SortKey, label: "Status" },
                  { key: "created" as SortKey, label: "Created" },
                  { key: null, label: "Actions" },
                ] as const).map((col, i) => (
                  <th
                    key={i}
                    className={`px-6 py-3 text-left font-medium ${col.key ? "cursor-pointer select-none hover:opacity-80" : ""}`}
                    onClick={col.key ? () => handleSort(col.key!) : undefined}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.key && <SortIcon col={col.key} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
                    <p className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>No tenants found</p>
                    <p className="text-xs mt-1" style={{ color: "var(--gf-text-muted)" }}>
                      {hasActiveFilters ? "Try adjusting your filters" : "Create your first tenant to get started"}
                    </p>
                  </td>
                </tr>
              ) : (
                paged.map((tenant) => {
                  const planStyle = PLAN_BADGE_STYLES[tenant.plan];
                  const statusColor = STATUS_DOT_COLORS[tenant.status];

                  return (
                    <tr
                      key={tenant.id}
                      className="border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      style={{ borderColor: "var(--gf-border)" }}
                    >
                      {/* Tenant Name */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setViewTenant(tenant)}
                          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                        >
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                            style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}
                          >
                            {tenant.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium underline-offset-2 hover:underline" style={{ color: "var(--gf-text-primary)" }}>
                            {tenant.name}
                          </span>
                        </button>
                      </td>

                      {/* Plan */}
                      <td className="px-6 py-4">
                        <span
                          className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: planStyle.bg, color: planStyle.color }}
                        >
                          {tenant.plan}
                        </span>
                      </td>

                      {/* Users */}
                      <td className="px-6 py-4 text-sm" style={{ color: "var(--gf-text-primary)" }}>{tenant.users}</td>

                      {/* Region */}
                      <td className="px-6 py-4 text-sm" style={{ color: "var(--gf-text-secondary)" }}>{tenant.region}</td>

                      {/* Domain */}
                      <td className="px-6 py-4 text-xs font-mono" style={{ color: "var(--gf-text-secondary)" }}>{tenant.domain}</td>

                      {/* API Calls */}
                      <td className="px-6 py-4 text-sm" style={{ color: "var(--gf-text-secondary)" }}>{tenant.apiCalls}</td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColor }} />
                          <span className="text-sm" style={{ color: "var(--gf-text-secondary)" }}>{tenant.status}</span>
                        </div>
                      </td>

                      {/* Created */}
                      <td className="px-6 py-4 text-sm" style={{ color: "var(--gf-text-secondary)" }}>{tenant.created}</td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="relative">
                          <button
                            onClick={() => setOpenActionId(openActionId === tenant.id ? null : tenant.id)}
                            className="rounded-lg p-1.5 transition-colors hover:opacity-70"
                            style={{ color: "var(--gf-text-secondary)" }}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>

                          {openActionId === tenant.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setOpenActionId(null)} />
                              <div
                                className="absolute right-0 top-8 z-50 w-44 rounded-xl border py-1 shadow-xl"
                                style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}
                              >
                                <button
                                  onClick={() => { setViewTenant(tenant); setOpenActionId(null); }}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                  style={{ color: "var(--gf-text-primary)" }}
                                >
                                  <Eye className="h-4 w-4" style={{ color: "var(--gf-text-secondary)" }} />
                                  View Details
                                </button>
                                <button
                                  onClick={() => { setFormModal({ open: true, tenant }); setOpenActionId(null); }}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                  style={{ color: "var(--gf-text-primary)" }}
                                >
                                  <Pencil className="h-4 w-4" style={{ color: "var(--gf-text-secondary)" }} />
                                  Edit Tenant
                                </button>
                                {tenant.status === "Active" ? (
                                  <button
                                    onClick={() => { setStatusModal({ tenant, action: "suspend" }); setOpenActionId(null); }}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                    style={{ color: "#f59e0b" }}
                                  >
                                    <Ban className="h-4 w-4" />
                                    Suspend
                                  </button>
                                ) : tenant.status === "Suspended" ? (
                                  <button
                                    onClick={() => { setStatusModal({ tenant, action: "activate" }); setOpenActionId(null); }}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                    style={{ color: "#22c55e" }}
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Activate
                                  </button>
                                ) : null}
                                <div className="my-1 border-t" style={{ borderColor: "var(--gf-border)" }} />
                                <button
                                  onClick={() => { setDeleteModal(tenant); setOpenActionId(null); }}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 transition-colors hover:bg-red-500/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div
            className="flex items-center justify-between border-t px-6 py-3"
            style={{ borderColor: "var(--gf-border)" }}
          >
            <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>
              Page {safePage} of {totalPages} ({filtered.length} tenants)
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="rounded-lg p-1.5 transition-colors hover:opacity-70 disabled:opacity-30"
                style={{ color: "var(--gf-text-secondary)" }}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`h-7 w-7 rounded-lg text-xs font-medium transition-colors ${n === safePage ? "text-white" : "hover:opacity-70"}`}
                  style={n === safePage ? { backgroundColor: "var(--gf-accent)" } : { color: "var(--gf-text-secondary)" }}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="rounded-lg p-1.5 transition-colors hover:opacity-70 disabled:opacity-30"
                style={{ color: "var(--gf-text-secondary)" }}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ---- Modals ---- */}

      {/* Create / Edit Modal */}
      {formModal.open && (
        <TenantFormModal
          tenant={formModal.tenant}
          onSave={formModal.tenant ? handleEdit : handleCreate}
          onCancel={() => setFormModal({ open: false, tenant: null })}
        />
      )}

      {/* Delete Confirmation */}
      {deleteModal && (
        <DeleteModal
          tenant={deleteModal}
          onConfirm={handleDelete}
          onCancel={() => setDeleteModal(null)}
        />
      )}

      {/* Suspend / Activate Confirmation */}
      {statusModal && (
        <StatusChangeModal
          tenant={statusModal.tenant}
          action={statusModal.action}
          onConfirm={handleStatusChange}
          onCancel={() => setStatusModal(null)}
        />
      )}

      {/* View Detail Slide-Over */}
      {viewTenant && (
        <TenantDetail
          tenant={viewTenant}
          onClose={() => setViewTenant(null)}
          onEdit={() => {
            setFormModal({ open: true, tenant: viewTenant });
            setViewTenant(null);
          }}
        />
      )}
    </div>
  );
}
