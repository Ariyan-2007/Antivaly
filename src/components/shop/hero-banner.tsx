"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { ArrowRight, Truck, Store, ShieldCheck, Headset, Zap } from "lucide-react";
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
      <div className="relative overflow-hidden rounded-2xl bg-muted shadow-xl shadow-foreground/5 ring-1 ring-foreground/5">
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
            <div className="size-full bg-linear-to-br from-primary via-primary/85 to-primary/60" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-black/5" />
          <div className="absolute inset-0 bg-linear-to-r from-black/30 via-transparent to-transparent" />
        </div>

        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur sm:left-6 sm:top-6"
        >
          <Zap className="size-3.5 fill-deal text-deal" />
          {t("expressBadge")}
        </motion.span>

        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 sm:p-8">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="font-heading max-w-xl text-2xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl"
          >
            {businessName}
          </motion.h1>
          {business.description && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
              className="max-w-lg text-sm text-white/90 sm:text-base line-clamp-2"
            >
              {business.description}
            </motion.p>
          )}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
          >
            <Button
              size="lg"
              className="group/cta mt-1 gap-2 shadow-lg shadow-primary/30"
              render={
                <Link href="/products">
                  {t("heroCta")}
                  <ArrowRight className="size-4 transition-transform group-hover/cta:translate-x-1" />
                </Link>
              }
            />
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <TrustItem icon={<Zap className="size-5" />} title={t("trustFast")} desc={t("trustFastDesc")} />
        {business.deliveryModuleEnabled ? (
          <TrustItem
            icon={<Truck className="size-5" />}
            title={t("trustCod")}
            desc={t("trustCodDesc")}
          />
        ) : (
          <TrustItem
            icon={<Store className="size-5" />}
            title={t("trustPickup")}
            desc={t("trustPickupDesc")}
          />
        )}
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -3 }}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary/20 to-primary/5 text-primary">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{desc}</p>
      </div>
    </motion.div>
  );
}
