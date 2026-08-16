import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ReturnCard } from "@/components/orders/return-card";
import { PaginationControls } from "@/components/shop/pagination-controls";
import { getServerSession } from "@/lib/auth/session";
import { serverAuthedFetch } from "@/lib/auth/authed-fetch";
import type { PagedResult, ReturnResponse } from "@/types/api";

export const metadata: Metadata = { title: "My Returns", robots: { index: false } };

export default async function AccountReturnsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  const { page: pageRaw } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("returns");
  const session = await getServerSession();
  if (!session) {
    redirect(`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/account/returns`)}`);
  }

  const page = Math.max(1, Number(pageRaw) || 1);
  const result = await serverAuthedFetch<PagedResult<ReturnResponse>>(
    `/api/shop/orders/returns?page=${page}&pageSize=10`
  );
  const returns = result.data?.items ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-heading mb-6 text-2xl font-bold text-foreground">{t("myReturns")}</h1>
      {result.error === "unavailable" ? (
        <p className="py-16 text-center text-sm text-muted-foreground">{t("loadError")}</p>
      ) : returns.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">{t("noReturns")}</p>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            {returns.map((ret) => (
              <ReturnCard key={ret.id} ret={ret} />
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
