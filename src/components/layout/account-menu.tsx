"use client";

import { useTransition } from "react";
import { User, LogOut, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuthContext } from "@/components/providers/auth-provider";
import { browserFetch } from "@/lib/api/browser";
import { useCartStore } from "@/store/cart-store";

export function AccountMenu() {
  const t = useTranslations("nav");
  const { user, setUser } = useAuthContext();
  const router = useRouter();
  const setCart = useCartStore((s) => s.setCart);
  const [isPending, startTransition] = useTransition();

  if (!user) {
    return (
      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="sm" render={<Link href="/login">{t("login")}</Link>} />
        <Button size="sm" render={<Link href="/register">{t("register")}</Link>} />
      </div>
    );
  }

  function handleLogout() {
    startTransition(async () => {
      try {
        await browserFetch("/api/auth/logout", { method: "POST" });
      } catch {
        // The server-side route always clears cookies even if it couldn't reach Vastora's
        // own logout endpoint — only a total network failure to our own server lands here,
        // in which case the session is likely already unusable, so proceed with local cleanup.
      }
      setCart(null);
      setUser(null);
      router.push("/");
    });
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        aria-label={t("account")}
        render={
          <Link href="/account">
            <User className="size-5" />
          </Link>
        }
      />
      <Button
        variant="ghost"
        size="icon"
        aria-label={t("logout")}
        disabled={isPending}
        onClick={handleLogout}
      >
        {isPending ? <Loader2 className="size-5 animate-spin" /> : <LogOut className="size-5" />}
      </Button>
    </div>
  );
}
