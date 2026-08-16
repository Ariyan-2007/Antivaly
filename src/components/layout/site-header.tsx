import { Suspense } from "react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Zap, Truck, Store, ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SearchBar } from "@/components/shop/search-bar";
import { CartButton } from "@/components/cart/cart-button";
import { AccountMenu } from "@/components/layout/account-menu";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { CategoryChips } from "@/components/shop/category-chips";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_CURRENCY } from "@/lib/constants";
import { isValidImageUrl } from "@/lib/image";
import { cn } from "@/lib/utils";
import type { BusinessResponse, CategoryResponse, MenuNode } from "@/types/api";

function SearchBarFallback() {
  return <Skeleton className="h-8 w-full rounded-lg" />;
}

export async function SiteHeader({
  business,
  categories,
  menu = [],
}: {
  business: BusinessResponse;
  categories: CategoryResponse[];
  menu?: MenuNode[];
}) {
  const businessName = business.name || "Antivaly";
  const logoUrl = isValidImageUrl(business.logoUrl) ? business.logoUrl : null;
  const t = await getTranslations("home");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="hidden items-center justify-center gap-6 bg-linear-to-r from-primary to-primary/80 px-4 py-1.5 text-xs font-medium text-primary-foreground sm:flex">
        <span className="inline-flex items-center gap-1.5">
          <Zap className="size-3.5 fill-current" />
          {t("trustFast")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          {business.deliveryModuleEnabled ? (
            <Truck className="size-3.5" />
          ) : (
            <Store className="size-3.5" />
          )}
          {business.deliveryModuleEnabled ? t("trustCod") : t("trustPickup")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="size-3.5" />
          {t("trustSecure")}
        </span>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={businessName}
              width={36}
              height={36}
              className="size-9 rounded-lg object-cover"
            />
          ) : (
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              {businessName.slice(0, 1)}
            </span>
          )}
          <span className="font-heading hidden text-lg font-bold text-foreground sm:inline">
            {businessName}
          </span>
        </Link>

        <div className="hidden flex-1 max-w-xl md:block">
          <Suspense fallback={<SearchBarFallback />}>
            <SearchBar />
          </Suspense>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <LocaleSwitcher />
          <CartButton currency={business.currency || DEFAULT_CURRENCY} />
          <div className="hidden sm:block">
            <AccountMenu />
          </div>
        </div>
      </div>

      <div className="border-t border-border/60 px-4 py-2.5 md:hidden">
        <Suspense fallback={<SearchBarFallback />}>
          <SearchBar />
        </Suspense>
      </div>

      <nav className="hidden border-t border-border/60 px-4 py-2.5 md:block">
        <div className="mx-auto flex max-w-7xl items-center gap-4">
          <CategoryChips categories={categories} />
          {menu.length > 0 && (
            <div className={cn("flex shrink-0 items-center gap-4 border-l border-border/60 pl-4")}>
              {menu.map((item) => (
                <Link
                  key={item.id}
                  href={(item.linkUrl || "#") as never}
                  className="whitespace-nowrap text-sm font-medium text-muted-foreground hover:text-primary"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
