import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Price({
  effectivePrice,
  compareAtPrice,
  discountPercent,
  currency,
  locale,
  size = "md",
  className,
}: {
  effectivePrice: number;
  compareAtPrice?: number | null;
  discountPercent?: number | null;
  currency: string;
  locale: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const hasDiscount = !!compareAtPrice && compareAtPrice > effectivePrice;

  return (
    <div className={cn("flex flex-wrap items-baseline gap-1.5", className)}>
      <span
        className={cn(
          "font-heading font-bold text-foreground",
          size === "sm" && "text-sm",
          size === "md" && "text-lg",
          size === "lg" && "text-2xl sm:text-3xl"
        )}
      >
        {formatMoney(effectivePrice, currency, locale)}
      </span>
      {hasDiscount && (
        <span
          className={cn(
            "text-muted-foreground line-through",
            size === "sm" && "text-xs",
            size === "md" && "text-sm",
            size === "lg" && "text-base"
          )}
        >
          {formatMoney(compareAtPrice!, currency, locale)}
        </span>
      )}
      {!!discountPercent && discountPercent > 0 && (
        <span
          className={cn(
            "rounded-full bg-deal px-1.5 py-0.5 font-semibold text-deal-foreground leading-none",
            size === "sm" && "text-[10px]",
            size === "md" && "text-xs",
            size === "lg" && "text-sm"
          )}
        >
          -{discountPercent}%
        </span>
      )}
    </div>
  );
}
