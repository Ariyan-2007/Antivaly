"use client";

import {
  User,
  Package,
  Heart,
  RotateCcw,
  MapPin,
  Wallet,
  Bell,
  Lock,
  Download,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type NavItem = { href: string; labelKey: string; icon: LucideIcon; destructive?: boolean };

const NAV_ITEMS: NavItem[] = [
  { href: "/account", labelKey: "navProfile", icon: User },
  { href: "/account/orders", labelKey: "navOrders", icon: Package },
  { href: "/account/wishlist", labelKey: "navWishlist", icon: Heart },
  { href: "/account/returns", labelKey: "navReturns", icon: RotateCcw },
  { href: "/account/addresses", labelKey: "navAddresses", icon: MapPin },
  { href: "/account/store-credit", labelKey: "navStoreCredit", icon: Wallet },
  { href: "/account/notifications", labelKey: "navNotifications", icon: Bell },
  { href: "/account/security", labelKey: "navSecurity", icon: Lock },
  { href: "/account/data", labelKey: "navData", icon: Download },
  { href: "/account/delete", labelKey: "navDelete", icon: Trash2, destructive: true },
];

function isActive(pathname: string, href: string): boolean {
  return href === "/account" ? pathname === "/account" : pathname.startsWith(href);
}

export function AccountSidebar() {
  const t = useTranslations("account");
  const pathname = usePathname();

  return (
    <>
      {/* Mobile / tablet: horizontal scrollable pill row */}
      <nav className="flex gap-2 overflow-x-auto no-scrollbar pb-1 lg:hidden">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href as never}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : item.destructive
                    ? "border-destructive/30 text-destructive hover:border-destructive/50"
                    : "border-border bg-background text-foreground hover:border-primary/50"
              )}
            >
              <Icon className="size-4" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      {/* Desktop: vertical sidebar */}
      <nav className="hidden w-56 shrink-0 flex-col gap-0.5 lg:flex">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href as never}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : item.destructive
                    ? "text-destructive hover:bg-destructive/10"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
