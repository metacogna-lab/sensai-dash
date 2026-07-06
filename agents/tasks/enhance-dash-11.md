# TASK-11: Persistent Multi-Turn Chat with Session Storage

**Priority:** HIGH  
**Status:** PENDING  
**Depends on:** TASK-13 (context progress callback, optional — can stub)  
**Build check:** `bun run build` must pass TypeScript-clean after each sub-task. Implement in order: 11.1 → 11.2 → 11.3 → 11.4.

---

## Objective

Replace the single-turn `SynthesisTerminal` with a full conversational interface backed by persistent sessions in `app/sessions/<uuid>.json`. Supports multi-turn Anthropic streaming, session list panel, per-turn context baking, and export.

---

## Architecture Constraints

- Session files live at `app/sessions/<uuid>.json` — within the Next.js app directory, **not** under `/harness` (the read-only harness bind-mount). Never use `resolveSafe()` for session reads/writes.
- The `ANTHROPIC_API_KEY` is held only in the browser's `sessionStorage` and sent directly to Anthropic's API — it never touches the app's server routes. Session persistence routes only store message text/metadata, never the key.
- All server session routes are `runtime = "nodejs"`.
- No `any` types. `frontmatter: Record<string, unknown>` is the only permitted dynamic boundary.

---

## 11.1 Data Model — `src/lib/types.ts`

Add the following interfaces:

```ts
interface ChatMessage {
  id: string;                   // UUID v4
  role: "user" | "assistant";
  content: string;              // plain markdown
  timestamp: string;            // ISO
  contextFiles?: number;        // artifact files included (user turns only)
  contextTruncated?: boolean;   // context was truncated at MAX_CHARS (user turns only)
  model?: string;               // model used (assistant turns only)
  tokenEstimate?: number;       // rough estimate from content.length / 4 (assistant turns only)
}

interface ChatSession {
  id: string;               // UUID v4
  title: string;            // first 60 chars of first user message
  engagement: string[];     // engagement ids in scope at session creation
  model: string;            // e.g. "claude-sonnet-4-6"
  createdAt: string;        // ISO
  updatedAt: string;        // ISO (updated on each new message)
  messages: ChatMessage[];
}

interface SessionMeta {
  id: string;
  title: string;
  engagement: string[];
  model: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}
```

---

## 11.2 Session Store — `src/lib/sessionStore.ts`

```ts
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import type { ChatSession, SessionMeta } from "./types";

export const sessionDir = path.join(process.cwd(), "sessions");

// Ensure directory exists on first import
await fs.mkdir(sessionDir, { recursive: true }).catch(() => {});

export async function listSessions(): Promise<SessionMeta[]> {
  const files = await fs.readdir(sessionDir).catch(() => [] as string[]);
  const sessions = await Promise.all(
    files
      .filter((f) => f.endsWith(".json"))
      .map((f) => readSession(f.replace(".json", "")).catch(() => null))
  );
  return sessions
    .filter((s): s is ChatSession => s !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map(({ id, title, engagement, model, createdAt, updatedAt, messages }) => ({
      id, title, engagement, model, createdAt, updatedAt,
      messageCount: messages.length,
    }));
}

export async function readSession(id: string): Promise<ChatSession> {
  validateId(id);
  const raw = await fs.readFile(path.join(sessionDir, `${id}.json`), "utf-8");
  return JSON.parse(raw) as ChatSession;
}

export async function writeSession(session: ChatSession): Promise<void> {
  validateId(session.id);
  await fs.writeFile(
    path.join(sessionDir, `${session.id}.json`),
    JSON.stringify(session, null, 2),
    "utf-8"
  );
}

export async function deleteSession(id: string): Promise<void> {
  validateId(id);
  await fs.unlink(path.join(sessionDir, `${id}.json`));
}

export function createSession(
  engagement: string[],
  model: string,
  title?: string
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

function validateId(id: string): void {
  if (!/^[0-9a-f-]{36}$/.test(id)) {
    throw new Error(`Invalid session ID: ${id}`);
  }
}
```

**Note on top-level await:** If the bundler does not support top-level await in module scope, move the `mkdir` call into each function that accesses the session directory, or into an `ensureDir()` helper called at the start of each exported function.

---

## 11.3 API Routes

### `src/app/api/sessions/route.ts`

