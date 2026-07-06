import { NextResponse } from "next/server";
import { listSessions, createSession, writeSession } from "@/lib/sessionStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const sessions = await listSessions();
  return NextResponse.json({ sessions });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      engagement: string[];
      model: string;
      title?: string;
    };
    if (!Array.isArray(body.engagement) || typeof body.model !== "string") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const session = createSession(body.engagement, body.model, body.title);
    await writeSession(session);
    return NextResponse.json({ session }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
