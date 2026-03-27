import type { Metadata } from "next";
import { TeamContent } from "@/components/dashboard/team-content";

export const metadata: Metadata = {
  title: "Team - Glimmora Fabric",
  description: "Manage your team members",
};

export default function TeamPage() {
  return <TeamContent />;
}
