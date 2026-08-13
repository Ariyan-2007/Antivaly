"use client";

import { useEffect } from "react";

// Catches errors thrown by the root [locale] layout itself (e.g. the storefront's business
// data being unreachable) — the one place next-intl's provider isn't guaranteed to be mounted,
// so this stays plain HTML/inline styles with no app dependencies that could themselves fail.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          textAlign: "center",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          background: "#ffffff",
          color: "#171717",
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
          Antivaly is temporarily unavailable
        </h1>
        <p style={{ fontSize: 14, color: "#666666", maxWidth: 380, margin: 0 }}>
          We&apos;re having trouble loading the store right now. Please try again in a moment.
        </p>
        <button
          onClick={() => reset()}
          style={{
            marginTop: 8,
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            background: "#111827",
            color: "#ffffff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
