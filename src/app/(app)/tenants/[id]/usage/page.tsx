import { TenantUsageDashboard } from "@/components/dashboard/tenant-usage-dashboard";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TenantUsageDashboard tenantId={id} />;
}
