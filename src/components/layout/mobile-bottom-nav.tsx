"use client";

import { Home, LayoutGrid, ShoppingCart, MapPinned, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useCartStore } from "@/store/cart-store";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const user = useAuth();
  const itemCount = useCartStore((s) => s.itemCount);

  const items = [
    { href: "/" as const, label: t("home"), icon: Home },
    { href: "/products" as const, label: t("allCategories"), icon: LayoutGrid },
    { href: "/cart" as const, label: t("cart"), icon: ShoppingCart, badge: itemCount },
    {
      // A signed-in customer has real order history with a live tracking timeline
      // (`/account/orders/[orderId]`) — send them there. `/track-order` is the guest-only,
      // no-auth order-number+email lookup form, so it's the right default for everyone else.
      href: user ? ("/account/orders" as const) : ("/track-order" as const),
      label: t("trackOrder"),
      icon: MapPinned,
    },
    { href: user ? ("/account" as const) : ("/login" as const), label: t("account"), icon: User },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 md:hidden">
      <div className="grid grid-cols-5">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <span className="relative">
                <Icon className="size-5" />
                {!!item.badge && (
                  <span className="absolute -right-2 -top-1.5 flex size-4 items-center justify-center rounded-full bg-deal text-[9px] font-bold text-deal-foreground">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
