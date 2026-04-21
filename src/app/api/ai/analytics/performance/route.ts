import { NextResponse } from "next/server";

// GET /api/ai/analytics/performance — synthetic model performance metrics.
// A real implementation would pull from an observability backend; for the
// dashboard we return a deterministic-enough snapshot per request so charts
// and KPIs have realistic numbers.
export async function GET() {
  const now = Date.now();
  const days = 14;
  const jitter = (base: number, spread: number) => Math.round((base + (Math.random() - 0.5) * spread) * 100) / 100;

  const models = [
    { id: "gf-fast", name: "GF Fast", family: "Glimmora", tokensPerSec: jitter(940, 120), avgLatencyMs: jitter(180, 40), p95LatencyMs: jitter(280, 60), errorRate: jitter(0.4, 0.3), successRate: jitter(99.6, 0.4), requests24h: 182000 + Math.floor(Math.random() * 20000) },
    { id: "gf-medium", name: "GF Medium", family: "Glimmora", tokensPerSec: jitter(620, 80), avgLatencyMs: jitter(340, 60), p95LatencyMs: jitter(520, 90), errorRate: jitter(0.8, 0.4), successRate: jitter(99.2, 0.4), requests24h: 104000 + Math.floor(Math.random() * 14000) },
    { id: "gf-large", name: "GF Large", family: "Glimmora", tokensPerSec: jitter(310, 50), avgLatencyMs: jitter(780, 120), p95LatencyMs: jitter(1200, 180), errorRate: jitter(1.2, 0.5), successRate: jitter(98.8, 0.5), requests24h: 48000 + Math.floor(Math.random() * 8000) },
    { id: "gf-vision", name: "GF Vision", family: "Glimmora", tokensPerSec: jitter(210, 35), avgLatencyMs: jitter(920, 140), p95LatencyMs: jitter(1500, 220), errorRate: jitter(1.6, 0.6), successRate: jitter(98.4, 0.6), requests24h: 22000 + Math.floor(Math.random() * 6000) },
  ];

  const totalRequests = models.reduce((a, m) => a + m.requests24h, 0);
  const avgLatency = Math.round(models.reduce((a, m) => a + m.avgLatencyMs * m.requests24h, 0) / totalRequests);
  const errorRate = Math.round(models.reduce((a, m) => a + m.errorRate * m.requests24h, 0) / totalRequests * 100) / 100;

  const timeseries = Array.from({ length: days }, (_, i) => {
    const d = new Date(now - (days - 1 - i) * 24 * 60 * 60 * 1000);
    return {
      date: d.toISOString().slice(0, 10),
      latencyMs: jitter(avgLatency, 60),
      errorRatePct: jitter(errorRate, 0.4),
      requests: Math.round(totalRequests / days + (Math.random() - 0.5) * 12000),
    };
  });

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    summary: {
      totalRequests24h: totalRequests,
      avgLatencyMs: avgLatency,
      errorRatePct: errorRate,
      uptime30dPct: 99.93,
      activeModels: models.length,
    },
    models,
    timeseries,
    topPrompts: [
      { prompt: "Summarize this support ticket", count: 18420, avgLatencyMs: 320 },
      { prompt: "Extract invoice fields from PDF", count: 12100, avgLatencyMs: 620 },
      { prompt: "Draft email response", count: 9480, avgLatencyMs: 290 },
      { prompt: "Translate to Spanish", count: 7320, avgLatencyMs: 210 },
      { prompt: "Classify intent", count: 6210, avgLatencyMs: 180 },
    ],
  });
}
