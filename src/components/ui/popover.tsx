"use client";

import { useState, useRef, useEffect, type ReactNode, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Reusable Popover component — click-triggered content panel.
 *
 * Usage:
 *   <Popover trigger={<button>Open</button>}>
 *     <p>Popover content</p>
 *   </Popover>
 *
 *   <Popover trigger={<button>Menu</button>} side="bottom-end" width={240}>
 *     <nav>...</nav>
 *   </Popover>
 */

interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  side?: "bottom-start" | "bottom-end" | "bottom-center" | "top-start" | "top-end" | "top-center";
  width?: number;
  className?: string;
}

const SIDE_STYLES: Record<string, CSSProperties> = {
  "bottom-start": { top: "calc(100% + 6px)", left: 0 },
  "bottom-end": { top: "calc(100% + 6px)", right: 0 },
  "bottom-center": { top: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)" },
  "top-start": { bottom: "calc(100% + 6px)", left: 0 },
  "top-end": { bottom: "calc(100% + 6px)", right: 0 },
  "top-center": { bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)" },
};

export function Popover({ trigger, children, side = "bottom-start", width, className }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className="relative inline-flex" ref={containerRef}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>

      {open && (
        <div
          className={cn("absolute z-50 rounded-xl border p-3 shadow-xl", className)}
          style={{
            backgroundColor: "var(--gf-bg-surface)",
            borderColor: "var(--gf-border)",
            width: width ? `${width}px` : undefined,
            minWidth: width ? undefined : "200px",
            ...SIDE_STYLES[side],
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
