"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Star, X } from "lucide-react";
import { useRouter, usePathname, Link } from "@/i18n/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CatalogFacetsResponse } from "@/types/api";

const RATING_OPTIONS = [4, 3, 2, 1];

export function FacetSidebar({ facets }: { facets: CatalogFacetsResponse }) {
  const t = useTranslations("listing");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeBrand = searchParams.get("brand") ?? "";
  const activeTags = searchParams.getAll("tags");
  const inStockOnly = searchParams.get("inStockOnly") === "true";
  const minRating = searchParams.get("minRating");

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  function pushParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggleTag(tag: string) {
    pushParams((params) => {
      const current = params.getAll("tags").filter((v) => v !== tag);
      params.delete("tags");
      if (!activeTags.includes(tag)) current.push(tag);
      for (const v of current) params.append("tags", v);
    });
  }

  const hasActiveFilters =
    activeBrand || activeTags.length > 0 || inStockOnly || minRating || minPrice || maxPrice;

  return (
    <aside className="flex w-full shrink-0 flex-col gap-6 lg:w-56">
      {hasActiveFilters && (
        <Link
          href={pathname as never}
          className="flex w-fit items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <X className="size-3.5" />
          {t("clearFilters")}
        </Link>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-foreground">{t("priceRange")}</span>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            pushParams((params) => {
              if (minPrice) params.set("minPrice", minPrice);
              else params.delete("minPrice");
              if (maxPrice) params.set("maxPrice", maxPrice);
              else params.delete("maxPrice");
            });
          }}
          className="flex items-center gap-2"
        >
          <Input
            type="number"
            min={0}
            inputMode="decimal"
            placeholder={String(facets.minPrice)}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="h-8"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            min={0}
            inputMode="decimal"
            placeholder={String(facets.maxPrice)}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-8"
          />
          <Button type="submit" size="sm" variant="outline">
            {t("applyPrice")}
          </Button>
        </form>
      </div>

      <label className="group flex items-center gap-2">
        <Checkbox
          checked={inStockOnly}
          onCheckedChange={(v) =>
            pushParams((params) => {
              if (v) params.set("inStockOnly", "true");
              else params.delete("inStockOnly");
            })
          }
        />
        <Label className="cursor-pointer text-sm font-normal">
          {t("inStockOnly")} ({facets.inStockCount})
        </Label>
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-foreground">{t("minRating")}</span>
        <div className="flex flex-col gap-1.5">
          {RATING_OPTIONS.map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() =>
                pushParams((params) => {
                  if (minRating === String(rating)) params.delete("minRating");
                  else params.set("minRating", String(rating));
                })
              }
              className={cn(
                "flex items-center gap-1 text-sm transition-colors",
                minRating === String(rating)
                  ? "font-semibold text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {Array.from({ length: rating }).map((_, i) => (
                <Star key={i} className="size-3.5 fill-current" />
              ))}
              <span>{t("andUp")}</span>
            </button>
          ))}
        </div>
      </div>

      {facets.brands.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">{t("brand")}</span>
          <div className="flex flex-col gap-1.5">
            {facets.brands.map((b) => (
              <button
                key={b.value}
                type="button"
                onClick={() =>
                  pushParams((params) => {
                    if (activeBrand === b.value) params.delete("brand");
                    else params.set("brand", b.value);
                  })
                }
                className={cn(
                  "flex items-center justify-between text-sm transition-colors",
                  activeBrand === b.value
                    ? "font-semibold text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="line-clamp-1 text-left">{b.value}</span>
                <span className="shrink-0 text-xs">{b.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {facets.tags.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">{t("tags")}</span>
          <div className="flex flex-wrap gap-1.5">
            {facets.tags.map((tag) => (
              <button
                key={tag.value}
                type="button"
                onClick={() => toggleTag(tag.value)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                  activeTags.includes(tag.value)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                )}
              >
                {tag.value} ({tag.count})
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
