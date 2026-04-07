"use client";

import { useEffect, useCallback, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Reusable Modal / Dialog system.
 *
 * Usage:
 *   <Modal open={isOpen} onClose={() => setIsOpen(false)} title="Edit Item">
 *     <p>Content here</p>
 *   </Modal>
 *
 *   <Modal open={isOpen} onClose={close} title="Large" size="lg">
 *     ...
 *   </Modal>
 */

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  hideClose?: boolean;
  footer?: ReactNode;
}

const SIZE_MAP = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export function Modal({ open, onClose, title, description, children, size = "md", hideClose, footer }: ModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className={cn("w-full rounded-2xl border shadow-2xl", SIZE_MAP[size])}
        style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || !hideClose) && (
          <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
            <div>
              {title && <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>{title}</h2>}
              {description && <p className="text-xs mt-0.5" style={{ color: "var(--gf-text-muted)" }}>{description}</p>}
            </div>
            {!hideClose && (
              <button onClick={onClose} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
