"use client";

import { useTheme } from "@/context/theme-context";

interface ColorPickerProps {
  open: boolean;
  onClose: () => void;
}

const accentColors = [
  { name: "Sky Blue", value: "sky-blue", color: "#0EA5E9" },
  { name: "Ocean Blue", value: "ocean-blue", color: "#4A7FA8" },
  { name: "Teal", value: "teal", color: "#14B8A6" },
  { name: "Emerald", value: "emerald", color: "#10B981" },
  { name: "Forest Green", value: "forest-green", color: "#4A8F6A" },
  { name: "Indigo Navy", value: "indigo-navy", color: "#6366F1" },
  { name: "Royal Purple", value: "royal-purple", color: "#7B68A5" },
  { name: "Rose Pink", value: "rose-pink", color: "#E11D48" },
  { name: "Crimson Red", value: "crimson-red", color: "#A5484A" },
  { name: "Orange", value: "orange", color: "#EA580C" },
  { name: "Amber Gold", value: "amber-gold", color: "#D97706" },
  { name: "Coffee Brown", value: "coffee-brown", color: "#8B6914" },
  { name: "Terracotta", value: "terracotta", color: "#A57865" },
  { name: "Slate Gray", value: "slate-gray", color: "#6B7B8D" },
];

export function ColorPicker({ open, onClose }: ColorPickerProps) {
  const { accentColor, setAccentColor } = useTheme();

  if (!open) return null;

  return (
    <div
      role="menu"
      aria-label="Color themes"
      style={{
        position: "absolute",
        top: "calc(100% + 6px)",
        right: 0,
        zIndex: 50,
        background: "var(--gf-bg-elevated)",
        border: "1px solid var(--gf-border)",
        borderRadius: "10px",
        padding: "10px",
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: "6px",
        boxShadow: "rgba(0, 0, 0, 0.3) 0px 8px 24px",
      }}
    >
      {accentColors.map((color) => {
        const isSelected = accentColor === color.value;
        return (
          <button
            key={color.value}
            type="button"
            role="menuitem"
            aria-label={color.name}
            aria-pressed={isSelected}
            title={color.name}
            onClick={(e) => {
              e.stopPropagation();
              setAccentColor(color.value);
              onClose();
            }}
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: color.color,
              border: isSelected ? "1.6px solid white" : "1.6px solid transparent",
              cursor: "pointer",
              transition: "0.15s",
              boxShadow: isSelected
                ? `var(--gf-bg-base) 0px 0px 0px 2px, ${color.color} 0px 0px 0px 4px`
                : "none",
              flexShrink: 0,
            }}
          />
        );
      })}
    </div>
  );
}
