"use client";

import { useState, useRef } from "react";
import {
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Link2, Image, Code,
  Heading1, Heading2, Quote, Undo2, Redo2, Type,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

interface ToolbarButton {
  icon: typeof Bold;
  command: string;
  arg?: string;
  title: string;
}

const TOOLBAR_GROUPS: ToolbarButton[][] = [
  [
    { icon: Undo2, command: "undo", title: "Undo" },
    { icon: Redo2, command: "redo", title: "Redo" },
  ],
  [
    { icon: Type, command: "formatBlock", arg: "P", title: "Paragraph" },
    { icon: Heading1, command: "formatBlock", arg: "H1", title: "Heading 1" },
    { icon: Heading2, command: "formatBlock", arg: "H2", title: "Heading 2" },
    { icon: Quote, command: "formatBlock", arg: "BLOCKQUOTE", title: "Quote" },
  ],
  [
    { icon: Bold, command: "bold", title: "Bold" },
    { icon: Italic, command: "italic", title: "Italic" },
    { icon: Underline, command: "underline", title: "Underline" },
    { icon: Strikethrough, command: "strikeThrough", title: "Strikethrough" },
    { icon: Code, command: "formatBlock", arg: "PRE", title: "Code Block" },
  ],
  [
    { icon: List, command: "insertUnorderedList", title: "Bullet List" },
    { icon: ListOrdered, command: "insertOrderedList", title: "Numbered List" },
  ],
  [
    { icon: AlignLeft, command: "justifyLeft", title: "Align Left" },
    { icon: AlignCenter, command: "justifyCenter", title: "Align Center" },
    { icon: AlignRight, command: "justifyRight", title: "Align Right" },
  ],
  [
    { icon: Link2, command: "createLink", title: "Insert Link" },
  ],
];

export function RichTextEditor({ value, onChange, placeholder = "Start typing...", minHeight = 200 }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const execCommand = (command: string, arg?: string) => {
    if (command === "createLink") {
      const url = prompt("Enter URL:");
      if (url) document.execCommand(command, false, url);
    } else if (arg && command === "formatBlock") {
      document.execCommand(command, false, `<${arg}>`);
    } else {
      document.execCommand(command, false);
    }
    editorRef.current?.focus();
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-colors ${isFocused ? "ring-2 ring-[var(--gf-accent)]/40" : ""}`}
      style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}
    >
      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b"
        style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-elevated)" }}
      >
        {TOOLBAR_GROUPS.map((group, gi) => (
          <div key={gi} className="flex items-center gap-0.5">
            {gi > 0 && <div className="w-px h-5 mx-1" style={{ backgroundColor: "var(--gf-border)" }} />}
            {group.map((btn) => (
              <button
                key={btn.title}
                type="button"
                title={btn.title}
                onMouseDown={(e) => { e.preventDefault(); execCommand(btn.command, btn.arg); }}
                className="rounded-md p-1.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                style={{ color: "var(--gf-text-secondary)" }}
              >
                <btn.icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder}
        className="px-4 py-3 text-sm outline-none [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:opacity-40 prose prose-sm max-w-none dark:prose-invert"
        style={{
          minHeight,
          color: "var(--gf-text-primary)",
          backgroundColor: "var(--gf-bg-base)",
        }}
      />
    </div>
  );
}
