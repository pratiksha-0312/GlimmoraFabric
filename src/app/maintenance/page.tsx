import { Wrench } from "lucide-react";

export const metadata = {
  title: "Maintenance - Glimmora Fabric",
};

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: "var(--gf-bg-base)" }}>
      <div className="text-center max-w-md">
        <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full mb-6" style={{ backgroundColor: "var(--gf-accent-bg)" }}>
          <Wrench className="h-10 w-10" style={{ color: "var(--gf-accent)" }} />
        </div>

        <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--gf-text-primary)" }}>
          Under Maintenance
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--gf-text-secondary)" }}>
          We&apos;re performing scheduled maintenance to improve your experience. The platform will be back online shortly.
        </p>

        <div className="rounded-xl border p-5 mb-6" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>Expected Downtime</p>
              <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--gf-text-primary)" }}>~30 minutes</p>
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>Status</p>
              <p className="text-sm font-semibold mt-0.5 text-amber-500">In Progress</p>
            </div>
          </div>
        </div>

        <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>
          If you need urgent assistance, contact{" "}
          <a href="mailto:support@glimmora.com" className="font-medium underline" style={{ color: "var(--gf-accent)" }}>
            support@glimmora.com
          </a>
        </p>
      </div>
    </div>
  );
}
