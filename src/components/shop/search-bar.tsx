"use client";

import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Input } from "@/components/ui/input";
import { getPathname } from "@/i18n/navigation";

export function SearchBar({ className }: { className?: string }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const href = getPathname({ locale, href: "/products" });
    const query = value.trim();
    router.push(query ? `${href}?q=${encodeURIComponent(query)}` : href);
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="pl-9"
          aria-label={t("search")}
        />
      </div>
    </form>
  );
}
