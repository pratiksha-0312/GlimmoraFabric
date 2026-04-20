import { FeatureFlagOverridePage } from "@/components/dashboard/feature-flag-override";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FeatureFlagOverridePage flagId={id} />;
}
