import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { categoryHref } from "@/lib/routes";
import type { CategoryResponse } from "@/types/api";

export function CategoryChips({
  categories,
  activeCategoryId,
  showAllChip = true,
  size = "default",
}: {
  categories: CategoryResponse[];
  activeCategoryId?: string;
  /** Suppress the "All Categories" reset chip — used for a subcategory row, where stepping
   * back up is already handled by the breadcrumb rather than a second reset control. */
  showAllChip?: boolean;
  size?: "default" | "sm";
}) {
  const t = useTranslations("nav");
  const chipClass =
    size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {showAllChip && (
        <Link
          href="/products"
          className={cn(
            "shrink-0 rounded-full border font-medium transition-all",
            chipClass,
            !activeCategoryId
              ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/25"
              : "border-border bg-background text-foreground hover:border-primary/50 hover:text-primary"
          )}
        >
          {t("allCategories")}
        </Link>
      )}
      {categories.map((category) => (
        <Link
          key={category.id}
          href={categoryHref(category.id, category.slug)}
          className={cn(
            "shrink-0 rounded-full border font-medium transition-all",
            chipClass,
            activeCategoryId === category.id
              ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/25"
              : "border-border bg-background text-foreground hover:border-primary/50 hover:text-primary"
          )}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
