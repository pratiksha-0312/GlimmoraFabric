import { NextRequest, NextResponse } from "next/server";

// Colour palette for generated placeholder thumbnails
const COLORS = [
  { bg: "#1e3a5f", fg: "#60a5fa" },
  { bg: "#3b1f4a", fg: "#c084fc" },
  { bg: "#1a3c34", fg: "#4ade80" },
  { bg: "#4a2c1a", fg: "#fb923c" },
  { bg: "#3d1a1a", fg: "#f87171" },
  { bg: "#1a3347", fg: "#38bdf8" },
];

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// GET /api/files/:id/thumbnail — returns a generated SVG placeholder thumbnail
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const idx = hashCode(id) % COLORS.length;
  const { bg, fg } = COLORS[idx];

  // Derive initials from the file id (e.g. "file_002" → "F2")
  const parts = id.replace(/[^a-zA-Z0-9]/g, " ").trim().split(/\s+/);
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : id.slice(0, 2).toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" rx="16" fill="${bg}"/>
  <rect x="40" y="50" width="120" height="80" rx="8" fill="${fg}" opacity="0.15"/>
  <circle cx="72" cy="78" r="12" fill="${fg}" opacity="0.3"/>
  <polygon points="60,120 100,80 140,120" fill="${fg}" opacity="0.25"/>
  <polygon points="90,120 120,90 160,120" fill="${fg}" opacity="0.2"/>
  <text x="100" y="160" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" font-weight="600" fill="${fg}" opacity="0.6">${initials}</text>
</svg>`;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
