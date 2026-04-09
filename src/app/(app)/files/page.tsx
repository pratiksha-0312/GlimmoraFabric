"use client";

import { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  FileText,
  Search,
  Grid,
  List,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  File,
  Upload,
  Trash2,
  X,
  Plus,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { FileUploadZone } from "@/components/ui/file-upload-zone";
import type { UserRole } from "@/lib/roles";

interface FileRecord {
  id: string;
  name: string;
  type: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
  thumbnailUrl: string | null;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

function fileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return <ImageIcon className="h-5 w-5" />;
  return <FileText className="h-5 w-5" />;
}

const TYPE_BADGE: Record<string, { bg: string; text: string }> = {
  image: { bg: "bg-purple-500/15", text: "text-purple-400" },
  document: { bg: "bg-blue-500/15", text: "text-blue-400" },
};

const PAGE_SIZE = 12;

export default function FilesPage() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [previewFile, setPreviewFile] = useState<FileRecord | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchFiles = () => {
    fetch("/api/files")
      .then((r) => r.json())
      .then((d) => { setFiles(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchFiles(); }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/files?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setFiles(prev => prev.filter(f => f.id !== id));
        setDeleteConfirm(null);
        setPreviewFile(null);
      }
    } catch {
      // Silently handle
    }
  };

  const handleUploadComplete = () => {
    fetchFiles();
  };

  const filtered = files.filter((f) => {
    const q = search.toLowerCase();
    const matchSearch = f.name.toLowerCase().includes(q) || f.uploadedBy.toLowerCase().includes(q);
    const matchType = filterType === "All" || f.type === filterType;
    return matchSearch && matchType;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const imageCount = files.filter((f) => f.type === "image").length;
  const docCount = files.filter((f) => f.type === "document").length;

  return (
    <AuthGuard allowedRoles={["super_admin", "tenant_admin", "auditor", "tenant_member", "billing_admin", "workflow_manager", "developer"] as UserRole[]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>File Management</h1>
            <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>
              Upload, browse, and manage files and images
            </p>
          </div>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: "var(--gf-accent)" }}
          >
            {showUpload ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showUpload ? "Close" : "Upload Files"}
          </button>
        </div>

        {/* Upload Zone (collapsible) */}
        {showUpload && (
          <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>Upload Files</h2>
            <FileUploadZone
              onUploadComplete={handleUploadComplete}
              accept="all"
              maxFiles={5}
            />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Files", value: files.length, color: "var(--gf-accent)" },
            { label: "Images", value: imageCount, color: "#a855f7" },
            { label: "Documents", value: docCount, color: "#3b82f6" },
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
            <input
              type="text" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search files..."
              className="w-full rounded-lg border pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
              style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            className="rounded-lg border px-3 py-2.5 text-sm outline-none"
            style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
          >
            <option value="All">All Types</option>
            <option value="image">Images</option>
            <option value="document">Documents</option>
          </select>
          {/* View toggle */}
          <div className="flex rounded-lg border" style={{ borderColor: "var(--gf-border)" }}>
            <button
              onClick={() => setView("grid")}
              className="px-3 py-2.5 rounded-l-lg transition-colors"
              style={{
                backgroundColor: view === "grid" ? "var(--gf-accent)" : "var(--gf-bg-surface)",
                color: view === "grid" ? "#fff" : "var(--gf-text-secondary)",
              }}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className="px-3 py-2.5 rounded-r-lg transition-colors"
              style={{
                backgroundColor: view === "list" ? "var(--gf-accent)" : "var(--gf-bg-surface)",
                color: view === "list" ? "#fff" : "var(--gf-text-secondary)",
              }}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 text-center text-sm" style={{ color: "var(--gf-text-muted)" }}>Loading...</div>
        ) : paged.length === 0 ? (
          <div className="py-20 text-center">
            <File className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--gf-text-muted)" }}>No files found</p>
            {!showUpload && (
              <button onClick={() => setShowUpload(true)} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: "var(--gf-accent)" }}>
                <Upload className="w-4 h-4" /> Upload your first file
              </button>
            )}
          </div>
        ) : view === "grid" ? (
          /* Thumbnail Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {paged.map((f) => {
              const badge = TYPE_BADGE[f.type] ?? TYPE_BADGE.document;
              return (
                <div
                  key={f.id}
                  className="group rounded-xl border overflow-hidden cursor-pointer transition-all hover:shadow-lg"
                  style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}
                  onClick={() => setPreviewFile(f)}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-square flex items-center justify-center" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                    {f.thumbnailUrl ? (
                      <img src={f.thumbnailUrl} alt={f.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 opacity-40">
                        {fileIcon(f.mimeType)}
                        <span className="text-[10px] uppercase font-medium" style={{ color: "var(--gf-text-muted)" }}>
                          {f.name.split(".").pop()}
                        </span>
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(f.id); }}
                        className="p-2 rounded-lg bg-red-500/60 hover:bg-red-500/80 text-white transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-3">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--gf-text-primary)" }}>{f.name}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                        {f.type}
                      </span>
                      <span className="text-[10px]" style={{ color: "var(--gf-text-muted)" }}>{formatSize(f.size)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="rounded-xl border" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                    {["Name", "Type", "Size", "Uploaded By", "Date", ""].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--gf-text-secondary)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.map((f) => {
                    const badge = TYPE_BADGE[f.type] ?? TYPE_BADGE.document;
                    return (
                      <tr key={f.id} className="border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer" style={{ borderColor: "var(--gf-border)" }}
                        onClick={() => setPreviewFile(f)}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-secondary)" }}>
                              {fileIcon(f.mimeType)}
                            </div>
                            <span className="font-medium truncate" style={{ color: "var(--gf-text-primary)" }}>{f.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badge.bg} ${badge.text}`}>{f.type}</span></td>
                        <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{formatSize(f.size)}</td>
                        <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{f.uploadedBy}</td>
                        <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-muted)" }}>{new Date(f.uploadedAt).toLocaleDateString()}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1">
                            <button className="p-1.5 rounded-lg hover:opacity-70" style={{ color: "var(--gf-accent)" }}><Eye className="h-4 w-4" /></button>
                            <button className="p-1.5 rounded-lg hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><Download className="h-4 w-4" /></button>
                            <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(f.id); }} className="p-1.5 rounded-lg hover:opacity-70 text-red-500"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between rounded-xl border px-6 py-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Page {safePage} of {totalPages} ({filtered.length} files)</p>
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

        {/* Preview Modal */}
        {previewFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setPreviewFile(null)}>
            <div
              className="relative w-full max-w-lg mx-4 rounded-xl overflow-hidden shadow-2xl"
              style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Preview area */}
              {previewFile.thumbnailUrl ? (
                <div className="aspect-video flex items-center justify-center" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                  <img src={previewFile.thumbnailUrl} alt={previewFile.name} className="max-h-full max-w-full object-contain" />
                </div>
              ) : (
                <div className="aspect-video flex flex-col items-center justify-center gap-3" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                  <FileText className="h-12 w-12 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
                  <span className="text-sm uppercase font-medium" style={{ color: "var(--gf-text-muted)" }}>{previewFile.name.split(".").pop()}</span>
                </div>
              )}
              {/* Details */}
              <div className="p-5 space-y-3">
                <h3 className="text-base font-semibold" style={{ color: "var(--gf-text-primary)" }}>{previewFile.name}</h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span style={{ color: "var(--gf-text-muted)" }}>Size</span>
                  <span style={{ color: "var(--gf-text-primary)" }}>{formatSize(previewFile.size)}</span>
                  <span style={{ color: "var(--gf-text-muted)" }}>Type</span>
                  <span style={{ color: "var(--gf-text-primary)" }}>{previewFile.mimeType}</span>
                  <span style={{ color: "var(--gf-text-muted)" }}>Uploaded by</span>
                  <span style={{ color: "var(--gf-text-primary)" }}>{previewFile.uploadedBy}</span>
                  <span style={{ color: "var(--gf-text-muted)" }}>Date</span>
                  <span style={{ color: "var(--gf-text-primary)" }}>{new Date(previewFile.uploadedAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setDeleteConfirm(previewFile.id)}
                    className="px-4 py-2 text-sm rounded-lg border transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                    style={{ borderColor: "var(--gf-border)" }}
                  >
                    <Trash2 className="h-3.5 w-3.5 inline mr-1.5" />
                    Delete
                  </button>
                  <button
                    onClick={() => setPreviewFile(null)}
                    className="px-4 py-2 text-sm rounded-lg border transition-colors hover:opacity-80"
                    style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}
                  >
                    Close
                  </button>
                  <button
                    className="px-4 py-2 text-sm rounded-lg text-white font-medium transition-colors hover:opacity-90"
                    style={{ backgroundColor: "var(--gf-accent)" }}
                  >
                    <Download className="h-3.5 w-3.5 inline mr-1.5" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60" onClick={() => setDeleteConfirm(null)}>
            <div
              className="w-full max-w-sm mx-4 rounded-xl p-6 shadow-2xl"
              style={{ backgroundColor: "var(--gf-bg-elevated)", border: "1px solid var(--gf-border)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base font-semibold mb-2" style={{ color: "var(--gf-text-primary)" }}>Delete File?</h3>
              <p className="text-sm mb-4" style={{ color: "var(--gf-text-muted)" }}>
                This action cannot be undone. The file will be permanently removed.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-sm rounded-lg border transition-colors hover:opacity-80"
                  style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 text-sm rounded-lg text-white font-medium transition-colors bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
