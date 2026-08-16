import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";
import type { OrderStatusEventResponse } from "@/types/api";

export function OrderStatusTimeline({
  events,
  locale,
}: {
  events: OrderStatusEventResponse[];
  locale: string;
}) {
  const t = useTranslations("orders");
  const tStatus = useTranslations("orders.status");

  if (events.length === 0) return null;

  const sorted = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="mt-4 rounded-xl border border-border p-5">
      <h2 className="mb-4 text-sm font-semibold text-foreground">{t("tracking")}</h2>
      <ol className="flex flex-col gap-0">
        {sorted.map((event, index) => {
          const isLast = index === sorted.length - 1;
          return (
            <li key={`${event.status}-${event.timestamp}`} className="relative flex gap-3 pb-6 last:pb-0">
              {!isLast && (
                <span className="absolute left-2.25 top-5 h-full w-px bg-border" aria-hidden />
              )}
              <CheckCircle2
                className={cn(
                  "mt-0.5 size-4.5 shrink-0",
                  isLast ? "text-primary" : "text-muted-foreground"
                )}
              />
              <div className="flex flex-col gap-0.5">
                <span
                  className={cn(
                    "text-sm font-medium",
                    isLast ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {tStatus(event.status)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(event.timestamp, locale)}
                </span>
                {event.note && <span className="text-xs text-muted-foreground">{event.note}</span>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
