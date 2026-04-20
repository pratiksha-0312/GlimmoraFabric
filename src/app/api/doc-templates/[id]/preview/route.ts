import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function render(content: string, variables: Record<string, string>) {
  return content.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_match, key: string) => {
    const value = variables[key];
    return value !== undefined && value !== null && value !== "" ? String(value) : `{{${key}}}`;
  });
}

function extractVariables(content: string): string[] {
  const set = new Set<string>();
  const re = /\{\{\s*([\w.-]+)\s*\}\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content))) set.add(m[1]);
  return Array.from(set);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({} as Record<string, unknown>));

  const variables = (body.variables ?? {}) as Record<string, string>;
  const rawContent = typeof body.content === "string" ? body.content : undefined;

  const template = rawContent ? null : await prisma.documentTemplate.findUnique({ where: { id } });
  const content = rawContent ?? template?.content;

  if (content === undefined || content === null) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const rendered = render(content, variables);
  const vars = extractVariables(content);
  const missing = vars.filter((v) => !variables[v]);

  return NextResponse.json({
    id,
    name: template?.name ?? null,
    html: rendered,
    variables: vars,
    missing,
  });
}
