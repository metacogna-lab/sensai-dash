import { NextRequest, NextResponse } from "next/server";
import { dataSource } from "@/lib/dataSource";
import { SandboxError } from "@/lib/sandbox";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/log?engagement=compilar → parsed execution.log rows (newest first).
export async function GET(req: NextRequest) {
  const engagement = req.nextUrl.searchParams.get("engagement");
  if (!engagement) {
    return NextResponse.json({ error: "missing engagement" }, { status: 400 });
  }
  // Reject anything that isn't a plain engagement name (defense in depth; the
  // sandbox also guards the resolved path).
  if (!/^[A-Za-z0-9_-]+$/.test(engagement)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  try {
    const rows = await dataSource.getLog(engagement);
    return NextResponse.json({ engagement, rows });
  } catch (err) {
    if (err instanceof SandboxError) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
