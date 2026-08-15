import { Suspense } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { SearchBar } from "@/components/shop/search-bar";
import { CartButton } from "@/components/cart/cart-button";
import { AccountMenu } from "@/components/layout/account-menu";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { CategoryChips } from "@/components/shop/category-chips";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_CURRENCY } from "@/lib/constants";
import { isValidImageUrl } from "@/lib/image";
import type { BusinessResponse, CategoryResponse } from "@/types/api";

function SearchBarFallback() {
  return <Skeleton className="h-8 w-full rounded-lg" />;
}

export function SiteHeader({
  business,
  categories,
}: {
  business: BusinessResponse;
  categories: CategoryResponse[];
}) {
  const businessName = business.name || "Antivaly";
  const logoUrl = isValidImageUrl(business.logoUrl) ? business.logoUrl : null;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
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
        <div className="mx-auto max-w-7xl">
          <CategoryChips categories={categories} />
        </div>
      </nav>
    </header>
  );
}
