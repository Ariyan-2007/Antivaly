import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import type { OrderStatus, PaymentStatus } from "@/types/api";

const STATUS_VARIANT: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
  PendingPayment: "outline",
  Processing: "secondary",
  Confirmed: "secondary",
  OutForDelivery: "default",
  Delivered: "default",
  Cancelled: "destructive",
  Refunded: "destructive",
  AwaitingPickup: "default",
  PickedUp: "default",
};

const PAYMENT_VARIANT: Record<PaymentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Pending: "outline",
  Paid: "default",
  Failed: "destructive",
  Refunded: "destructive",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const t = useTranslations("orders.status");
  return <Badge variant={STATUS_VARIANT[status]}>{t(status)}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const t = useTranslations("orders.paymentStatus");
  return <Badge variant={PAYMENT_VARIANT[status]}>{t(status)}</Badge>;
}
