import { getTranslations } from "next-intl/server";
import { Star } from "lucide-react";
import { ReviewForm } from "@/components/shop/review-form";
import { ReviewsList } from "@/components/shop/reviews-list";
import type { PagedResult, ReviewResponse, ReviewSummaryResponse } from "@/types/api";

export async function ReviewsSection({
  productId,
  summary,
  reviews,
  locale,
}: {
  productId: string;
  summary: ReviewSummaryResponse;
  reviews: PagedResult<ReviewResponse>;
  locale: string;
}) {
  const t = await getTranslations("reviews");

  return (
    <section id="reviews" className="flex flex-col gap-6 border-t border-border pt-8">
      <h2 className="font-heading text-xl font-bold text-foreground">{t("title")}</h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center justify-center gap-1 sm:w-40">
          <span className="text-4xl font-bold text-foreground">{summary.averageRating.toFixed(1)}</span>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`size-5 ${i <= Math.round(summary.averageRating) ? "fill-deal text-deal" : "text-muted-foreground/30"}`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {t("reviewCount", { count: summary.reviewCount })}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = summary.ratingCounts[String(star) as "1" | "2" | "3" | "4" | "5"] ?? 0;
            const pct = summary.reviewCount > 0 ? (count / summary.reviewCount) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-3 shrink-0">{star}</span>
                <Star className="size-3 shrink-0 fill-deal text-deal" />
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-deal" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-6 shrink-0 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <ReviewForm productId={productId} />

      <ReviewsList productId={productId} initialData={reviews} locale={locale} />
    </section>
  );
}
