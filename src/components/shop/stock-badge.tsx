import { useTranslations } from "next-intl";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function StockBadge({
  stockQuantity,
  trackInventory,
  className,
}: {
  stockQuantity: number;
  trackInventory: boolean;
  className?: string;
}) {
  const t = useTranslations("common");

  if (!trackInventory) return null;

  if (stockQuantity <= 0) {
    return (
      <span className={cn("text-xs font-medium text-destructive", className)}>
        {t("outOfStock")}
      </span>
    );
  }

  if (stockQuantity <= LOW_STOCK_THRESHOLD) {
    return (
      <span className={cn("text-xs font-medium text-destructive", className)}>
        {t("lowStock", { count: stockQuantity })}
      </span>
    );
  }

  return null;
}
