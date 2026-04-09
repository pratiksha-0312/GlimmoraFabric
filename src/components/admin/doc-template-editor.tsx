"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Eye,
  Code,
  Type,
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Image,
  Table,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import type { UserRole } from "@/lib/roles";

// ============================================================================
// SAMPLE DATA
// ============================================================================

const SAMPLE_TEMPLATES: Record<string, { name: string; description: string; type: string; content: string; version: number }> = {
  "dt-001": { name: "Invoice Template", description: "Standard invoice for all tenants", type: "invoice", version: 3, content: `<h1>Invoice #{{invoice_id}}</h1>\n<p>Date: {{date}}</p>\n<p>Tenant: {{tenant_name}}</p>\n\n<table>\n  <thead>\n    <tr>\n      <th>Item</th>\n      <th>Qty</th>\n      <th>Price</th>\n      <th>Amount</th>\n    </tr>\n  </thead>\n  <tbody>\n    {{#items}}\n    <tr>\n      <td>{{name}}</td>\n      <td>{{qty}}</td>\n      <td>{{price}}</td>\n      <td>{{amount}}</td>\n    </tr>\n    {{/items}}\n  </tbody>\n</table>\n\n<p><strong>Total: {{total}}</strong></p>\n<p>Payment Due: {{due_date}}</p>` },
  "dt-002": { name: "NDA Agreement", description: "Non-disclosure agreement template", type: "legal", version: 5, content: `<h1>Non-Disclosure Agreement</h1>\n\n<p>This Non-Disclosure Agreement ("Agreement") is entered into as of {{effective_date}} by and between:</p>\n\n<p><strong>Party A:</strong> {{party_a}}<br/>\n<strong>Party B:</strong> {{party_b}}</p>\n\n<h2>1. Definition of Confidential Information</h2>\n<p>{{confidential_info_definition}}</p>\n\n<h2>2. Obligations of Receiving Party</h2>\n<p>The Receiving Party shall hold and maintain the Confidential Information in strict confidence.</p>\n\n<h2>3. Term</h2>\n<p>This Agreement shall remain in effect for {{term_duration}} from the Effective Date.</p>\n\n<div style="margin-top: 40px">\n<p>____________________<br/>{{party_a}}</p>\n<p>____________________<br/>{{party_b}}</p>\n</div>` },
  "dt-003": { name: "Certificate of Completion", description: "Training completion certificate", type: "certificate", version: 2, content: `<div style="text-align:center; padding: 40px; border: 3px double #333;">\n  <h1 style="font-size: 28px;">Certificate of Completion</h1>\n  <p style="margin-top: 20px;">This is to certify that</p>\n  <h2 style="font-size: 24px; color: #2563eb;">{{recipient_name}}</h2>\n  <p>has successfully completed the course</p>\n  <h3 style="font-size: 20px;">{{course_name}}</h3>\n  <p>on {{completion_date}}</p>\n  <div style="margin-top: 40px;">\n    <p>____________________</p>\n    <p>{{issuer_name}}<br/>{{issuer_title}}</p>\n  </div>\n</div>` },
};

type EditorMode = "code" | "richtext" | "preview";

