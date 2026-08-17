"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Truck, Store, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { resolveApiImageUrl } from "@/lib/image";
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
          imageUrl: resolveApiImageUrl(b.imageUrl) ?? null,
          title: b.title || businessName,
          subtitle: b.subtitle,
          linkUrl: b.linkUrl || "/products",
          linkLabel: b.linkLabel || t("heroCta"),
        }))
      : [
          {
            key: "default",
            imageUrl: resolveApiImageUrl(business.bannerUrl) ?? null,
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
  const isPickup = !business.deliveryModuleEnabled;

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      {/* Main hero — deliberately dark/near-black rather than a brand-color gradient: it reads
          as confident and premium even in the common case of no uploaded banner image, and
          gives the red accents (badge, CTA, deal pills) somewhere to pop against. */}
      <div className="relative flex flex-col overflow-hidden rounded-2xl bg-foreground shadow-xl shadow-foreground/10 lg:col-span-2">
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              {slide.imageUrl && (
                <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  fill
                  priority={activeIndex === 0}
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover opacity-60"
                />
              )}
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-linear-to-t from-foreground via-foreground/85 to-foreground/50" />
        </div>

        <div className="relative flex flex-1 flex-col gap-5 p-6 sm:p-9">
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex w-fit items-center gap-1.5 rounded-full bg-background/10 px-3 py-1.5 text-xs font-semibold text-background ring-1 ring-background/20 backdrop-blur"
          >
            <Zap className="size-3.5 fill-primary text-primary" />
            {t("expressBadge")}
          </motion.span>

          <div className="flex flex-col gap-3">
            <motion.h1
              key={`${slide.key}-title`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="font-heading max-w-xl text-3xl leading-[1.05] font-extrabold tracking-tight text-background sm:text-4xl md:text-5xl"
            >
              {slide.title}
            </motion.h1>
            {slide.subtitle && (
              <motion.p
                key={`${slide.key}-subtitle`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
                className="max-w-lg text-sm text-background/70 sm:text-base line-clamp-2"
              >
                {slide.subtitle}
              </motion.p>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15, ease: "easeOut" }}
            className="flex flex-wrap items-center gap-x-5 gap-y-2"
          >
            <HeroPill icon={<Zap className="size-3.5" />} label={t("trustFast")} />
            <HeroPill icon={<ShieldCheck className="size-3.5" />} label={t("trustSecure")} />
            <HeroPill
              icon={isPickup ? <Store className="size-3.5" /> : <Truck className="size-3.5" />}
              label={isPickup ? t("trustPickup") : t("trustCod")}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
            className="mt-1 flex flex-wrap items-center gap-3"
          >
            <Button
              size="lg"
              className="group/cta gap-2 shadow-lg shadow-primary/30"
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
            <Button
              size="lg"
              variant="outline"
              className="border-background/25 bg-transparent text-background hover:bg-background/10 hover:text-background"
              render={<Link href="/products">{t("browseCategories")}</Link>}
            />
          </motion.div>
        </div>

        {slides.length > 1 && (
          <div className="relative flex justify-end gap-1.5 px-6 pb-5 sm:px-9">
            {slides.map((s, i) => (
              <button
                key={s.key}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => setActive(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === activeIndex ? "w-5 bg-background" : "w-1.5 bg-background/40"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Side promo rail — mirrors the main hero's confidence with two focused, shoppable
          callouts instead of duplicating the same trust messaging a third time. */}
      <div className="flex flex-col gap-4">
        <PromoCard
          icon={isPickup ? <Store className="size-5" /> : <Truck className="size-5" />}
          title={isPickup ? t("trustPickup") : t("trustCod")}
          desc={isPickup ? t("trustPickupDesc") : t("trustCodDesc")}
          href="/products"
          cta={t("heroCta")}
          tone="brand"
        />
        <PromoCard
          icon={<Sparkles className="size-5" />}
          title={t("newArrivalsTitle")}
          desc={t("newArrivalsDesc")}
          href="/products?sort=Newest"
          cta={t("heroCta")}
          tone="dark"
        />
      </div>
    </section>
  );
}

function HeroPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-background/90">
      <span className="text-primary">{icon}</span>
      {label}
    </span>
  );
}

function PromoCard({
  icon,
  title,
  desc,
  href,
  cta,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  href: string;
  cta: string;
  tone: "brand" | "dark";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className={cn(
        "relative flex flex-1 flex-col justify-between gap-4 overflow-hidden rounded-2xl p-5",
        tone === "brand" ? "bg-primary/8 ring-1 ring-primary/15" : "bg-foreground/5 ring-1 ring-foreground/10"
      )}
    >
      <div className="flex flex-col gap-1.5">
        <p className="font-heading text-base font-bold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
      <div className="flex items-center justify-between">
        <Link
          href={href as never}
          className={cn(
            "group/link inline-flex items-center gap-1 text-sm font-semibold",
            tone === "brand" ? "text-primary" : "text-foreground"
          )}
        >
          {cta}
          <ArrowRight className="size-3.5 transition-transform group-hover/link:translate-x-0.5" />
        </Link>
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full",
            tone === "brand" ? "bg-primary text-primary-foreground" : "bg-foreground text-background"
          )}
        >
          {icon}
        </span>
      </div>
    </motion.div>
  );
}
