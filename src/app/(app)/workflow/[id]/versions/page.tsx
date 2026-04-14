"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, History, Check, FileText, Clock } from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import type { UserRole } from "@/lib/roles";

interface Version {
  version: number;
  status: string;
  changedBy: string;
  changedAt: string;
  summary: string;
}

export default function WorkflowVersionHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as string;
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/workflows/${workflowId}/versions`)
      .then((r) => r.json())
      .then((d) => { setVersions(d.versions); setLoading(false); })
      .catch(() => setLoading(false));
  }, [workflowId]);

  const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
    Published: { bg: "bg-green-500/15", text: "text-green-500" },
    Draft: { bg: "bg-amber-500/15", text: "text-amber-500" },
  };

  return (
    <AuthGuard allowedRoles={["workflow_manager", "super_admin"] as UserRole[]}>
      <div className="space-y-6 max-w-3xl">
        <button onClick={() => router.push("/workflow")} className="flex items-center gap-2 text-sm font-medium hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
          <ArrowLeft className="h-4 w-4" />Back to Workflows
        </button>

        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Version History</h1>
          <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>Workflow ID: {workflowId}</p>
        </div>

        <div className="rounded-xl border" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          {loading ? (
            <div className="px-5 py-12 text-center text-sm" style={{ color: "var(--gf-text-muted)" }}>Loading...</div>
          ) : versions.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <History className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
              <p className="text-sm" style={{ color: "var(--gf-text-muted)" }}>No versions found</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--gf-border)" }}>
              {versions.map((v, i) => {
                const s = STATUS_STYLES[v.status] ?? STATUS_STYLES.Draft;
                const isLatest = i === 0;
                return (
                  <div key={v.version} className="flex items-start gap-4 px-6 py-4 hover:bg-black/5 dark:hover:bg-white/5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: isLatest ? "var(--gf-accent)" : "var(--gf-bg-elevated)", color: isLatest ? "#fff" : "var(--gf-text-muted)" }}>
                      <span className="text-sm font-bold">v{v.version}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{v.summary}</span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>{v.status}</span>
                        {isLatest && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500">Latest</span>}
                      </div>
                      <div className="flex items-center gap-3 text-xs" style={{ color: "var(--gf-text-muted)" }}>
                        <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{v.changedBy}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{v.changedAt}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
