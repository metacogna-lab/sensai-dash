/**
 * Server-only session persistence. Writes to <app>/sessions/<uuid>.json.
 * NOT sandboxed through resolveSafe — sessions live in the app directory, not the harness root.
 */
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { ChatSession, ChatMessage, SessionMeta } from "./types";

export const sessionDir = path.join(process.cwd(), "sessions");

async function ensureDir(): Promise<void> {
  await fs.mkdir(sessionDir, { recursive: true }).catch(() => {});
}

function validateId(id: string): void {
  if (!/^[0-9a-f-]{36}$/.test(id)) {
    throw new Error(`Invalid session ID: ${id}`);
  }
}

function sessionPath(id: string): string {
  return path.join(sessionDir, `${id}.json`);
}

export async function listSessions(): Promise<SessionMeta[]> {
  await ensureDir();
  const files = await fs.readdir(sessionDir).catch(() => [] as string[]);
  const sessions = await Promise.all(
    files
      .filter((f) => f.endsWith(".json"))
      .map(async (f) => {
        try {
          return await readSession(f.replace(".json", ""));
        } catch {
          return null;
        }
      }),
  );
  return sessions
    .filter((s): s is ChatSession => s !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map(({ id, title, engagement, model, createdAt, updatedAt, messages }) => ({
      id,
      title,
      engagement,
      model,
      createdAt,
      updatedAt,
      messageCount: messages.length,
    }));
}

export async function readSession(id: string): Promise<ChatSession> {
  validateId(id);
  await ensureDir();
  const raw = await fs.readFile(sessionPath(id), "utf-8");
  return JSON.parse(raw) as ChatSession;
}

export async function writeSession(session: ChatSession): Promise<void> {
  validateId(session.id);
  await ensureDir();
  await fs.writeFile(sessionPath(session.id), JSON.stringify(session, null, 2), "utf-8");
}

export async function deleteSession(id: string): Promise<void> {
  validateId(id);
  await fs.unlink(sessionPath(id));
}

export function createSession(
  engagement: string[],
  model: string,
  title?: string,
): ChatSession {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    title: title ?? "New chat",
    engagement,
    model,
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

export async function appendMessage(
  sessionId: string,
  message: ChatMessage,
): Promise<ChatSession> {
  const session = await readSession(sessionId);
  const isFirstUserMsg = session.messages.length === 0 && message.role === "user";
  const updated: ChatSession = {
    ...session,
    messages: [...session.messages, message],
    updatedAt: new Date().toISOString(),
    title: isFirstUserMsg ? message.content.slice(0, 60) : session.title,
  };
  await writeSession(updated);
  return updated;
}
