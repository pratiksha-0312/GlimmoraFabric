"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Check, Loader2 } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  billingCycle: string;
  currency: string;
  features: string[];
}

interface StepPlanSelectionProps {
  defaultValue?: string;
  onNext: (selectedPlan: string) => void;
  onBack: () => void;
}

export function StepPlanSelection({ defaultValue, onNext, onBack }: StepPlanSelectionProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(defaultValue || "");

  useEffect(() => {
    (async () => {
      try {
        const { plansApi } = await import("@/lib/api");
        const list = await plansApi.list({ is_active: true, sort_by: "price", order: "asc", limit: 50 });
        // Convert FastAPI Plan -> local UI shape (slug<->code, features
        // dict -> list, billing_cycle case-insensitive).
        const mapped: Plan[] = list.items.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.code,
          price: p.price,
          billingCycle: String(p.billing_cycle).charAt(0).toUpperCase() +
            String(p.billing_cycle).slice(1).toLowerCase(),
          currency: p.currency,
          features: Object.entries(p.features)
            .filter(([, v]) => v !== false && v !== null && v !== undefined)
            .map(([k, v]) => (typeof v === "boolean" ? k : `${k}: ${v}`)),
        }));
        setPlans(mapped);
        if (!selected && mapped.length > 0) {
          setSelected(mapped[0].slug);
        }
      } catch {
        setPlans([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/15">
          <CreditCard className="h-5 w-5 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "var(--gf-text-primary)" }}>
            Select a Plan
          </h2>
          <p className="text-sm" style={{ color: "var(--gf-text-secondary)" }}>
            Choose the plan that fits your needs
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {plans.map((plan) => {
            const isSelected = selected === plan.slug;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelected(plan.slug)}
                className={`relative flex flex-col items-start rounded-xl border p-5 text-left transition-all ${
                  isSelected
                    ? "border-cyan-400 bg-cyan-400/5 ring-1 ring-cyan-400/30"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
                <span className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>
                  {plan.name}
                </span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>
                    ${plan.price}
                  </span>
                  <span className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                    /{plan.billingCycle.toLowerCase()}
                  </span>
                </div>
                <ul className="mt-4 space-y-1.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-xs"
                      style={{ color: "var(--gf-text-secondary)" }}
                    >
                      <Check className="h-3 w-3 shrink-0 text-emerald-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          disabled={!selected}
          onClick={() => onNext(selected)}
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}
