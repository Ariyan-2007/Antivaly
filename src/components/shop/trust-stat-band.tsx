import { Zap, Truck, Store, ShieldCheck, RotateCcw } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function TrustStatBand({ deliveryModuleEnabled }: { deliveryModuleEnabled: boolean }) {
  const t = await getTranslations("home");

  const stats = [
    { icon: Zap, title: t("trustFast"), sub: t("trustFastDesc") },
    deliveryModuleEnabled
      ? { icon: Truck, title: t("trustCod"), sub: t("trustCodDesc") }
      : { icon: Store, title: t("trustPickup"), sub: t("trustPickupDesc") },
    { icon: ShieldCheck, title: t("trustSecure"), sub: t("trustSecureDesc") },
    { icon: RotateCcw, title: t("trustReturns"), sub: t("trustReturnsDesc") },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.title} className="flex items-center gap-2.5 rounded-2xl border border-border p-3.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-4.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-foreground">{stat.title}</p>
              <p className="truncate text-xs text-muted-foreground">{stat.sub}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
