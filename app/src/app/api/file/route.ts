import { NextRequest, NextResponse } from "next/server";
import { dataSource } from "@/lib/dataSource";
import { SandboxError } from "@/lib/sandbox";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/file?path=…/node--demo-corpus.md → { frontmatter, body, raw }.
export async function GET(req: NextRequest) {
  const relPath = req.nextUrl.searchParams.get("path");
  if (!relPath) {
    return NextResponse.json({ error: "missing path" }, { status: 400 });
  }
  try {
    const file = await dataSource.readFile(relPath);
    if (!file) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json(file);
  } catch (err) {
    if (err instanceof SandboxError) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
