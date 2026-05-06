"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressIndicator } from "./progress-indicator";
import { StepOrganization, type OrganizationData } from "./step-organization";
import { StepPlanSelection } from "./step-plan-selection";
import { StepInviteMembers, type InvitedMember } from "./step-invite-members";
import { StepConfiguration, type ConfigurationData } from "./step-configuration";
import { PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEP_LABELS = [
  { label: "Organization", completed: false },
  { label: "Plan", completed: false },
  { label: "Team", completed: false },
  { label: "Configuration", completed: false },
];

interface WizardData {
  organization?: OrganizationData;
  plan?: string;
  members?: InvitedMember[];
  configuration?: ConfigurationData;
}

export function OnboardingWizard() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<WizardData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const stepsWithStatus = STEP_LABELS.map((s, i) => ({
    ...s,
    completed: i + 1 < currentStep,
  }));

  const handleOrganizationNext = (orgData: OrganizationData) => {
    setData((prev) => ({ ...prev, organization: orgData }));
    setCurrentStep(2);
  };

  const handlePlanNext = (plan: string) => {
    setData((prev) => ({ ...prev, plan }));
    setCurrentStep(3);
  };

  const handleMembersNext = (members: InvitedMember[]) => {
    setData((prev) => ({ ...prev, members }));
    setCurrentStep(4);
  };

  const handleComplete = async (config: ConfigurationData) => {
    setIsSubmitting(true);
    try {
      if (!user?.tenantId) {
        throw new Error("No tenant context available");
      }

      const { onboardingApi, orgsApi, tenantsApi } = await import("@/lib/api");

      // 1. Mark onboarding complete on the backend. The FastAPI endpoint
      //    only takes `tenant_id` + `{name, industry?, size?}`.
      await onboardingApi.start({
        tenant_id: user.tenantId,
        organization: {
          name: data.organization?.organizationName ?? "",
          industry: (data.organization as { industry?: string } | undefined)?.industry ?? "",
          size: (data.organization as { size?: string } | undefined)?.size ?? "",
        },
      });

      // 2. Push the configuration knobs the FastAPI tenant schema supports.
      //    Plan + brand color + logoUrl + timezone aren't first-class fields
      //    on the tenant row, so we fold them into `features` JSON until the
      //    backend exposes dedicated columns.
      await tenantsApi.update(user.tenantId, {
        domain: config.domain || undefined,
        features: {
          plan: data.plan,
          brand_color: config.brandColor,
          logo_url: config.logoUrl,
          timezone: config.timezone,
        },
      });

      // 3. Fan out the team invitations.
      if (data.members?.length) {
        await Promise.allSettled(
          data.members.map((m) =>
            orgsApi.invite(user.tenantId!, {
              email: m.email,
              role_in_tenant: (m.role ?? "member").toLowerCase().replace(/\s+/g, "_"),
            }),
          ),
        );
      }

      setData((prev) => ({ ...prev, configuration: config }));
      setIsComplete(true);
      toast.success("Onboarding complete! Welcome to Glimmora Fabric.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 mb-5">
          <PartyPopper className="h-8 w-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--gf-text-primary)" }}>
          You&apos;re All Set!
        </h2>
        <p className="text-sm max-w-md mb-6" style={{ color: "var(--gf-text-secondary)" }}>
          Your workspace has been configured successfully. You can now start using Glimmora Fabric.
        </p>
        <Button onClick={() => router.push("/dashboard")}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>
          Welcome to Glimmora Fabric
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>
          Let&apos;s get your workspace set up in a few quick steps
        </p>
      </div>

      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={4}
        steps={stepsWithStatus}
      />

      <Card>
        <CardContent>
          {currentStep === 1 && (
            <StepOrganization
              defaultValues={data.organization}
              onNext={handleOrganizationNext}
            />
          )}
          {currentStep === 2 && (
            <StepPlanSelection
              defaultValue={data.plan}
              onNext={handlePlanNext}
              onBack={() => setCurrentStep(1)}
            />
          )}
          {currentStep === 3 && (
            <StepInviteMembers
              defaultValues={data.members}
              onNext={handleMembersNext}
              onBack={() => setCurrentStep(2)}
            />
          )}
          {currentStep === 4 && (
            <StepConfiguration
              defaultValues={data.configuration}
              isSubmitting={isSubmitting}
              onSubmit={handleComplete}
              onBack={() => setCurrentStep(3)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
