"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { ThumbsUp } from "lucide-react";
import { browserFetch } from "@/lib/api/browser";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { ReviewResponse } from "@/types/api";

export function ReviewHelpfulButton({ reviewId, initialCount }: { reviewId: string; initialCount: number }) {
  const t = useTranslations("reviews");
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (voted || isPending) return;
    startTransition(async () => {
      try {
        const review = await browserFetch<ReviewResponse>(`/api/shop/reviews/${reviewId}/helpful`, {
          method: "POST",
        });
        setCount(review.helpfulCount);
        setVoted(true);
      } catch (err) {
        if (!(err instanceof ApiError)) return;
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={voted || isPending}
      className={cn(
        "flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:cursor-default",
        voted && "text-primary"
      )}
    >
      <ThumbsUp className="size-3.5" />
      {t("helpful")} ({count})
    </button>
  );
}
