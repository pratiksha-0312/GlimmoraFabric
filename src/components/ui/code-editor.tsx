"use client";

import { useState, useRef, useCallback } from "react";
import { Copy, Check, Maximize2, Minimize2 } from "lucide-react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  placeholder?: string;
  minHeight?: number;
  readOnly?: boolean;
}

const LANGUAGES = [
  "javascript", "typescript", "json", "html", "css", "python", "sql", "yaml", "markdown", "plaintext",
];

export function CodeEditor({
  value,
  onChange,
  language = "javascript",
  placeholder = "// Start coding...",
  minHeight = 250,
  readOnly = false,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [selectedLang, setSelectedLang] = useState(language);

  const lines = value.split("\n");
  const lineCount = Math.max(lines.length, 1);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = value.substring(0, start) + "  " + value.substring(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      });
    }
  };

  return (
    <div
      className={`rounded-xl border overflow-hidden ${expanded ? "fixed inset-4 z-50" : ""}`}
      style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-elevated)" }}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500/70" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
            <span className="h-3 w-3 rounded-full bg-green-500/70" />
          </div>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="text-[11px] rounded border px-1.5 py-0.5 outline-none"
            style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-md p-1.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
            style={{ color: "var(--gf-text-secondary)" }}
            title="Copy code"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="rounded-md p-1.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
            style={{ color: "var(--gf-text-secondary)" }}
            title={expanded ? "Minimize" : "Maximize"}
          >
            {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex overflow-auto" style={{ minHeight: expanded ? "calc(100% - 40px)" : minHeight, backgroundColor: "var(--gf-bg-base)" }}>
        {/* Line Numbers */}
        <div
          className="shrink-0 text-right select-none px-3 py-3 text-xs font-mono leading-[1.625rem]"
          style={{ color: "var(--gf-text-muted)", backgroundColor: "var(--gf-bg-elevated)", borderRight: "1px solid var(--gf-border)" }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          placeholder={placeholder}
          spellCheck={false}
          className="flex-1 resize-none px-4 py-3 text-sm font-mono leading-[1.625rem] outline-none bg-transparent placeholder:opacity-40"
          style={{
            color: "var(--gf-text-primary)",
            minHeight: expanded ? "100%" : minHeight,
            tabSize: 2,
          }}
        />
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-3 py-1.5 border-t text-[10px]"
        style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-muted)" }}
      >
        <span>{selectedLang}</span>
        <span>{lineCount} lines · {value.length} chars</span>
      </div>
    </div>
  );
}
