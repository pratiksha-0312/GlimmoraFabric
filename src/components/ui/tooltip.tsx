"use client";

import { useState, useRef, type ReactNode, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Reusable Tooltip component.
 *
 * Usage:
 *   <Tooltip content="Delete this item">
 *     <button>🗑</button>
 *   </Tooltip>
 *
 *   <Tooltip content="More info here" side="bottom" delay={200}>
 *     <span>Hover me</span>
 *   </Tooltip>
 */

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  delay?: number;
  className?: string;
}

const POSITION_STYLES: Record<string, CSSProperties> = {
  top: { bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)" },
  bottom: { top: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)" },
  left: { right: "calc(100% + 6px)", top: "50%", transform: "translateY(-50%)" },
  right: { left: "calc(100% + 6px)", top: "50%", transform: "translateY(-50%)" },
};

export function Tooltip({ content, children, side = "top", delay = 300, className }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    timeoutRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      {visible && (
        <div
          className={cn(
            "absolute z-50 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium shadow-lg pointer-events-none",
            className,
          )}
          style={{
            backgroundColor: "var(--gf-bg-elevated)",
            color: "var(--gf-text-primary)",
            border: "1px solid var(--gf-border)",
            ...POSITION_STYLES[side],
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}
