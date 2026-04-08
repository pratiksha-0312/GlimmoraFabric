"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowRight, Loader2 } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  billingCycle: string;
  currency: string;
  features: string[];
}

export default function PricingPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState<"Monthly" | "Annual">("Monthly");

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((d) => { setPlans(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const planColors: Record<string, string> = {
    Starter: "#f59e0b",
    Pro: "#3b82f6",
    Enterprise: "#14b8a6",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--gf-bg-base)" }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--gf-accent)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--gf-bg-base)" }}>
      <div className="mx-auto max-w-5xl px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold" style={{ color: "var(--gf-text-primary)" }}>
            Simple, transparent pricing
          </h1>
          <p className="text-lg mt-3" style={{ color: "var(--gf-text-secondary)" }}>
            Choose the plan that fits your team. Upgrade or downgrade anytime.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className="text-sm font-medium" style={{ color: billing === "Monthly" ? "var(--gf-text-primary)" : "var(--gf-text-muted)" }}>Monthly</span>
            <button
              onClick={() => setBilling((b) => b === "Monthly" ? "Annual" : "Monthly")}
              className={`relative h-7 w-12 rounded-full transition-colors ${billing === "Annual" ? "bg-green-500" : ""}`}
              style={billing === "Monthly" ? { backgroundColor: "var(--gf-border)" } : undefined}
            >
              <div className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform ${billing === "Annual" ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
            <span className="text-sm font-medium" style={{ color: billing === "Annual" ? "var(--gf-text-primary)" : "var(--gf-text-muted)" }}>
              Annual
              <span className="ml-1 text-xs font-bold text-green-500">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const color = planColors[plan.name] ?? "var(--gf-accent)";
            const price = billing === "Annual" ? Math.round(plan.price * 0.8) : plan.price;
            const isPopular = plan.name === "Pro";

            return (
              <div
                key={plan.id}
                className="relative rounded-2xl border p-7"
                style={{
                  borderColor: isPopular ? color : "var(--gf-border)",
                  backgroundColor: "var(--gf-bg-surface)",
                  boxShadow: isPopular ? `0 0 0 2px ${color}` : undefined,
                }}
              >
                {isPopular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: color }}
                  >
                    Most Popular
                  </div>
                )}

                <div className="mb-5">
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    {plan.name}
                  </span>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold" style={{ color: "var(--gf-text-primary)" }}>
                    ${price}
                  </span>
                  <span className="text-sm" style={{ color: "var(--gf-text-muted)" }}>
                    /month
                  </span>
                  {billing === "Annual" && (
                    <p className="text-xs mt-1" style={{ color: "var(--gf-text-muted)" }}>
                      Billed ${price * 12}/year
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: "var(--gf-text-secondary)" }}>
                      <Check className="h-4 w-4 shrink-0" style={{ color }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => router.push("/checkout")}
                  className="w-full flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-colors"
                  style={
                    isPopular
                      ? { backgroundColor: color, color: "#fff" }
                      : { border: "1px solid var(--gf-border)", color: "var(--gf-text-primary)" }
                  }
                >
                  Get Started <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ / Footer */}
        <div className="text-center mt-16">
          <p className="text-sm" style={{ color: "var(--gf-text-muted)" }}>
            All plans include a 14-day free trial. No credit card required to start.
          </p>
          <p className="text-xs mt-2" style={{ color: "var(--gf-text-muted)" }}>
            Need a custom plan? <a href="mailto:sales@glimmora.io" className="font-medium" style={{ color: "var(--gf-accent)" }}>Contact sales</a>
          </p>
        </div>
      </div>
    </div>
  );
}
