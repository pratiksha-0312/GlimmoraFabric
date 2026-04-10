"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Building2 } from "lucide-react";

const schema = z.object({
  organizationName: z.string().min(2, "Organization name must be at least 2 characters"),
  industry: z.string().min(1, "Please select an industry"),
  companySize: z.string().min(1, "Please select company size"),
  country: z.string().min(1, "Please enter your country"),
});

export type OrganizationData = z.infer<typeof schema>;

interface StepOrganizationProps {
  defaultValues?: Partial<OrganizationData>;
  onNext: (data: OrganizationData) => void;
}

const INDUSTRY_OPTIONS = [
  { value: "Technology", label: "Technology" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Finance", label: "Finance" },
  { value: "Education", label: "Education" },
  { value: "Retail", label: "Retail" },
  { value: "Manufacturing", label: "Manufacturing" },
  { value: "Media", label: "Media" },
  { value: "Government", label: "Government" },
  { value: "Non-Profit", label: "Non-Profit" },
  { value: "Other", label: "Other" },
];

const COMPANY_SIZE_OPTIONS = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
];

export function StepOrganization({ defaultValues, onNext }: StepOrganizationProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationData>({
    resolver: zodResolver(schema),
    defaultValues: {
      organizationName: "",
      industry: "",
      companySize: "",
      country: "",
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/15">
          <Building2 className="h-5 w-5 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "var(--gf-text-primary)" }}>
            Organization Info
          </h2>
          <p className="text-sm" style={{ color: "var(--gf-text-secondary)" }}>
            Tell us about your organization
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="organizationName">Organization Name</Label>
          <Input
            id="organizationName"
            placeholder="Acme Inc."
            {...register("organizationName")}
          />
          {errors.organizationName && (
            <p className="text-xs text-red-400">{errors.organizationName.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Industry</Label>
          <Controller
            name="industry"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onChange={field.onChange}
                options={INDUSTRY_OPTIONS}
                placeholder="Select industry"
              />
            )}
          />
          {errors.industry && (
            <p className="text-xs text-red-400">{errors.industry.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Company Size</Label>
          <Controller
            name="companySize"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onChange={field.onChange}
                options={COMPANY_SIZE_OPTIONS}
                placeholder="Select size"
              />
            )}
          />
          {errors.companySize && (
            <p className="text-xs text-red-400">{errors.companySize.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            placeholder="United States"
            {...register("country")}
          />
          {errors.country && (
            <p className="text-xs text-red-400">{errors.country.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isSubmitting}>
          Next Step
        </Button>
      </div>
    </form>
  );
}
