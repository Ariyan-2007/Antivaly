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
          "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
          !activeCategoryId
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background text-foreground hover:border-primary/50"
        )}
      >
        {t("allCategories")}
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={categoryHref(category.id, category.slug)}
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            activeCategoryId === category.id
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-foreground hover:border-primary/50"
          )}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
