import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { WishlistItemCard } from "@/components/account/wishlist-item-card";
import { PaginationControls } from "@/components/shop/pagination-controls";
import { serverAuthedFetch } from "@/lib/auth/authed-fetch";
import { getBusiness } from "@/lib/api/catalog";
import { DEFAULT_CURRENCY } from "@/lib/constants";
import type { PagedResult, WishlistItemResponse } from "@/types/api";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false } };

export default async function WishlistPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  const { page: pageRaw } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("wishlist");

  const page = Math.max(1, Number(pageRaw) || 1);
  const [business, result] = await Promise.all([
    getBusiness(),
    serverAuthedFetch<PagedResult<WishlistItemResponse>>(
      `/api/shop/account/wishlist?page=${page}&pageSize=20`
    ),
  ]);
  const items = result.data?.items ?? [];
  const currency = business.currency || DEFAULT_CURRENCY;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">{t("title")}</h1>
      {result.error === "unavailable" ? (
        <p className="py-16 text-center text-sm text-muted-foreground">{t("loadError")}</p>
      ) : items.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <WishlistItemCard key={item.id} item={item} currency={currency} />
            ))}
          </div>
          {result.data && (
            <PaginationControls
              page={result.data.page}
              totalPages={result.data.totalPages}
              hasNextPage={result.data.hasNextPage}
              hasPreviousPage={result.data.hasPreviousPage}
            />
          )}
        </div>
      )}
    </div>
  );
}
