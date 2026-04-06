"use client";

import { Check, X } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
}

const CRITERIA = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Number", test: (p: string) => /[0-9]/.test(p) },
  { label: "Special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const LEVELS = [
  { label: "Weak", color: "bg-red-500", text: "text-red-400" },
  { label: "Fair", color: "bg-orange-500", text: "text-orange-400" },
  { label: "Good", color: "bg-yellow-500", text: "text-yellow-400" },
  { label: "Strong", color: "bg-green-500", text: "text-green-400" },
];

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const passed = CRITERIA.filter((c) => c.test(password)).length;
  const levelIndex = passed <= 1 ? 0 : passed <= 2 ? 1 : passed <= 4 ? 2 : 3;
  const level = LEVELS[levelIndex];

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {LEVELS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= levelIndex ? level.color : "bg-gray-700"
              }`}
            />
          ))}
        </div>
        <span className={`text-xs font-medium ${level.text}`}>{level.label}</span>
      </div>

      {/* Criteria list */}
      <div className="grid grid-cols-2 gap-1">
        {CRITERIA.map((c) => {
          const met = c.test(password);
          return (
            <div key={c.label} className="flex items-center gap-1.5">
              {met ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <X className="h-3 w-3 text-gray-600" />
              )}
              <span className={`text-[11px] ${met ? "text-green-400" : "text-gray-500"}`}>
                {c.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
