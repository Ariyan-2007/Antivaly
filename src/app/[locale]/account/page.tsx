import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProfileForm } from "@/components/account/profile-form";
import { AvatarUpload } from "@/components/account/avatar-upload";
import { EmailVerificationBanner } from "@/components/account/email-verification-banner";
import { RecentOrdersCard } from "@/components/account/recent-orders-card";
import { getServerSession } from "@/lib/auth/session";
import { serverAuthedFetch } from "@/lib/auth/authed-fetch";
import { getBusiness } from "@/lib/api/catalog";
import { formatMoney } from "@/lib/format";
import { DEFAULT_CURRENCY } from "@/lib/constants";
import type {
  OrderResponse,
  PagedResult,
  ReturnResponse,
  StoreCreditBalanceResponse,
  WishlistItemResponse,
} from "@/types/api";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

// A return is still "in progress" up to the point staff physically have the goods back — the
// terminal states (money/goods already settled, or the request abandoned) don't count.
const ACTIVE_RETURN_STATUSES = new Set<ReturnResponse["status"]>(["Requested", "Approved", "Received"]);

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account");
  // Auth is already gated by account/layout.tsx — getServerSession() here is a cache()-deduped
  // re-read of the same request, not a second network call.
  const session = await getServerSession();
  if (!session) return null;

  const [business, recentOrders, wishlist, storeCredit, returns] = await Promise.all([
    getBusiness(),
    serverAuthedFetch<PagedResult<OrderResponse>>("/api/shop/orders?page=1&pageSize=3"),
    serverAuthedFetch<PagedResult<WishlistItemResponse>>("/api/shop/account/wishlist?page=1&pageSize=1"),
    serverAuthedFetch<StoreCreditBalanceResponse>("/api/shop/account/store-credit"),
    // No server-side status filter on the customer-facing returns list — a customer's own
    // return count is small enough that one page is a safe, simple way to count "active" ones.
    serverAuthedFetch<PagedResult<ReturnResponse>>("/api/shop/orders/returns?page=1&pageSize=20"),
  ]);

  const currency = business.currency || DEFAULT_CURRENCY;
  const activeReturns = returns.data?.items.filter((r) => ACTIVE_RETURN_STATUSES.has(r.status)).length ?? 0;

  const stats = [
    { label: t("statOrders"), value: recentOrders.data ? String(recentOrders.data.totalCount) : "—" },
    { label: t("statWishlist"), value: wishlist.data ? String(wishlist.data.totalCount) : "—" },
    {
      label: t("statStoreCredit"),
      value: storeCredit.data ? formatMoney(storeCredit.data.balance, storeCredit.data.currency || currency, locale) : "—",
    },
    { label: t("statActiveReturns"), value: returns.data ? String(activeReturns) : "—" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">{t("profileTitle")}</h1>

      {session.status === "PendingVerification" && <EmailVerificationBanner />}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border p-4">
            <p className="font-heading text-xl font-bold text-foreground sm:text-2xl">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-5 rounded-2xl border border-border p-5">
        <AvatarUpload user={session} />
        <ProfileForm user={session} />
      </div>

      {recentOrders.data && (
        <RecentOrdersCard orders={recentOrders.data.items} currency={currency} />
      )}
    </div>
  );
}
