"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileText, Image as ImageIcon, AlertCircle } from "lucide-react";
import { FileUploadProgress } from "./file-upload-progress";

// ============================================================================
// File type validation (client-side)
// ============================================================================

const ALLOWED_EXTENSIONS: Record<string, string[]> = {
  image: [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"],
  document: [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".txt", ".yaml", ".yml", ".json"],
};

const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  image: ["image/png", "image/jpeg", "image/gif", "image/svg+xml", "image/webp"],
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
    "text/plain",
    "text/yaml",
    "application/json",
  ],
};

const ALL_EXTENSIONS = [...ALLOWED_EXTENSIONS.image, ...ALLOWED_EXTENSIONS.document];
const ALL_MIME_TYPES = [...ALLOWED_MIME_TYPES.image, ...ALLOWED_MIME_TYPES.document];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export interface UploadedFile {
  file: File;
  id: string;
  progress: number;
  status: "uploading" | "done" | "error";
  url?: string;
  error?: string;
}

interface FileUploadZoneProps {
  onUploadComplete?: (file: UploadedFile) => void;
  onAllComplete?: () => void;
  accept?: "image" | "document" | "all";
  maxFiles?: number;
  compact?: boolean;
}

function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) return `File too large (max ${MAX_FILE_SIZE / 1024 / 1024} MB)`;
  const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
  if (!ALL_EXTENSIONS.includes(ext)) return `Unsupported file type: ${ext}`;
  return null;
}

export function FileUploadZone({ onUploadComplete, onAllComplete, accept = "all", maxFiles = 5, compact = false }: FileUploadZoneProps) {
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const acceptConfig = accept === "all"
    ? Object.fromEntries(ALL_MIME_TYPES.map(m => [m, []]))
    : Object.fromEntries((ALLOWED_MIME_TYPES[accept] ?? []).map(m => [m, []]));

  const uploadFile = useCallback(async (uploadFile: UploadedFile) => {
    const formData = new FormData();
    formData.append("file", uploadFile.file);

    try {
      const xhr = new XMLHttpRequest();

      await new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setUploads(prev => prev.map(u => u.id === uploadFile.id ? { ...u, progress: pct } : u));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            const completed: UploadedFile = { ...uploadFile, progress: 100, status: "done", url: data.url };
            setUploads(prev => prev.map(u => u.id === uploadFile.id ? completed : u));
            onUploadComplete?.(completed);
            resolve();
          } else {
            setUploads(prev => prev.map(u => u.id === uploadFile.id ? { ...u, status: "error", error: "Upload failed" } : u));
            reject(new Error("Upload failed"));
          }
        });

        xhr.addEventListener("error", () => {
          setUploads(prev => prev.map(u => u.id === uploadFile.id ? { ...u, status: "error", error: "Network error" } : u));
          reject(new Error("Network error"));
        });

        xhr.open("POST", "/api/files/upload");
        xhr.send(formData);
      });
    } catch {
      // Error already handled in xhr listeners
    }
  }, [onUploadComplete]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setValidationError(null);

    const newUploads: UploadedFile[] = [];
    for (const file of acceptedFiles.slice(0, maxFiles)) {
      const error = validateFile(file);
      if (error) {
        setValidationError(error);
        continue;
      }
      const upload: UploadedFile = {
        file,
        id: `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        progress: 0,
        status: "uploading",
      };
      newUploads.push(upload);
    }

    if (newUploads.length > 0) {
      setUploads(prev => [...prev, ...newUploads]);
      newUploads.forEach(u => uploadFile(u));
    }
  }, [maxFiles, uploadFile]);

  const removeUpload = (id: string) => {
    setUploads(prev => prev.filter(u => u.id !== id));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptConfig,
    maxSize: MAX_FILE_SIZE,
    maxFiles,
    onDropRejected: (rejections) => {
      const msg = rejections[0]?.errors?.[0]?.message ?? "File rejected";
      setValidationError(msg);
    },
  });

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer ${
          isDragActive ? "border-[var(--gf-accent)] bg-[var(--gf-accent-bg)]" : "hover:border-[var(--gf-accent)]/50"
        } ${compact ? "p-4" : "p-8"}`}
        style={{ borderColor: isDragActive ? "var(--gf-accent)" : "var(--gf-border)", backgroundColor: isDragActive ? "var(--gf-accent-bg)" : "var(--gf-bg-surface)" }}
      >
        <input {...getInputProps()} />
        <div className={`flex flex-col items-center gap-2 ${compact ? "gap-1" : "gap-3"}`}>
          <div className="rounded-full p-3" style={{ backgroundColor: "var(--gf-accent-bg)" }}>
            <Upload className={compact ? "w-5 h-5" : "w-6 h-6"} style={{ color: "var(--gf-accent)" }} />
          </div>
          {isDragActive ? (
            <p className="text-sm font-medium" style={{ color: "var(--gf-accent)" }}>Drop files here...</p>
          ) : (
            <>
              <p className={`font-medium ${compact ? "text-xs" : "text-sm"}`} style={{ color: "var(--gf-text-primary)" }}>
                Drag & drop files here, or <span style={{ color: "var(--gf-accent)" }}>click to browse</span>
              </p>
              <p className={`${compact ? "text-[10px]" : "text-xs"}`} style={{ color: "var(--gf-text-muted)" }}>
                Images (PNG, JPG, SVG, WebP) and Documents (PDF, DOCX, XLSX) up to 10 MB
              </p>
            </>
          )}
        </div>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <span className="text-red-600 dark:text-red-400">{validationError}</span>
          <button onClick={() => setValidationError(null)} className="ml-auto"><X className="w-3 h-3 text-red-400" /></button>
        </div>
      )}

      {/* Upload Progress List */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map(u => (
            <FileUploadProgress
              key={u.id}
              fileName={u.file.name}
              fileSize={u.file.size}
              progress={u.progress}
              status={u.status}
              error={u.error}
              onRemove={() => removeUpload(u.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
