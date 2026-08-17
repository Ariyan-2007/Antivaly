import { redirect } from "next/navigation";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { getServerSession } from "@/lib/auth/session";

/**
 * Shared shell for the whole account dashboard (profile, orders, wishlist, returns,
 * addresses, ...) — one auth gate and one persistent sidebar instead of every page
 * re-implementing both. Individual pages under here no longer need their own redirect
 * check; getServerSession() is cache()-deduped so calling it again inside a page for its
 * own data doesn't cost a second round trip.
 */
export default async function AccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession();
  if (!session) {
    redirect(`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/account`)}`);
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 lg:flex-row lg:items-start lg:gap-8">
      <AccountSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
