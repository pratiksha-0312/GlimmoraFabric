import { PlanEditor } from "@/components/dashboard/plan-editor";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlanEditor planId={id} />;
}
