"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  XCircle,
  Clock,
  AlertTriangle,
  Send,
  User,
  Calendar,
  Tag,
  GitBranch,
  FileText,
  Loader2,
  X,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/context/auth-context";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TaskDetail {
  id: string;
  title: string;
  type: string;
  workflow: string;
  workflowInstanceId: string;
  priority: string;
  status: string;
  assignee: string;
  approver?: string;
  requester: string;
  description: string;
  dueDate: string;
  createdAt: string;
  metadata: Record<string, string>;
  history: { action: string; by: string; at: string }[];
}

interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Approve / Reject Buttons (Component) — Approver only
// ---------------------------------------------------------------------------

function ActionButtons({
  onApprove,
  onReject,
  processing,
}: {
  onApprove: () => void;
  onReject: () => void;
  processing: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onApprove}
        disabled={processing}
        className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50"
      >
        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        Approve
      </button>
      <button
        onClick={onReject}
        disabled={processing}
        className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
      >
        <XCircle className="h-4 w-4" />Reject
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reject Reason Modal
// ---------------------------------------------------------------------------

function RejectReasonModal({
  onConfirm,
  onCancel,
  processing,
}: {
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  processing: boolean;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) { setError("Please provide a reason for rejection"); return; }
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div
        className="w-full max-w-md rounded-2xl border p-6 shadow-2xl"
        style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Reject Task</h2>
          </div>
          <button onClick={onCancel} className="p-1 hover:opacity-70" style={{ color: "var(--gf-text-muted)" }}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Reason for Rejection *</label>
          <textarea
            value={reason}
            onChange={(e) => { setReason(e.target.value); setError(""); }}
            placeholder="Please explain why this task is being rejected..."
            rows={4}
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40 resize-none"
            style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium border hover:opacity-80"
            style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
          <button onClick={handleSubmit} disabled={processing}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50">
            {processing ? "Rejecting..." : "Confirm Rejection"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Comments Section (Component)
// ---------------------------------------------------------------------------

function CommentsSection({ taskId }: { taskId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetch(`/api/tasks/${taskId}/comments`)
      .then((r) => r.json())
      .then(setComments)
      .catch(() => {});
  }, [taskId]);

  const handlePost = async () => {
    if (!newComment.trim()) return;
    setPosting(true);
    const res = await fetch(`/api/tasks/${taskId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newComment }),
    });
    const comment = await res.json();
    setComments((prev) => [...prev, comment]);
    setNewComment("");
    setPosting(false);
  };

  return (
    <div className="rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
      <h2 className="text-sm font-bold mb-4" style={{ color: "var(--gf-text-primary)" }}>Comments ({comments.length})</h2>

      {/* Comment List */}
      <div className="space-y-3 mb-4">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
              style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}>
              {c.author.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold" style={{ color: "var(--gf-text-primary)" }}>{c.author}</span>
                <span className="text-[10px]" style={{ color: "var(--gf-text-muted)" }}>
                  {new Date(c.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm" style={{ color: "var(--gf-text-secondary)" }}>{c.text}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-xs text-center py-4" style={{ color: "var(--gf-text-muted)" }}>No comments yet</p>
        )}
      </div>

      {/* New Comment */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handlePost()}
          placeholder="Add a comment..."
          className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
          style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
        />
        <button onClick={handlePost} disabled={posting || !newComment.trim()}
          className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          style={{ backgroundColor: "var(--gf-accent)" }}>
          {posting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          Send
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Task Detail Page
// ---------------------------------------------------------------------------

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const taskId = params.id as string;

  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetch(`/api/tasks/${taskId}`)
      .then((r) => r.json())
      .then((d) => { setTask(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [taskId]);

  const handleApprove = async () => {
    setProcessing(true);
    await fetch(`/api/tasks/${taskId}/approve`, { method: "POST" });
    setTask((prev) => prev ? { ...prev, status: "Approved" } : null);
    setProcessing(false);
  };

  const handleReject = async (reason: string) => {
    setProcessing(true);
    await fetch(`/api/tasks/${taskId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    setTask((prev) => prev ? { ...prev, status: "Rejected" } : null);
    setProcessing(false);
    setShowRejectModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--gf-accent)" }} />
      </div>
    );
  }

  if (!task) return null;

  const isPending = task.status === "Pending";

  // Approver check: user is the assigned approver (assignee) or has an approver role
  const currentUserName = user?.fullName ?? "";
  const isApprover =
    task.assignee === "Current User" ||
    task.assignee === currentUserName ||
    task.approver === currentUserName ||
    task.approver === "Current User";

  const PRIORITY_STYLES: Record<string, { bg: string; text: string }> = {
    Urgent: { bg: "bg-red-500/15", text: "text-red-500" },
    High: { bg: "bg-orange-500/15", text: "text-orange-500" },
    Medium: { bg: "bg-blue-500/15", text: "text-blue-500" },
    Low: { bg: "bg-gray-500/15", text: "text-gray-400" },
  };

  const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
    Pending: { bg: "bg-amber-500/15", text: "text-amber-500" },
    Approved: { bg: "bg-green-500/15", text: "text-green-500" },
    Rejected: { bg: "bg-red-500/15", text: "text-red-500" },
    Completed: { bg: "bg-blue-500/15", text: "text-blue-500" },
  };

  const ps = PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.Medium;
  const ss = STATUS_STYLES[task.status] ?? STATUS_STYLES.Pending;

  return (
    <AuthGuard>
      <div className="space-y-6 max-w-4xl">
        <button onClick={() => router.push("/tasks")} className="flex items-center gap-2 text-sm font-medium hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
          <ArrowLeft className="h-4 w-4" />Back to Task Inbox
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{task.title}</h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ss.bg} ${ss.text}`}>{task.status}</span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ps.bg} ${ps.text}`}>{task.priority}</span>
              <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-muted)" }}>{task.type}</span>
            </div>
          </div>
          {/* Approve/Reject only visible to assigned approver when task is pending */}
          {isPending && isApprover && (
            <ActionButtons onApprove={handleApprove} onReject={() => setShowRejectModal(true)} processing={processing} />
          )}
        </div>

        {/* Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
              <h2 className="text-sm font-bold mb-3" style={{ color: "var(--gf-text-primary)" }}>Description</h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--gf-text-secondary)" }}>{task.description}</p>
            </div>

            {/* Metadata */}
            {Object.keys(task.metadata).length > 0 && (
              <div className="rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
                <h2 className="text-sm font-bold mb-3" style={{ color: "var(--gf-text-primary)" }}>Details</h2>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(task.metadata).map(([key, value]) => (
                    <div key={key} className="rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                      <p className="text-[11px] font-medium" style={{ color: "var(--gf-text-muted)" }}>{key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}</p>
                      <p className="text-sm font-medium mt-0.5" style={{ color: "var(--gf-text-primary)" }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <CommentsSection taskId={taskId} />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Info */}
            <div className="rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
              <h2 className="text-sm font-bold mb-3" style={{ color: "var(--gf-text-primary)" }}>Information</h2>
              <div className="space-y-3">
                {[
                  { icon: <User className="h-4 w-4" />, label: "Assignee", value: task.assignee },
                  { icon: <User className="h-4 w-4" />, label: "Requester", value: task.requester },
                  { icon: <GitBranch className="h-4 w-4" />, label: "Workflow", value: task.workflow },
                  { icon: <Tag className="h-4 w-4" />, label: "Type", value: task.type },
                  { icon: <Calendar className="h-4 w-4" />, label: "Due Date", value: task.dueDate },
                  { icon: <Clock className="h-4 w-4" />, label: "Created", value: new Date(task.createdAt).toLocaleDateString() },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span style={{ color: "var(--gf-text-muted)" }}>{item.icon}</span>
                    <div>
                      <p className="text-[10px] font-medium" style={{ color: "var(--gf-text-muted)" }}>{item.label}</p>
                      <p className="text-xs font-medium" style={{ color: "var(--gf-text-primary)" }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity History */}
            <div className="rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
              <h2 className="text-sm font-bold mb-3" style={{ color: "var(--gf-text-primary)" }}>Activity</h2>
              <div className="space-y-3">
                {task.history.map((h, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full mt-0.5" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                      <FileText className="h-3 w-3" style={{ color: "var(--gf-text-muted)" }} />
                    </div>
                    <div>
                      <p className="text-xs font-medium" style={{ color: "var(--gf-text-primary)" }}>{h.action}</p>
                      <p className="text-[10px]" style={{ color: "var(--gf-text-muted)" }}>{h.by} · {new Date(h.at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reject Modal */}
        {showRejectModal && (
          <RejectReasonModal onConfirm={handleReject} onCancel={() => setShowRejectModal(false)} processing={processing} />
        )}
      </div>
    </AuthGuard>
  );
}
