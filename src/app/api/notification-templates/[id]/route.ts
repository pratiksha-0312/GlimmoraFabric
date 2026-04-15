import { NextRequest, NextResponse } from "next/server";
import { getTemplates, type TemplateRecord } from "../route";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await req.json()) as Partial<TemplateRecord>;
  const templates = getTemplates();
  const idx = templates.findIndex((t) => t.id === id);

  const now = new Date().toISOString().slice(0, 16).replace("T", " ");
  if (idx === -1) {
    const created: TemplateRecord = {
      id: id === "new" ? `tpl-${Date.now()}` : id,
      name: body.name ?? "",
      subject: body.subject ?? "",
      channel: body.channel ?? "email",
      category: body.category ?? "system",
      status: body.status ?? "draft",
      bodyHtml: body.bodyHtml ?? "",
      bodyText: body.bodyText ?? "",
      version: 1,
      variables: body.variables ?? [],
      lastEdited: now,
      editedBy: "You",
      usageCount: 0,
    };
    templates.unshift(created);
    return NextResponse.json(created);
  }

  const existing = templates[idx];
  const updated: TemplateRecord = {
    ...existing,
    ...body,
    id: existing.id,
    version: existing.version + 1,
    lastEdited: now,
    editedBy: "You",
  };
  templates[idx] = updated;
  return NextResponse.json(updated);
}
