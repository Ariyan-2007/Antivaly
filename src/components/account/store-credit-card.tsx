import { getTranslations } from "next-intl/server";
import { formatDate, formatMoney } from "@/lib/format";
import type { StoreCreditBalanceResponse } from "@/types/api";

export async function StoreCreditCard({
  balance,
  locale,
}: {
  balance: StoreCreditBalanceResponse;
  locale: string;
}) {
  const t = await getTranslations("account");

  return (
    <div className="flex flex-col gap-3">
      <p className="text-2xl font-bold text-foreground">
        {formatMoney(balance.balance, balance.currency || "USD", locale)}
      </p>
      {balance.recentEntries.length > 0 && (
        <div className="flex flex-col gap-1.5 text-sm">
          {balance.recentEntries.slice(0, 5).map((entry) => (
            <div key={entry.id} className="flex items-center justify-between text-muted-foreground">
              <span>
                {t(`storeCreditReasons.${entry.reason}`)} · {formatDate(entry.createdAt, locale)}
              </span>
              <span className={entry.amount < 0 ? "text-destructive" : "text-primary"}>
                {entry.amount > 0 ? "+" : ""}
                {formatMoney(entry.amount, entry.currency || "USD", locale)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
