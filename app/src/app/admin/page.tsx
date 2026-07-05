"use client";

import { useEffect, useState } from "react";
import { KeyGate } from "@/components/admin/KeyGate";
import { SynthesisTerminal } from "@/components/admin/SynthesisTerminal";
import { keyStore } from "@/lib/anthropic";

// Admin Synthesis Portal — entirely client-side. The API key never leaves the browser.
export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUnlocked(Boolean(keyStore.get()));
    setReady(true);
  }, []);

  if (!ready) return null;

  return unlocked ? (
    <SynthesisTerminal onLock={() => setUnlocked(false)} />
  ) : (
    <div className="pt-8">
      <KeyGate onUnlock={() => setUnlocked(true)} />
    </div>
  );
}
