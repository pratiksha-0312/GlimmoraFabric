"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Play,
  Square,
  Diamond,
  StopCircle,
  Check,
  Clock,
  Loader2,
  XCircle,
  AlertTriangle,
  X,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import type { UserRole } from "@/lib/roles";

interface Step {
  id: string;
  name: string;
  type: "start" | "task" | "decision" | "end";
  status: "completed" | "running" | "pending" | "failed";
  completedAt?: string;
  startedAt?: string;
  assignee?: string;
  result?: string;
}

interface InstanceDetail {
  id: string;
  workflowId: string;
  workflowName: string;
  triggeredBy: string;
  status: string;
  startedAt: string;
  sla: string;
  steps: Step[];
}

const TYPE_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  start: { icon: <Play className="h-3.5 w-3.5" />, color: "#22c55e" },
  task: { icon: <Square className="h-3.5 w-3.5" />, color: "#3b82f6" },
  decision: { icon: <Diamond className="h-3.5 w-3.5" />, color: "#f59e0b" },
  end: { icon: <StopCircle className="h-3.5 w-3.5" />, color: "#ef4444" },
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  completed: <Check className="h-4 w-4 text-green-500" />,
  running: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />,
  pending: <Clock className="h-4 w-4 text-gray-400" />,
  failed: <XCircle className="h-4 w-4 text-red-500" />,
};

export default function InstanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const instanceId = params.id as string;
  const [instance, setInstance] = useState<InstanceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetch(`/api/workflow-instances/${instanceId}`)
      .then((r) => r.json())
      .then((d) => { setInstance(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [instanceId]);

  const handleCancel = async () => {
    setCancelling(true);
    await fetch(`/api/workflow-instances/${instanceId}/cancel`, { method: "POST" });
    setCancelling(false);
    setShowCancel(false);
    setInstance((prev) => prev ? { ...prev, status: "Cancelled" } : null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--gf-accent)" }} />
      </div>
    );
  }

  if (!instance) return null;

  const completedSteps = instance.steps.filter((s) => s.status === "completed").length;
  const progress = Math.round((completedSteps / instance.steps.length) * 100);

  return (
    <AuthGuard allowedRoles={["workflow_manager"] as UserRole[]}>
      <div className="space-y-6">
        <button onClick={() => router.push("/admin/workflows/instances")} className="flex items-center gap-2 text-sm font-medium hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
          <ArrowLeft className="h-4 w-4" />Back to Instances
        </button>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{instance.workflowName}</h1>
            <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>Instance: {instance.id} · Triggered by {instance.triggeredBy}</p>
          </div>
          {instance.status === "Running" && (
            <button onClick={() => setShowCancel(true)} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700">
              <XCircle className="h-4 w-4" />Cancel Instance
            </button>
          )}
        </div>

        {/* Status Bar */}
        <div className="rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${instance.status === "Running" ? "bg-blue-500/15 text-blue-500" : instance.status === "Cancelled" ? "bg-gray-500/15 text-gray-400" : "bg-green-500/15 text-green-500"}`}>
                {instance.status}
              </span>
              <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>SLA: {instance.sla}</span>
            </div>
            <span className="text-sm font-bold" style={{ color: "var(--gf-accent)" }}>{progress}%</span>
          </div>
          <div className="h-2 rounded-full" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: "var(--gf-accent)" }} />
          </div>
          <p className="text-xs mt-2" style={{ color: "var(--gf-text-muted)" }}>{completedSteps} of {instance.steps.length} steps completed</p>
        </div>

        {/* Visual Status (Canvas - readonly) */}
        <div className="rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: "var(--gf-text-primary)" }}>Workflow Progress</h2>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {instance.steps.map((step, i) => {
              const t = TYPE_ICONS[step.type];
              const isLast = i === instance.steps.length - 1;
              return (
                <div key={step.id} className="flex items-center gap-2 shrink-0">
                  <div
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium ${step.status === "running" ? "ring-2 ring-blue-500/40" : ""}`}
                    style={{
                      borderColor: step.status === "completed" ? "#22c55e40" : step.status === "running" ? "#3b82f640" : "var(--gf-border)",
                      backgroundColor: step.status === "completed" ? "#22c55e08" : "var(--gf-bg-base)",
                      color: "var(--gf-text-primary)",
                    }}
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded" style={{ backgroundColor: `${t.color}20`, color: t.color }}>
                      {t.icon}
                    </div>
                    <div>
                      <p className="font-medium">{step.name}</p>
                      {step.assignee && <p className="text-[10px] mt-0.5" style={{ color: "var(--gf-text-muted)" }}>{step.assignee}</p>}
                    </div>
                    <div className="ml-2">{STATUS_ICONS[step.status]}</div>
                  </div>
                  {!isLast && <div className="w-6 h-0.5 rounded-full shrink-0" style={{ backgroundColor: step.status === "completed" ? "#22c55e" : "var(--gf-border)" }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step-by-Step Progress Tracker (Component) */}
        <div className="rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: "var(--gf-text-primary)" }}>Step Details</h2>
          <div className="space-y-3">
            {instance.steps.map((step) => {
              const t = TYPE_ICONS[step.type];
              return (
                <div key={step.id} className="flex items-center gap-4 rounded-lg border px-4 py-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                  <div>{STATUS_ICONS[step.status]}</div>
                  <div className="flex h-7 w-7 items-center justify-center rounded" style={{ backgroundColor: `${t.color}20`, color: t.color }}>{t.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{step.name}</p>
                    <div className="flex items-center gap-3 text-xs mt-0.5" style={{ color: "var(--gf-text-muted)" }}>
                      <span>{step.type}</span>
                      {step.assignee && <span>Assignee: {step.assignee}</span>}
                      {step.result && <span>Result: {step.result}</span>}
                    </div>
                  </div>
                  <div className="text-xs" style={{ color: "var(--gf-text-muted)" }}>
                    {step.completedAt ? new Date(step.completedAt).toLocaleTimeString() : step.startedAt ? "In progress..." : "Pending"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowCancel(false)}>
            <div className="w-full max-w-md rounded-2xl border p-6 shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Cancel Instance</h2>
              </div>
              <p className="text-sm mb-6" style={{ color: "var(--gf-text-secondary)" }}>
                Are you sure you want to cancel this workflow instance? This action cannot be undone and all pending steps will be skipped.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowCancel(false)} className="rounded-lg px-4 py-2 text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Keep Running</button>
                <button onClick={handleCancel} disabled={cancelling} className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60">
                  {cancelling ? "Cancelling..." : "Cancel Instance"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
