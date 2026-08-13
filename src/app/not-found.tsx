import Link from "next/link";

// Fallback for paths outside any locale segment. next-intl's middleware redirects
// bare paths to a locale prefix before this would normally be hit — this exists only
// as a safety net (e.g. requests that bypass middleware).
export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <span className="text-6xl font-bold">404</span>
        <p className="text-muted-foreground">Page not found.</p>
        <Link href="/en" className="font-medium text-blue-600 underline">
          Go home
        </Link>
      </body>
    </html>
  );
}
