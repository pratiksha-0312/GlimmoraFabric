import { NextResponse } from "next/server";

interface ChannelPref {
  id: string;
  enabled: boolean;
}

interface CategoryPref {
  id: string;
  channels: { email: boolean; sms: boolean; push: boolean; inApp: boolean };
}

interface Preferences {
  channels: ChannelPref[];
  categories: CategoryPref[];
}

let preferences: Preferences = {
  channels: [
    { id: "email", enabled: true },
    { id: "sms", enabled: false },
    { id: "push", enabled: true },
    { id: "inApp", enabled: true },
  ],
  categories: [
    { id: "security", channels: { email: true, sms: true, push: true, inApp: true } },
    { id: "team", channels: { email: true, sms: false, push: true, inApp: true } },
    { id: "deployment", channels: { email: true, sms: false, push: true, inApp: true } },
    { id: "compliance", channels: { email: true, sms: false, push: false, inApp: true } },
    { id: "billing", channels: { email: true, sms: true, push: false, inApp: true } },
    { id: "system", channels: { email: true, sms: false, push: false, inApp: true } },
  ],
};

export async function GET() {
  return NextResponse.json(preferences);
}

export async function PUT(request: Request) {
  const body = (await request.json()) as Partial<Preferences>;
  preferences = {
    channels: body.channels ?? preferences.channels,
    categories: body.categories ?? preferences.categories,
  };
  return NextResponse.json(preferences);
}
