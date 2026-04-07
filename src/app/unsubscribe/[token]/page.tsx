"use client";

import { use } from "react";
import { UnsubscribePage } from "@/components/notifications/unsubscribe";

export default function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  return <UnsubscribePage token={token} />;
}
