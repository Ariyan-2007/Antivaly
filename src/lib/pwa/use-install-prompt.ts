"use client";

import { useEffect, useState } from "react";

/** Not in lib.dom.d.ts yet — this is the standard shape Chromium actually dispatches. */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * Wraps the real `beforeinstallprompt` flow — never fakes an "Install" affordance that would do
 * nothing. The browser only fires this event when it has independently decided the app meets its
 * installability bar (valid manifest, served over HTTPS, a controlling service worker — see
 * `public/sw.js`), so `canInstall` staying false just means the browser hasn't offered it, not
 * that anything here is broken.
 */
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // A controlling service worker is part of Chromium's installability bar (see sw.js) — this
    // is idempotent, so it's safe to call from every component that uses this hook.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setDeferredPrompt(null);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function promptInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    // A captured prompt can only be shown once — whatever the customer chose, it's spent.
    setDeferredPrompt(null);
  }

  return { canInstall: !!deferredPrompt, promptInstall };
}
