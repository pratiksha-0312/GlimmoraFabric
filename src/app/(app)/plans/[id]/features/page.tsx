import { PlanFeatureMatrix } from "@/components/dashboard/plan-feature-matrix";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlanFeatureMatrix planId={id} />;
}
