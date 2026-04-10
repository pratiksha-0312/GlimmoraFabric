"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Settings, Loader2 } from "lucide-react";

const schema = z.object({
  domain: z.string().min(1, "Domain is required"),
  brandColor: z.string().min(1, "Pick a brand color"),
  logoUrl: z.string().optional(),
  timezone: z.string().min(1, "Please select a timezone"),
});

export type ConfigurationData = z.infer<typeof schema>;

interface StepConfigurationProps {
  defaultValues?: Partial<ConfigurationData>;
  isSubmitting: boolean;
  onSubmit: (data: ConfigurationData) => void;
  onBack: () => void;
}

const TIMEZONE_OPTIONS = [
  { value: "UTC", label: "UTC" },
  { value: "US/Eastern", label: "US/Eastern" },
  { value: "US/Central", label: "US/Central" },
  { value: "US/Mountain", label: "US/Mountain" },
  { value: "US/Pacific", label: "US/Pacific" },
  { value: "Europe/London", label: "Europe/London" },
  { value: "Europe/Berlin", label: "Europe/Berlin" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo" },
  { value: "Australia/Sydney", label: "Australia/Sydney" },
];

export function StepConfiguration({ defaultValues, isSubmitting, onSubmit, onBack }: StepConfigurationProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ConfigurationData>({
    resolver: zodResolver(schema),
    defaultValues: {
      domain: "",
      brandColor: "#06b6d4",
      logoUrl: "",
      timezone: "Asia/Kolkata",
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/15">
          <Settings className="h-5 w-5 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "var(--gf-text-primary)" }}>
            Configuration
          </h2>
          <p className="text-sm" style={{ color: "var(--gf-text-secondary)" }}>
            Set up branding and domain for your workspace
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="domain">Custom Domain</Label>
          <Input
            id="domain"
            placeholder="app.yourcompany.com"
            {...register("domain")}
          />
          {errors.domain && (
            <p className="text-xs text-red-400">{errors.domain.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="brandColor">Brand Color</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              id="brandColor"
              {...register("brandColor")}
              className="h-8 w-12 cursor-pointer rounded border border-input bg-transparent"
            />
            <Input
              placeholder="#06b6d4"
              {...register("brandColor")}
              className="flex-1"
            />
          </div>
          {errors.brandColor && (
            <p className="text-xs text-red-400">{errors.brandColor.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="logoUrl">Logo URL (optional)</Label>
          <Input
            id="logoUrl"
            placeholder="https://yourcompany.com/logo.png"
            {...register("logoUrl")}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Timezone</Label>
          <Controller
            name="timezone"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onChange={field.onChange}
                options={TIMEZONE_OPTIONS}
                placeholder="Select timezone"
              />
            )}
          />
          {errors.timezone && (
            <p className="text-xs text-red-400">{errors.timezone.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
              Finishing...
            </>
          ) : (
            "Complete Setup"
          )}
        </Button>
      </div>
    </form>
  );
}
