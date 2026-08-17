import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProfileForm } from "@/components/account/profile-form";
import { AvatarUpload } from "@/components/account/avatar-upload";
import { EmailVerificationBanner } from "@/components/account/email-verification-banner";
import { RecentOrdersCard } from "@/components/account/recent-orders-card";
import { getServerSession } from "@/lib/auth/session";
import { serverAuthedFetch } from "@/lib/auth/authed-fetch";
import { getBusiness } from "@/lib/api/catalog";
import { DEFAULT_CURRENCY } from "@/lib/constants";
import type { OrderResponse, PagedResult } from "@/types/api";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

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

  const [business, recentOrders] = await Promise.all([
    getBusiness(),
    serverAuthedFetch<PagedResult<OrderResponse>>("/api/shop/orders?page=1&pageSize=3"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">{t("profileTitle")}</h1>

      {session.status === "PendingVerification" && <EmailVerificationBanner />}

      <div className="flex flex-col gap-5 rounded-xl border border-border p-5">
        <AvatarUpload user={session} />
        <ProfileForm user={session} />
      </div>

      {recentOrders.data && (
        <RecentOrdersCard
          orders={recentOrders.data.items}
          currency={business.currency || DEFAULT_CURRENCY}
        />
      )}
    </div>
  );
}
