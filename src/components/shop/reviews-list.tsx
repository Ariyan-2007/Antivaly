"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Star, BadgeCheck, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ReviewHelpfulButton } from "@/components/shop/review-helpful-button";
import { browserFetch } from "@/lib/api/browser";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PagedResult, ReviewResponse } from "@/types/api";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`size-4 ${i <= Math.round(rating) ? "fill-deal text-deal" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

/** Paginates client-side against a public route handler — keeps the product detail page itself
 * static/ISR instead of depending on a `page` search param. */
export function ReviewsList({
  productId,
  initialData,
  locale,
}: {
  productId: string;
  initialData: PagedResult<ReviewResponse>;
  locale: string;
}) {
  const t = useTranslations("reviews");
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();

  function goToPage(page: number) {
    startTransition(async () => {
      try {
        const next = await browserFetch<PagedResult<ReviewResponse>>(
          `/api/shop/products/${productId}/reviews?page=${page}&pageSize=${data.pageSize}`
        );
        setData(next);
        document.getElementById("reviews")?.scrollIntoView({ block: "start" });
      } catch {
        // Leave the currently-shown page in place on failure.
      }
    });
  }

  if (data.items.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("noReviews")}</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className={cn("flex flex-col gap-5", isPending && "opacity-50")}>
        {data.items.map((review) => (
          <div key={review.id} className="flex flex-col gap-1.5 border-b border-border pb-5 last:border-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Stars rating={review.rating} />
                {review.isVerifiedPurchase && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <BadgeCheck className="size-3" />
                    {t("verifiedPurchase")}
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{formatDate(review.createdAt, locale)}</span>
            </div>
            {review.title && <p className="text-sm font-semibold text-foreground">{review.title}</p>}
            {review.body && <p className="text-sm text-muted-foreground">{review.body}</p>}
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{review.customerName || t("anonymous")}</span>
              <ReviewHelpfulButton reviewId={review.id} initialCount={review.helpfulCount} />
            </div>
            {review.merchantReply && (
              <div className="mt-2 rounded-lg bg-muted p-3">
                <p className="text-xs font-semibold text-foreground">{t("merchantReply")}</p>
                <p className="text-xs text-muted-foreground">{review.merchantReply}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => goToPage(data.page - 1)}
            disabled={!data.hasPreviousPage || isPending}
            className="flex size-8 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-sm text-muted-foreground">
            {isPending ? <Loader2 className="size-4 animate-spin" /> : `${data.page} / ${data.totalPages}`}
          </span>
          <button
            type="button"
            onClick={() => goToPage(data.page + 1)}
            disabled={!data.hasNextPage || isPending}
            className="flex size-8 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
