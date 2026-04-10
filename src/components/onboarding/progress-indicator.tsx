"use client";

import { Check } from "lucide-react";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: { label: string; completed: boolean }[];
}

export function ProgressIndicator({ currentStep, totalSteps, steps }: ProgressIndicatorProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      {/* Top row: circles and connector lines */}
      <div className="flex items-center">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = step.completed || stepNumber < currentStep;

          return (
            <div key={stepNumber} className="flex items-center flex-1 last:flex-initial">
              {/* Step circle */}
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  isCompleted
                    ? "bg-emerald-500 text-white"
                    : isActive
                      ? "border-2 border-cyan-400 text-cyan-400 bg-cyan-400/10"
                      : "border-2 border-muted-foreground/30 text-muted-foreground"
                }`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
              </div>

              {/* Connector line */}
              {stepNumber < totalSteps && (
                <div
                  className={`h-0.5 flex-1 mx-2 transition-colors ${
                    isCompleted ? "bg-emerald-500" : "bg-muted-foreground/20"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom row: labels aligned under each circle */}
      <div className="flex mt-2">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = step.completed || stepNumber < currentStep;

          return (
            <div key={stepNumber} className="flex-1 last:flex-initial">
              <span
                className={`block text-xs font-medium text-center ${
                  isActive
                    ? "text-cyan-500"
                    : isCompleted
                      ? "text-emerald-500"
                      : "text-muted-foreground"
                }`}
                style={{ width: "5rem", marginLeft: stepNumber === 1 ? "-0.5rem" : undefined }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
