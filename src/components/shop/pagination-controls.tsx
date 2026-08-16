"use client";

import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** Generic prev/next + page-number pagination driven by the `page` search param — reused by
 * product listing, orders, wishlist, and returns. */
export function PaginationControls({
  page,
  totalPages,
  hasNextPage,
  hasPreviousPage,
}: {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}) {
  const t = useTranslations("common");
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function hrefForPage(p: number): string {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    return `${pathname}?${params.toString()}`;
  }

  const pages = visiblePages(page, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label={t("pagination")}>
      <Link
        href={hrefForPage(page - 1)}
        aria-disabled={!hasPreviousPage}
        className={cn(
          "flex size-8 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:border-primary/50 hover:text-primary",
          !hasPreviousPage && "pointer-events-none opacity-40"
        )}
      >
        <ChevronLeft className="size-4" />
      </Link>

      {pages.map((p, i) =>
        p === null ? (
          <span key={`gap-${i}`} className="px-1 text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefForPage(p)}
            className={cn(
              "flex size-8 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
              p === page
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-foreground hover:border-primary/50 hover:text-primary"
            )}
          >
            {p}
          </Link>
        )
      )}

      <Link
        href={hrefForPage(page + 1)}
        aria-disabled={!hasNextPage}
        className={cn(
          "flex size-8 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:border-primary/50 hover:text-primary",
          !hasNextPage && "pointer-events-none opacity-40"
        )}
      >
        <ChevronRight className="size-4" />
      </Link>
    </nav>
  );
}

function visiblePages(current: number, total: number): (number | null)[] {
  const set = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...set].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result: (number | null)[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push(null);
    result.push(p);
    prev = p;
  }
  return result;
}
