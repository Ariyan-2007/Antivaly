"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CatalogSort } from "@/types/api";

const SORT_VALUES: CatalogSort[] = [
  "Relevance",
  "Newest",
  "PriceAscending",
  "PriceDescending",
  "TopRated",
  "BestSelling",
  "NameAscending",
];

export function SortDropdown({ value }: { value: CatalogSort }) {
  const t = useTranslations("listing");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onValueChange(next: string | null) {
    if (!next) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", next);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger aria-label={t("sortLabel")}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SORT_VALUES.map((sort) => (
          <SelectItem key={sort} value={sort}>
            {t(`sort.${sort}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
