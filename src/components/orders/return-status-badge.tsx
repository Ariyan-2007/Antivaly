import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import type { ReturnStatus } from "@/types/api";

const VARIANT: Record<ReturnStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Requested: "outline",
  Approved: "secondary",
  Rejected: "destructive",
  Received: "secondary",
  Refunded: "default",
  Cancelled: "destructive",
};

export function ReturnStatusBadge({ status }: { status: ReturnStatus }) {
  const t = useTranslations("returns.status");
  return <Badge variant={VARIANT[status]}>{t(status)}</Badge>;
}
