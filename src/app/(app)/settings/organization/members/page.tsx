"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Search, UserPlus, Users, UserCheck, Mail, UserX,
  ChevronLeft, ChevronRight, Pencil, Trash2,
  AlertTriangle, X, Send, CheckCircle2, Copy,
} from "lucide-react";
import { ROLE_LABELS, ROLE_BADGE_CLASSES, type UserRole } from "@/lib/roles";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Member {
  id: string; name: string; email: string; role: UserRole;
  status: "Active" | "Inactive" | "Invited"; joinedDate: string; lastLogin: string;
}

const END_USER_ROLES: UserRole[] = [
  "tenant_admin", "auditor", "workflow_manager",
  "billing_admin", "developer", "tenant_member", "guest_viewer",
];

const PAGE_SIZE = 5;
const STATUS_COLORS: Record<string, string> = {
  Active: "bg-green-500/10 text-green-400",
  Inactive: "bg-gray-500/10 text-gray-400",
  Invited: "bg-amber-500/10 text-amber-400",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function MembersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [showInvite, setShowInvite] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  const tenantId = user?.tenantId;

  const fetchMembers = useCallback(async () => {
    if (!tenantId) return;
    try {
      const { orgsApi } = await import("@/lib/api");
      const list = await orgsApi.listMembers(tenantId);
      setMembers(
        list.map((m) => ({
          id: m.user_id,
          name: m.full_name || m.email,
          email: m.email,
          role: m.role_in_tenant as UserRole,
          status: m.is_active ? "Active" : "Inactive",
          joinedDate: new Date(m.joined_at).toLocaleDateString(),
          lastLogin: "—",
        })),
      );
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const filtered = useMemo(() => {
    return members.filter((m) => {
      if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.email.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      return true;
    });
  }, [members, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const active = members.filter((m) => m.status === "Active").length;
  const invited = members.filter((m) => m.status === "Invited").length;
  const inactive = members.filter((m) => m.status === "Inactive").length;

  const handleRemove = async () => {
    if (!removeTarget || !tenantId) return;
    try {
      const { orgsApi } = await import("@/lib/api");
      await orgsApi.removeMember(tenantId, removeTarget.id);
      toast.success("Member removed successfully");
    } catch {
      toast.error("Failed to remove member");
    }
    setRemoveTarget(null);
    fetchMembers();
  };

  const handleInvited = () => {
    setShowInvite(false);
    fetchMembers();
  };

  return (
    <AuthGuard allowedRoles={["tenant_admin"] as UserRole[]}>
    <div className="space-y-6">
      <button onClick={() => router.push("/settings/organization")}
        className="flex items-center gap-2 text-sm font-medium hover:opacity-70"
        style={{ color: "var(--gf-text-secondary)" }}>
        <ArrowLeft className="h-4 w-4" /> Back to Organization
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Organization Members</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>Manage members of {user?.fullName ?? "your organization"}</p>
        </div>
        <button onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--gf-accent)" }}>
          <UserPlus className="h-4 w-4" /> Invite Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: members.length, icon: <Users className="h-5 w-5" /> },
          { label: "Active", value: active, icon: <UserCheck className="h-5 w-5" /> },
          { label: "Invited", value: invited, icon: <Mail className="h-5 w-5" /> },
          { label: "Inactive", value: inactive, icon: <UserX className="h-5 w-5" /> },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-5" style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}>
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}>{s.icon}</div>
              <span className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{s.value}</span>
            </div>
            <p className="mt-3 text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--gf-text-muted)" }} />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search members..." className="w-full rounded-lg border pl-9 pr-3 py-2 text-sm outline-none"
            style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border px-3 py-2 text-sm outline-none"
          style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Invited">Invited</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
              {["Name", "Email", "Role", "Status", "Last Active", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--gf-text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: "var(--gf-text-muted)" }}>Loading...</td></tr>
            ) : paged.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: "var(--gf-text-muted)" }}>No members found</td></tr>
            ) : paged.map((m) => (
              <tr key={m.id} className="border-t hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: "var(--gf-border)" }}>
                <td className="px-4 py-3 font-medium" style={{ color: "var(--gf-text-primary)" }}>{m.name}</td>
                <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>{m.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_BADGE_CLASSES[m.role] ?? ""}`}>{ROLE_LABELS[m.role] ?? m.role}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[m.status] ?? ""}`}>{m.status}</span>
                </td>
                <td className="px-4 py-3" style={{ color: "var(--gf-text-muted)" }}>{m.lastLogin ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button title="Edit Role" className="rounded-lg p-1.5 hover:bg-black/10 dark:hover:bg-white/10"
                      style={{ color: "var(--gf-text-secondary)" }}><Pencil className="h-4 w-4" /></button>
                    <button title="Remove" onClick={() => setRemoveTarget(m)}
                      className="rounded-lg p-1.5 hover:bg-red-500/10 text-red-400"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-1">
            <button onClick={() => setPage(page - 1)} disabled={page === 1}
              className="rounded-lg border px-2 py-1 disabled:opacity-40"
              style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={() => setPage(page + 1)} disabled={page === totalPages}
              className="rounded-lg border px-2 py-1 disabled:opacity-40"
              style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && tenantId && <InviteModal tenantId={tenantId} onClose={() => setShowInvite(false)} onInvited={handleInvited} />}

      {/* Remove Modal */}
      {removeTarget && (
        <RemoveModal member={removeTarget} orgName={user?.fullName ?? "your organization"}
          onConfirm={handleRemove}
          onCancel={() => setRemoveTarget(null)} />
      )}
    </div>
    </AuthGuard>
  );
}

