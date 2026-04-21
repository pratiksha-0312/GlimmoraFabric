import { StudioServiceDetail } from "@/components/studio/service-detail";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StudioServiceDetail serviceId={id} />;
}
