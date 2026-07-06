import { NextResponse } from "next/server";
import { readSession, deleteSession } from "@/lib/sessionStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const session = await readSession(id);
    return NextResponse.json({ session });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await deleteSession(id);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
