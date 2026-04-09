"use client";

import { X, CheckCircle2, AlertCircle, Loader2, FileText, Image as ImageIcon } from "lucide-react";

interface FileUploadProgressProps {
  fileName: string;
  fileSize: number;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
  onRemove?: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

function isImageFile(name: string): boolean {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return ["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(ext);
}

export function FileUploadProgress({ fileName, fileSize, progress, status, error, onRemove }: FileUploadProgressProps) {
  return (
    <div
      className="flex items-center gap-3 rounded-lg border p-3 transition-colors"
      style={{ borderColor: status === "error" ? "var(--gf-danger, #ef4444)" : "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}
    >
      {/* File icon */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
        {isImageFile(fileName) ? (
          <ImageIcon className="w-4 h-4" style={{ color: "#a855f7" }} />
        ) : (
          <FileText className="w-4 h-4" style={{ color: "#3b82f6" }} />
        )}
      </div>

      {/* Info + Progress bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium truncate" style={{ color: "var(--gf-text-primary)" }}>{fileName}</span>
          <span className="text-[10px] shrink-0 ml-2" style={{ color: "var(--gf-text-muted)" }}>{formatSize(fileSize)}</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: "var(--gf-border)" }}>
          <div
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              backgroundColor: status === "error" ? "#ef4444" : status === "done" ? "#22c55e" : "var(--gf-accent)",
            }}
          />
        </div>

        {/* Status text */}
        <div className="flex items-center gap-1 mt-1">
          {status === "uploading" && (
            <>
              <Loader2 className="w-3 h-3 animate-spin" style={{ color: "var(--gf-accent)" }} />
              <span className="text-[10px]" style={{ color: "var(--gf-text-muted)" }}>Uploading... {progress}%</span>
            </>
          )}
          {status === "done" && (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Upload complete</span>
            </>
          )}
          {status === "error" && (
            <>
              <AlertCircle className="w-3 h-3 text-red-500" />
              <span className="text-[10px] text-red-600 dark:text-red-400">{error ?? "Upload failed"}</span>
            </>
          )}
        </div>
      </div>

      {/* Remove button */}
      {onRemove && (
        <button onClick={onRemove} className="shrink-0 rounded p-1 hover:bg-black/5 dark:hover:bg-white/5">
          <X className="w-3.5 h-3.5" style={{ color: "var(--gf-text-muted)" }} />
        </button>
      )}
    </div>
  );
}
