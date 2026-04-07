"use client";

import { useEffect, useCallback, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Reusable Drawer / Slide-over panel.
 *
 * Usage:
 *   <Drawer open={isOpen} onClose={() => setIsOpen(false)} title="Details">
 *     <p>Content here</p>
 *   </Drawer>
 *
 *   <Drawer open={isOpen} onClose={close} side="left" width="lg">
 *     ...
 *   </Drawer>
 */

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  side?: "left" | "right";
  width?: "sm" | "md" | "lg" | "xl";
  footer?: ReactNode;
}

const WIDTH_MAP = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export function Drawer({ open, onClose, title, description, children, side = "right", width = "md", footer }: DrawerProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className={cn("fixed inset-0 z-50 flex", side === "right" ? "justify-end" : "justify-start")}
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Panel */}
      <div
        className={cn("relative w-full h-full overflow-y-auto shadow-2xl flex flex-col", WIDTH_MAP[width])}
        style={{ backgroundColor: "var(--gf-bg-surface)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4 shrink-0" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <div>
            {title && <h2 className="text-base font-bold" style={{ color: "var(--gf-text-primary)" }}>{title}</h2>}
            {description && <p className="text-xs mt-0.5" style={{ color: "var(--gf-text-muted)" }}>{description}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-5 overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t px-6 py-4 shrink-0" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
