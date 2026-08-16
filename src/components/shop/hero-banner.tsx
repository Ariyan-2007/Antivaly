"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Truck, Store, ShieldCheck, Headset, Zap } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { isValidImageUrl } from "@/lib/image";
import { cn } from "@/lib/utils";
import type { BusinessResponse, ContentBlockResponse } from "@/types/api";

const AUTO_ROTATE_MS = 6000;

type Slide = {
  key: string;
  imageUrl: string | null;
  title: string;
  subtitle: string | null;
  linkUrl: string;
  linkLabel: string;
};

export function HeroBanner({
  business,
  banners = [],
}: {
  business: BusinessResponse;
  banners?: ContentBlockResponse[];
}) {
  const t = useTranslations("home");
  const businessName = business.name || "Antivaly";

  const slides: Slide[] =
    banners.length > 0
      ? banners.map((b) => ({
          key: b.id,
          imageUrl: isValidImageUrl(b.imageUrl) ? b.imageUrl : null,
          title: b.title || businessName,
          subtitle: b.subtitle,
          linkUrl: b.linkUrl || "/products",
          linkLabel: b.linkLabel || t("heroCta"),
        }))
      : [
          {
            key: "default",
            imageUrl: isValidImageUrl(business.bannerUrl) ? business.bannerUrl : null,
            title: businessName,
            subtitle: business.description,
            linkUrl: "/products",
            linkLabel: t("heroCta"),
          },
        ];

  const [active, setActive] = useState(0);
  // Clamped at render time rather than reset via effect — banners.length changing (e.g. after
  // an ISR revalidation) shouldn't cascade a synchronous setState during the commit.
  const activeIndex = active % slides.length;

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => setActive((i) => (i + 1) % slides.length), AUTO_ROTATE_MS);
    return () => clearInterval(id);
  }, [slides.length]);

  const slide = slides[activeIndex];

  return (
    <section className="flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-2xl bg-muted shadow-xl shadow-foreground/5 ring-1 ring-foreground/5">
        <div className="relative aspect-16/7 w-full sm:aspect-21/7">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              {slide.imageUrl ? (
                <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  fill
                  priority={activeIndex === 0}
                  sizes="100vw"
                  className="object-cover"
                />
              ) : (
                <div className="size-full bg-linear-to-br from-primary via-primary/85 to-primary/60" />
              )}
            </motion.div>
          </AnimatePresence>
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
            key={`${slide.key}-title`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="font-heading max-w-xl text-2xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl"
          >
            {slide.title}
          </motion.h1>
          {slide.subtitle && (
            <motion.p
              key={`${slide.key}-subtitle`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
              className="max-w-lg text-sm text-white/90 sm:text-base line-clamp-2"
            >
              {slide.subtitle}
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
                /^https?:\/\//.test(slide.linkUrl) ? (
                  <a href={slide.linkUrl} target="_blank" rel="noopener noreferrer">
                    {slide.linkLabel}
                    <ArrowRight className="size-4 transition-transform group-hover/cta:translate-x-1" />
                  </a>
                ) : (
                  <Link href={slide.linkUrl as never}>
                    {slide.linkLabel}
                    <ArrowRight className="size-4 transition-transform group-hover/cta:translate-x-1" />
                  </Link>
                )
              }
            />
          </motion.div>
        </div>

        {slides.length > 1 && (
          <div className="absolute bottom-3 right-4 flex gap-1.5 sm:right-6">
            {slides.map((s, i) => (
              <button
                key={s.key}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => setActive(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === activeIndex ? "w-5 bg-white" : "w-1.5 bg-white/50"
                )}
              />
            ))}
          </div>
        )}
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