export function DocTemplateEditor() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;
  const template = SAMPLE_TEMPLATES[templateId] ?? { name: "New Template", description: "", type: "general", content: "<h1>Template Title</h1>\n<p>Start editing your template content here...</p>", version: 1 };

  const [name, setName] = useState(template.name);
  const [description, setDescription] = useState(template.description);
  const [content, setContent] = useState(template.content);
  const [mode, setMode] = useState<EditorMode>("code");
  const [saved, setSaved] = useState(false);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  const handleContentChange = (newContent: string) => {
    setUndoStack(prev => [...prev, content]);
    setRedoStack([]);
    setContent(newContent);
    setSaved(false);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack(r => [...r, content]);
    setContent(prev);
    setUndoStack(u => u.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(u => [...u, content]);
    setContent(next);
    setRedoStack(r => r.slice(0, -1));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const insertTag = (tag: string) => {
    handleContentChange(content + `\n<${tag}></${tag}>`);
  };

  return (
    <AuthGuard allowedRoles={["super_admin"] as UserRole[]}>
      <div className="space-y-4">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/admin/doc-templates")} className="rounded-lg border p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: "var(--gf-border)" }}>
              <ArrowLeft className="w-4 h-4" style={{ color: "var(--gf-text-secondary)" }} />
            </button>
            <div>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="text-lg font-bold bg-transparent outline-none border-b border-transparent focus:border-current transition-colors"
                style={{ color: "var(--gf-text-primary)" }}
              />
              <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>v{template.version} &middot; {template.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {saved && <span className="text-xs font-medium text-emerald-600">Saved!</span>}
            <button onClick={handleSave} className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors" style={{ backgroundColor: "var(--gf-accent)" }}>
              <Save className="w-4 h-4" /> Save
            </button>
          </div>
        </div>

        {/* Description */}
        <input
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Template description..."
          className="w-full rounded-lg border px-4 py-2 text-sm outline-none"
          style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
        />

        {/* Mode Tabs */}
        <div className="flex items-center gap-1 rounded-lg border p-1" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
          {([
            { key: "code" as const, label: "Code Editor", icon: Code },
            { key: "richtext" as const, label: "Rich Text", icon: Type },
            { key: "preview" as const, label: "Preview", icon: Eye },
          ]).map(m => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
              style={mode === m.key ? { backgroundColor: "var(--gf-accent)", color: "#fff" } : { color: "var(--gf-text-secondary)" }}
            >
              <m.icon className="w-3.5 h-3.5" /> {m.label}
            </button>
          ))}
        </div>

        {/* Toolbar for rich text mode */}
        {mode === "richtext" && (
          <div className="flex items-center gap-1 flex-wrap rounded-lg border p-2" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
            <button onClick={handleUndo} disabled={undoStack.length === 0} className="rounded p-1.5 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30" title="Undo"><Undo2 className="w-4 h-4" style={{ color: "var(--gf-text-secondary)" }} /></button>
            <button onClick={handleRedo} disabled={redoStack.length === 0} className="rounded p-1.5 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30" title="Redo"><Redo2 className="w-4 h-4" style={{ color: "var(--gf-text-secondary)" }} /></button>
            <div className="w-px h-5 mx-1" style={{ backgroundColor: "var(--gf-border)" }} />
            <button onClick={() => insertTag("strong")} className="rounded p-1.5 hover:bg-black/5 dark:hover:bg-white/5" title="Bold"><Bold className="w-4 h-4" style={{ color: "var(--gf-text-secondary)" }} /></button>
            <button onClick={() => insertTag("em")} className="rounded p-1.5 hover:bg-black/5 dark:hover:bg-white/5" title="Italic"><Italic className="w-4 h-4" style={{ color: "var(--gf-text-secondary)" }} /></button>
            <button onClick={() => insertTag("u")} className="rounded p-1.5 hover:bg-black/5 dark:hover:bg-white/5" title="Underline"><Underline className="w-4 h-4" style={{ color: "var(--gf-text-secondary)" }} /></button>
            <div className="w-px h-5 mx-1" style={{ backgroundColor: "var(--gf-border)" }} />
            <button onClick={() => insertTag("ul")} className="rounded p-1.5 hover:bg-black/5 dark:hover:bg-white/5" title="Bullet List"><List className="w-4 h-4" style={{ color: "var(--gf-text-secondary)" }} /></button>
            <button onClick={() => insertTag("ol")} className="rounded p-1.5 hover:bg-black/5 dark:hover:bg-white/5" title="Numbered List"><ListOrdered className="w-4 h-4" style={{ color: "var(--gf-text-secondary)" }} /></button>
            <div className="w-px h-5 mx-1" style={{ backgroundColor: "var(--gf-border)" }} />
            <button onClick={() => handleContentChange(content.replace(/<div/, '<div style="text-align:left"'))} className="rounded p-1.5 hover:bg-black/5 dark:hover:bg-white/5" title="Align Left"><AlignLeft className="w-4 h-4" style={{ color: "var(--gf-text-secondary)" }} /></button>
            <button onClick={() => handleContentChange(content.replace(/<div/, '<div style="text-align:center"'))} className="rounded p-1.5 hover:bg-black/5 dark:hover:bg-white/5" title="Align Center"><AlignCenter className="w-4 h-4" style={{ color: "var(--gf-text-secondary)" }} /></button>
            <button onClick={() => handleContentChange(content.replace(/<div/, '<div style="text-align:right"'))} className="rounded p-1.5 hover:bg-black/5 dark:hover:bg-white/5" title="Align Right"><AlignRight className="w-4 h-4" style={{ color: "var(--gf-text-secondary)" }} /></button>
            <div className="w-px h-5 mx-1" style={{ backgroundColor: "var(--gf-border)" }} />
            <button onClick={() => insertTag("a")} className="rounded p-1.5 hover:bg-black/5 dark:hover:bg-white/5" title="Link"><Link className="w-4 h-4" style={{ color: "var(--gf-text-secondary)" }} /></button>
            <button onClick={() => handleContentChange(content + '\n<img src="" alt="" />')} className="rounded p-1.5 hover:bg-black/5 dark:hover:bg-white/5" title="Image"><Image className="w-4 h-4" style={{ color: "var(--gf-text-secondary)" }} /></button>
            <button onClick={() => insertTag("table")} className="rounded p-1.5 hover:bg-black/5 dark:hover:bg-white/5" title="Table"><Table className="w-4 h-4" style={{ color: "var(--gf-text-secondary)" }} /></button>
          </div>
        )}

        {/* Editor / Preview */}
        {mode === "code" && (
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)" }}>
            <div className="flex items-center justify-between px-4 py-2 text-xs" style={{ backgroundColor: "var(--gf-bg-surface)", borderBottom: "1px solid var(--gf-border)", color: "var(--gf-text-muted)" }}>
              <span>HTML / Mustache</span>
              <div className="flex items-center gap-2">
                <button onClick={handleUndo} disabled={undoStack.length === 0} className="hover:underline disabled:opacity-30">Undo</button>
                <button onClick={handleRedo} disabled={redoStack.length === 0} className="hover:underline disabled:opacity-30">Redo</button>
              </div>
            </div>
            <textarea
              value={content}
              onChange={e => handleContentChange(e.target.value)}
              spellCheck={false}
              className="w-full min-h-[500px] p-4 font-mono text-sm outline-none resize-y"
              style={{ backgroundColor: "var(--gf-bg-base)", color: "var(--gf-text-primary)" }}
            />
          </div>
        )}

        {mode === "richtext" && (
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)" }}>
            <textarea
              value={content}
              onChange={e => handleContentChange(e.target.value)}
              className="w-full min-h-[500px] p-4 text-sm outline-none resize-y"
              style={{ backgroundColor: "var(--gf-bg-base)", color: "var(--gf-text-primary)" }}
            />
          </div>
        )}

        {mode === "preview" && (
          <div className="rounded-xl border p-8" style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)" }}>
            <div className="prose prose-sm max-w-none" style={{ color: "var(--gf-text-primary)" }}>
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          </div>
        )}

        {/* Variable reference */}
        <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
          <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--gf-text-primary)" }}>Template Variables</h3>
          <p className="text-xs mb-3" style={{ color: "var(--gf-text-muted)" }}>Use Mustache syntax to insert dynamic values. Click to copy.</p>
          <div className="flex flex-wrap gap-2">
            {["{{tenant_name}}", "{{date}}", "{{invoice_id}}", "{{recipient_name}}", "{{company}}", "{{total}}", "{{due_date}}", "{{#items}}...{{/items}}"].map(v => (
              <button key={v} onClick={() => navigator.clipboard.writeText(v)} className="rounded-md border px-2.5 py-1 text-xs font-mono transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: "var(--gf-border)", color: "var(--gf-accent)" }}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
