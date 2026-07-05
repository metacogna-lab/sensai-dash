import { NextResponse } from "next/server";
import { dataSource } from "@/lib/dataSource";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/engagements → tenant summaries + aggregate telemetry.
export async function GET() {
  const [engagements, telemetry] = await Promise.all([
    dataSource.listEngagements(),
    dataSource.getGlobalTelemetry(),
  ]);
  return NextResponse.json({ engagements, telemetry });
}