// ---------------------------------------------------------------------------
// Invite Modal
// ---------------------------------------------------------------------------
function InviteModal({ tenantId, onClose, onInvited }: { tenantId: string; onClose: () => void; onInvited: () => void }) {
  const [email, setEmail] = useState("");
  const [memberId, setMemberId] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");

  const handleSend = async () => {
    if (!email) return;
    setIsLoading(true);
    try {
      const { orgsApi } = await import("@/lib/api");
      const inv = await orgsApi.invite(tenantId, { email });
      // The backend returns the raw invitation token only on creation —
      // build a deep link the recipient can follow.
      const token = inv.invitation_token ?? inv.id;
      setInviteUrl(`${window.location.origin}/invite/${token}`);
      void message;
      void memberId;
      setSent(true);
      setTimeout(() => { onInvited(); }, 2000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send invitation");
    } finally {
      setIsLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    toast.success("Invite link copied!");
  };

  const fieldStyle = { backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-2xl"
        style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}
        onClick={(e) => e.stopPropagation()}>
        {sent ? (
          <div className="flex flex-col items-center py-6">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
            <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Invitation Sent!</h2>
            <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>Sent to {email}</p>
            {inviteUrl && (
              <button onClick={copyLink}
                className="mt-3 flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium hover:opacity-80"
                style={{ borderColor: "var(--gf-border)", color: "var(--gf-accent)" }}>
                <Copy className="h-3 w-3" /> Copy Invite Link
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Invite Member</h2>
              <button onClick={onClose} style={{ color: "var(--gf-text-muted)" }}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Email Address *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@company.com"
                  className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none" style={fieldStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Member ID</label>
                <input type="text" value={memberId} onChange={(e) => setMemberId(e.target.value)} placeholder="e.g. MEM-001"
                  className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none" style={fieldStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Message (optional)</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2}
                  placeholder="Add a note..." className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none resize-none" style={fieldStyle} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium border"
                  style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
                <button onClick={handleSend} disabled={!email || isLoading}
                  className="flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: "var(--gf-accent)" }}>
                  <Send className="h-4 w-4" /> {isLoading ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Remove Modal
// ---------------------------------------------------------------------------
function RemoveModal({ member, orgName, onConfirm, onCancel }: { member: Member; orgName: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-2xl"
        style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Remove Member</h2>
        </div>
        <p className="text-sm mb-6" style={{ color: "var(--gf-text-secondary)" }}>
          Are you sure you want to remove <strong style={{ color: "var(--gf-text-primary)" }}>{member.name}</strong> from {orgName}?
          They will lose access to all organization resources immediately.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium border"
            style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
          <button onClick={onConfirm} className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700">
            Remove Member
          </button>
        </div>
      </div>
    </div>
  );
}
