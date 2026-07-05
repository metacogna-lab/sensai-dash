import { NextRequest, NextResponse } from "next/server";
import { dataSource } from "@/lib/dataSource";
import { SandboxError } from "@/lib/sandbox";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/tree?path=engagements/compilar → sandboxed directory listing.
export async function GET(req: NextRequest) {
  const relPath = req.nextUrl.searchParams.get("path") ?? "";
  try {
    const entries = await dataSource.getTree(relPath);
    return NextResponse.json({ path: relPath, entries });
  } catch (err) {
    if (err instanceof SandboxError) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
