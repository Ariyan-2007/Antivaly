"use client";

import { useMemo, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Loader2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "@/i18n/navigation";
import { browserFetch } from "@/lib/api/browser";
import { ApiError } from "@/lib/api/client";
import { useCartStore } from "@/store/cart-store";
import { computeDeliveryFee } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import type { CheckoutRequest, OrderResponse } from "@/types/api";
import type { NormalizedCart } from "@/store/cart-store";

const schema = z.object({
  label: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().min(6),
  isDefault: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function CheckoutForm({ cart, currency }: { cart: NormalizedCart; currency: string }) {
  const t = useTranslations("checkout");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const setCart = useCartStore((s) => s.setCart);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { country: "Bangladesh", isDefault: true, line2: "" },
  });

  const city = watch("city") || "";
  const deliveryFee = useMemo(() => computeDeliveryFee(city, cart.subtotal), [city, cart.subtotal]);
  const total = cart.subtotal + deliveryFee;

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const body: CheckoutRequest = {
        shippingAddress: { ...values, line2: values.line2 ?? "" },
        deliveryFee,
      };
      try {
        const order = await browserFetch<OrderResponse>("/api/shop/orders/checkout", {
          method: "POST",
          body,
        });
        setCart(null);
        router.push(`/orders/${order.id}`);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : tc("errorGeneric"));
      }
    });
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 rounded-xl border border-border p-5 lg:col-span-2"
      >
        <h2 className="text-lg font-semibold text-foreground">{t("shippingAddress")}</h2>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="label">{t("addressLabel")}</Label>
          <Input id="label" placeholder={t("addressLabelPlaceholder")} {...register("label")} />
          {errors.label && <p className="text-xs text-destructive">{errors.label.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="line1">{t("line1")}</Label>
          <Input id="line1" {...register("line1")} />
          {errors.line1 && <p className="text-xs text-destructive">{errors.line1.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="line2">{t("line2")}</Label>
          <Input id="line2" {...register("line2")} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="city">{t("city")}</Label>
            <Input id="city" {...register("city")} />
            {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="state">{t("state")}</Label>
            <Input id="state" {...register("state")} />
            {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="postalCode">{t("postalCode")}</Label>
            <Input id="postalCode" {...register("postalCode")} />
            {errors.postalCode && (
              <p className="text-xs text-destructive">{errors.postalCode.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="country">{t("country")}</Label>
            <Input id="country" {...register("country")} />
            {errors.country && <p className="text-xs text-destructive">{errors.country.message}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">{t("phone")}</Label>
          <Input id="phone" type="tel" {...register("phone")} />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>

        <Controller
          control={control}
          name="isDefault"
          render={({ field }) => (
            <label className="flex items-center gap-2 text-sm text-foreground">
              <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(!!v)} />
              {t("setAsDefault")}
            </label>
          )}
        />

        <Button type="submit" size="lg" disabled={isPending} className="mt-2">
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {isPending ? t("placingOrder") : t("placeOrder")}
        </Button>
      </form>

      <div className="flex h-fit flex-col gap-4 rounded-xl border border-border p-5">
        <h2 className="text-lg font-semibold text-foreground">{t("orderSummary")}</h2>

        <div className="flex flex-col gap-1.5 text-sm">
          {cart.items.map((item) => (
            <div key={item.productId} className="flex justify-between text-muted-foreground">
              <span className="line-clamp-1 pr-2">
                {item.productName || tc("unnamedItem")} × {item.quantity}
              </span>
              <span className="shrink-0">{formatMoney(item.lineTotal, currency, locale)}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1.5 border-t border-border pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{tc("subtotal")}</span>
            <span>{formatMoney(cart.subtotal, currency, locale)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{tc("deliveryFee")}</span>
            <span>{deliveryFee === 0 ? tc("free") : formatMoney(deliveryFee, currency, locale)}</span>
          </div>
          <div className="flex justify-between pt-1 text-base font-bold text-foreground">
            <span>{tc("total")}</span>
            <span>{formatMoney(total, currency, locale)}</span>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-primary/10 p-3">
          <Truck className="mt-0.5 size-4 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">{t("codTitle")}</p>
            <p className="text-xs text-muted-foreground">{t("codDescription")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