```ts
import { NextResponse } from "next/server";
import { listSessions, createSession, writeSession } from "@/lib/sessionStore";
export const runtime = "nodejs";

export async function GET() {
  const sessions = await listSessions();
  return NextResponse.json({ sessions });
}

export async function POST(req: Request) {
  const body = await req.json() as { engagement: string[]; model: string; title?: string };
  const session = createSession(body.engagement, body.model, body.title);
  await writeSession(session);
  return NextResponse.json({ session }, { status: 201 });
}
```

### `src/app/api/sessions/[id]/route.ts`

```ts
import { NextResponse } from "next/server";
import { readSession, deleteSession } from "@/lib/sessionStore";
export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const session = await readSession(params.id);
    return NextResponse.json({ session });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await deleteSession(params.id);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
```

### `src/app/api/sessions/[id]/message/route.ts`

```ts
import { NextResponse } from "next/server";
import { readSession, writeSession } from "@/lib/sessionStore";
import type { ChatMessage } from "@/lib/types";
export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const message = await req.json() as ChatMessage;
  const session = await readSession(params.id);
  const updated: ChatSession = {
    ...session,
    messages: [...session.messages, message],
    updatedAt: new Date().toISOString(),
    title: session.messages.length === 0 && message.role === "user"
      ? message.content.slice(0, 60)
      : session.title,
  };
  await writeSession(updated);
  return NextResponse.json({ message });
}
```

---

## 11.4 Chat UI Components

### `src/components/admin/SessionList.tsx`

Client component. Props: `sessions: SessionMeta[]`, `activeId: string | null`, `onSelect(id)`, `onCreate()`, `onDelete(id)`.

Layout:
- "New chat" button at top (emerald, full-width, `<MessageSquarePlus />` icon)
- List of session items, sorted by `updatedAt` descending
- Each item: title (truncated), engagement chips, model badge, `timeAgo(updatedAt)`
- Active item: `border-l-2 border-emerald pl-2`
- Delete button (`<Trash2 />`, 12px, right-aligned, shows only on hover — `group-hover:opacity-100 opacity-0`)
- Delete requires an inline confirmation: clicking once changes button to "confirm?" text, second click deletes.

### `src/components/admin/ChatThread.tsx`

Client component. Props: `session: ChatSession | null`, `onMessageSent(msg: ChatMessage)`.

Sections (from top to bottom):

1. **Thread header** (when session non-null):
   - Session title (click to edit inline — `<input>` replaces text, blur saves via PATCH or re-POST)
   - Engagement scope chips (read-only display of `session.engagement`)
   - Model selector: `<select>` bound to `session.model` — changing model applies to new messages only

2. **Message thread** (`flex-1 overflow-y-auto`, `ref` for scroll-to-bottom):
   - User messages: right-aligned, `bg-paper border border-edge/30 rounded-xl rounded-tr-none px-4 py-2 font-mono text-sm`
   - Assistant messages: left-aligned, no bubble, `prose prose-sm prose-invert` rendered markdown
   - Each message footer: `timeAgo(message.timestamp)`, dim, font-mono text-[10px]
   - Assistant messages: + model badge (`text-[10px] bg-edge/40 rounded px-1`) + token estimate
   - User messages with `contextFiles`: `<details>` below message — `{n} artifacts in context` as summary

3. **Context progress** (renders during `gatherContext` call — TASK-13 pattern):
   ```
   reading artifacts… 12 / 40 files · 48,203 / 120,000 chars
   ```
   Font-mono text-xs text-ink-dim. Disappears after streaming starts.

4. **Input area** (pinned bottom, `border-t border-edge/30 bg-void/50 backdrop-blur-sm p-3`):
   - `<textarea>` auto-resize (CSS `field-sizing: content; max-height: 9rem`), `Enter` = send, `Shift+Enter` = newline
   - Send button (`<Send />`, disabled when empty or streaming)
   - Stop button (replaces Send during streaming — calls `controller.abort()` on the fetch)
   - Context toggle (`<Paperclip />`) — toggles context inclusion for the next message; green when active, dim when off
   - Refresh context button (`<RefreshCw />`) — forces `gatherContext` re-run on next message even if not first

### **Message sending flow** (inside `ChatThread`):

