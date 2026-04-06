import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/roles — list all roles
export async function GET() {
  try {
    const roles = await prisma.role.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(
      roles.map((r) => ({
        ...r,
        permissions: JSON.parse(r.permissions),
      })),
    );
  } catch (err) {
    console.error("GET /api/roles error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// POST /api/roles — create a new role
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Auto-generate role code if not provided
    let code = body.code ?? "";
    if (!code) {
      const all = await prisma.role.findMany({ select: { code: true } });
      let maxNum = 0;
      for (const r of all) {
        const m = (r.code ?? "").match(/^ROLE-(\d+)$/);
        if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
      }
      code = `ROLE-${String(maxNum + 1).padStart(4, "0")}`;
    }

    const role = await prisma.role.create({
      data: {
        code,
        name: body.name,
        type: body.type ?? "end_user",
        description: body.description ?? "",
        status: body.status ?? "Active",
        permissions: JSON.stringify(body.permissions ?? {}),
      },
    });

    return NextResponse.json({ ...role, permissions: JSON.parse(role.permissions) }, { status: 201 });
  } catch (err) {
    console.error("POST /api/roles error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
