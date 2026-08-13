import { Truck, Mail, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { categoryHref } from "@/lib/routes";
import type { BusinessResponse, CategoryResponse } from "@/types/api";

export function SiteFooter({
  business,
  categories,
}: {
  business: BusinessResponse;
  categories: CategoryResponse[];
}) {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <footer className="mt-16 border-t border-border bg-card pb-20 md:pb-0">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:grid sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <h3 className="font-heading font-bold text-foreground">{business.name}</h3>
          {business.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">{business.description}</p>
          )}
          <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Truck className="size-3.5" />
            {t("codBadge")}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-semibold text-foreground">{t("quickLinks")}</h4>
          <Link href="/products" className="text-sm text-muted-foreground hover:text-primary">
            {tNav("allCategories")}
          </Link>
          {categories.slice(0, 5).map((category) => (
            <Link
              key={category.id}
              href={categoryHref(category.id, category.slug)}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              {category.name}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-semibold text-foreground">{t("contact")}</h4>
          {business.contactEmail && (
            <a
              href={`mailto:${business.contactEmail}`}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
            >
              <Mail className="size-3.5" />
              {business.contactEmail}
            </a>
          )}
          {business.contactPhone && (
            <a
              href={`tel:${business.contactPhone}`}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
            >
              <Phone className="size-3.5" />
              {business.contactPhone}
            </a>
          )}
        </div>
      </div>

      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {business.name}. {t("rightsReserved")}
      </div>
    </footer>
  );
}