```ts
async function sendMessage(content: string) {
  const userMsg: ChatMessage = {
    id: crypto.randomUUID(),
    role: "user",
    content,
    timestamp: new Date().toISOString(),
  };

  // 1. Persist user message
  await fetch(`/api/sessions/${session.id}/message`, {
    method: "POST",
    body: JSON.stringify(userMsg),
  });

  // 2. Gather context (first message or user triggered refresh)
  let contextContent = "";
  if (shouldGatherContext) {
    const { text, fileCount, truncated } = await gatherContext(
      session.engagement,
      onProgress  // TASK-13 callback
    );
    contextContent = text;
    userMsg.contextFiles = fileCount;
    userMsg.contextTruncated = truncated;
  }

  // 3. Build Anthropic message history
  const threadMessages = [...session.messages, userMsg].map((m) => ({
    role: m.role,
    content: m.content,
  }));

  // Prepend context to first user message content if gathered
  if (contextContent && threadMessages.length > 0) {
    threadMessages[0] = {
      ...threadMessages[0],
      content: `${contextContent}\n\n---\n\n${threadMessages[0].content}`,
    };
  }

  // 4. Stream from Anthropic (client-side, key from sessionStorage)
  const key = getApiKey();   // from src/lib/anthropic.ts keyStore
  let assistantContent = "";
  const abortController = new AbortController();

  await streamSynthesis({
    messages: threadMessages,
    model: session.model,
    systemPrompt: buildSystemPrompt(session.engagement, activeEngagement),
    apiKey: key,
    signal: abortController.signal,
    onDelta: (delta) => {
      assistantContent += delta;
      setStreamingContent(assistantContent);
    },
  });

  // 5. Persist assistant message
  const assistantMsg: ChatMessage = {
    id: crypto.randomUUID(),
    role: "assistant",
    content: assistantContent,
    timestamp: new Date().toISOString(),
    model: session.model,
    tokenEstimate: Math.round(assistantContent.length / 4),
  };
  await fetch(`/api/sessions/${session.id}/message`, {
    method: "POST",
    body: JSON.stringify(assistantMsg),
  });

  onMessageSent(assistantMsg);
}
```

**System prompt:**
```ts
function buildSystemPrompt(engagements: string[], activeEngagement: string | null): string {
  return `You are the Sensai synthesist. You have read-only access to markdown artifacts from the following research engagements: ${engagements.join(", ")}.
Active tenant: ${activeEngagement ?? "none"}.
Answer questions by synthesizing across the provided context, citing artifact paths inline as [[path]]. Be rigorous. If context is insufficient, say so explicitly.
This is an ongoing conversation — you may refer to earlier messages in this thread.`;
}
```

### `src/components/admin/ChatPage.tsx`

Two-panel layout shell:
```tsx
<div className="flex h-[calc(100vh-4rem)] gap-0">
  <aside className="w-64 shrink-0 border-r border-edge/30 overflow-y-auto">
    <SessionList ... />
  </aside>
  <main className="flex-1 flex flex-col overflow-hidden">
    <ChatThread ... />
  </main>
</div>
```

On mobile (`< md` breakpoint): `SessionList` hidden by default, shown via a "chats" button in the page header using a `useState` toggle.

### `src/app/admin/page.tsx`

Replace `SynthesisTerminal` with `ChatPage`. Load the session list server-side if possible; otherwise load client-side from `GET /api/sessions`.

---

## 11.5 Export

On the `ChatThread` header, add:

- **Export MD** (`<Download />` icon): downloads the full thread as markdown:
  ```md
  # Session: {title}
  Engagements: {engagement.join(", ")}
  Model: {model}

  ---

  ### User
  {message.content}

  ### Sensai
  {message.content}
  ```
  Use `URL.createObjectURL(new Blob([md], { type: "text/markdown" }))` + programmatic `<a>` click.

- **Copy last response** (`<Copy />` icon on each assistant bubble): `navigator.clipboard.writeText(message.content)`.

- **Export JSON** (`<FileJson />` icon, in overflow menu): downloads raw `ChatSession` JSON.

---

## Acceptance Criteria

- [ ] `ChatSession`, `ChatMessage`, `SessionMeta` interfaces added to `src/lib/types.ts`
- [ ] `src/lib/sessionStore.ts` created with UUID validation on all file paths
- [ ] 5 API routes created and returning correct shapes
- [ ] `SessionList` renders all sessions sorted by `updatedAt` desc
- [ ] New chat creation works end-to-end (POST → appear in list → select → type → send)
- [ ] Multi-turn: second message uses history from session (no context re-gather)
- [ ] Streaming renders incrementally; stop button aborts the stream
- [ ] Session persists across page refreshes (reads from `app/sessions/*.json`)
- [ ] MD export downloads correctly formatted file
- [ ] No API key touches server routes or logs
- [ ] `bun run build` passes TypeScript-clean after each sub-task (11.1 → 11.2 → 11.3 → 11.4)
