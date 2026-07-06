import { NextResponse } from "next/server";
import { appendMessage } from "@/lib/sessionStore";
import type { ChatMessage } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const message = (await req.json()) as ChatMessage;
    if (!message.id || !message.role || !message.content) {
      return NextResponse.json({ error: "Invalid message shape" }, { status: 400 });
    }
    const updated = await appendMessage(id, message);
    return NextResponse.json({ message, session: { updatedAt: updated.updatedAt, title: updated.title } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("ENOENT") || message.includes("Not found")) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to append message" }, { status: 500 });
  }
}
