"use client";

import { useEffect, useState } from "react";
import { KeyGate } from "@/components/admin/KeyGate";
import { ChatPage } from "@/components/admin/ChatPage";
import { keyStore } from "@/lib/anthropic";

// Admin Chat Portal — entirely client-side. The API key never leaves the browser.
export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUnlocked(Boolean(keyStore.get()));
    setReady(true);
  }, []);

  if (!ready) return null;

  return unlocked ? (
    <ChatPage onLock={() => setUnlocked(false)} />
  ) : (
    <div className="pt-8">
      <KeyGate onUnlock={() => setUnlocked(true)} />
    </div>
  );
}
