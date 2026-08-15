import Image from "next/image";
import { useTranslations } from "next-intl";
import { Truck, ShieldCheck, Headset } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { isValidImageUrl } from "@/lib/image";
import type { BusinessResponse } from "@/types/api";

export function HeroBanner({ business }: { business: BusinessResponse }) {
  const t = useTranslations("home");
  const businessName = business.name || "Antivaly";
  const bannerUrl = isValidImageUrl(business.bannerUrl) ? business.bannerUrl : null;

  return (
    <section className="flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-2xl bg-muted">
        <div className="relative aspect-16/7 w-full sm:aspect-21/7">
          {bannerUrl ? (
            <Image
              src={bannerUrl}
              alt={businessName}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="size-full bg-linear-to-br from-primary to-primary/70" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 sm:p-8">
          <h1 className="font-heading max-w-xl text-2xl font-bold text-white sm:text-4xl">
            {businessName}
          </h1>
          {business.description && (
            <p className="max-w-lg text-sm text-white/90 sm:text-base line-clamp-2">
              {business.description}
            </p>
          )}
          <div>
            <Button
              size="lg"
              className="mt-1"
              render={<Link href="/products">{t("heroCta")}</Link>}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <TrustItem icon={<Truck className="size-5" />} title={t("trustCod")} desc={t("trustCodDesc")} />
        <TrustItem
          icon={<ShieldCheck className="size-5" />}
          title={t("trustSecure")}
          desc={t("trustSecureDesc")}
        />
        <TrustItem
          icon={<Headset className="size-5" />}
          title={t("trustSupport")}
          desc={t("trustSupportDesc")}
        />
      </div>
    </section>
  );
}

function TrustItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}
