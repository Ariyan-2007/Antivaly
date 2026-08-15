import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { categoryHref } from "@/lib/routes";
import type { CategoryResponse } from "@/types/api";

export function CategoryChips({
  categories,
  activeCategoryId,
}: {
  categories: CategoryResponse[];
  activeCategoryId?: string;
}) {
  const t = useTranslations("nav");

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      <Link
        href="/products"
        className={cn(
          "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all",
          !activeCategoryId
            ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/25"
            : "border-border bg-background text-foreground hover:border-primary/50 hover:text-primary"
        )}
      >
        {t("allCategories")}
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={categoryHref(category.id, category.slug)}
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all",
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
