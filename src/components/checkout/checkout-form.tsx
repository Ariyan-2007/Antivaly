"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Loader2, Truck, Store, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useRouter, Link } from "@/i18n/navigation";
import { browserFetch } from "@/lib/api/browser";
import { ApiError } from "@/lib/api/client";
import { useCartStore } from "@/store/cart-store";
import { useAuth } from "@/components/providers/auth-provider";
import { useBusiness } from "@/components/providers/business-provider";
import { CART_TOKEN_HEADER, getGuestToken } from "@/lib/cart/guest-token";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  CheckoutRequest,
  CheckoutPreviewResponse,
  OrderResponse,
  FulfillmentMethod,
} from "@/types/api";
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
  guestEmail: z.string().optional(),
  guestPhone: z.string().optional(),
  guestName: z.string().optional(),
  customerNote: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function guestHeaders(): Record<string, string> {
  const token = getGuestToken();
  return token ? { [CART_TOKEN_HEADER]: token } : {};
}

export function CheckoutForm({
  cart,
  currency,
}: {
  cart: NormalizedCart;
  currency: string;
}) {
  const t = useTranslations("checkout");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const setCart = useCartStore((s) => s.setCart);
  const user = useAuth();
  const business = useBusiness();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    control,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { country: "Bangladesh", isDefault: true, line2: "" },
  });

  const address = watch();
  const isGuest = !user;
  const guestBlocked = isGuest && !business.guestCheckoutEnabled;

  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>("Delivery");
  const [shippingRateId, setShippingRateId] = useState<string | null>(null);
  const [useStoreCredit, setUseStoreCredit] = useState(false);
  const [giftCardCodes, setGiftCardCodes] = useState("");

  const [preview, setPreview] = useState<CheckoutPreviewResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Deliberately regenerated only when the cart's identity changes (blueprint §6.4) — the
  // deps are the reset signal, not values read inside the memo.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const idempotencyKey = useMemo(() => crypto.randomUUID(), [cart.itemCount, cart.estimatedTotal]);

  function buildRequest(): CheckoutRequest {
    return {
      shippingAddress: {
        label: address.label || null,
        line1: address.line1 || null,
        line2: address.line2 || "",
        city: address.city || null,
        state: address.state || null,
        postalCode: address.postalCode || null,
        country: address.country || null,
        phone: address.phone || null,
        isDefault: address.isDefault,
      },
      fulfillmentMethod: business.deliveryModuleEnabled ? fulfillmentMethod : undefined,
      shippingRateId: shippingRateId || undefined,
      useStoreCredit: user ? useStoreCredit : undefined,
      giftCardCodes: giftCardCodes.trim()
        ? giftCardCodes.split(",").map((c) => c.trim()).filter(Boolean)
        : undefined,
      customerNote: address.customerNote || undefined,
      guestEmail: isGuest ? address.guestEmail || null : undefined,
      guestPhone: isGuest ? address.guestPhone || null : undefined,
      guestName: isGuest ? address.guestName || null : undefined,
    };
  }

  useEffect(() => {
    if (guestBlocked) return;
    if (!address.line1 || !address.city || !address.country) return;

    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => {
      setPreviewLoading(true);
      browserFetch<CheckoutPreviewResponse>("/api/shop/orders/preview", {
        method: "POST",
        body: buildRequest(),
        headers: guestHeaders(),
      })
        .then(setPreview)
        .catch(() => setPreview(null))
        .finally(() => setPreviewLoading(false));
    }, 500);

    return () => {
      if (previewTimer.current) clearTimeout(previewTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postalCode,
    address.country,
    fulfillmentMethod,
    shippingRateId,
    useStoreCredit,
    giftCardCodes,
    guestBlocked,
  ]);

  function onSubmit(values: FormValues) {
    if (isGuest && !values.guestEmail) {
      setError("guestEmail", { message: t("guestEmailRequired") });
      return;
    }

    startTransition(async () => {
      try {
        const order = await browserFetch<OrderResponse>("/api/shop/orders/checkout", {
          method: "POST",
          body: buildRequest(),
          headers: { ...guestHeaders(), "Idempotency-Key": idempotencyKey },
        });
        setCart(null);
        router.push(`/orders/${order.id}`);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : tc("errorGeneric"));
      }
    });
  }

  if (guestBlocked) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border py-16 text-center">
        <p className="max-w-sm text-muted-foreground">{t("signInRequired")}</p>
        <Button render={<Link href="/login?redirect=/checkout">{t("signInToCheckout")}</Link>} />
      </div>
    );
  }

  const taxDisplayName = business.tax.displayName || tc("tax");
  const showShippingOptions = (preview?.shippingOptions.length ?? 0) > 0;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 rounded-xl border border-border p-5 lg:col-span-2"
      >
        {isGuest && (
          <>
            <h2 className="text-lg font-semibold text-foreground">{t("guestDetails")}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="guestName">{t("guestName")}</Label>
                <Input id="guestName" {...register("guestName")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="guestEmail">{t("guestEmail")}</Label>
                <Input id="guestEmail" type="email" {...register("guestEmail")} />
                {errors.guestEmail && (
                  <p className="text-xs text-destructive">{errors.guestEmail.message}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="guestPhone">{t("guestPhone")}</Label>
              <Input id="guestPhone" type="tel" {...register("guestPhone")} />
            </div>
          </>
        )}

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

        {business.deliveryModuleEnabled && (
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <h2 className="text-sm font-semibold text-foreground">{t("fulfillmentMethod")}</h2>
            <div className="grid grid-cols-2 gap-2">
              {(["Delivery", "Pickup"] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setFulfillmentMethod(method)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                    fulfillmentMethod === method
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {method === "Delivery" ? <Truck className="size-4" /> : <Store className="size-4" />}
                  {method === "Delivery" ? t("deliveryOption") : t("pickupOption")}
                </button>
              ))}
            </div>
          </div>
        )}

        {showShippingOptions && (
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <h2 className="text-sm font-semibold text-foreground">{t("shippingMethod")}</h2>
            <div className="flex flex-col gap-2">
              {preview!.shippingOptions.map((option) => {
                const isSelected = shippingRateId
                  ? shippingRateId === option.rateId
                  : option.name === preview!.shippingMethodName;
                return (
                  <button
                    key={option.rateId}
                    type="button"
                    onClick={() => setShippingRateId(option.rateId)}
                    className={cn(
                      "flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {isSelected && <Check className="size-4 shrink-0 text-primary" />}
                      <span>
                        <span className="block font-medium text-foreground">{option.name}</span>
                        {(option.estimatedDaysMin || option.estimatedDaysMax) && (
                          <span className="text-xs text-muted-foreground">
                            {t("estimatedDays", {
                              min: option.estimatedDaysMin ?? option.estimatedDaysMax ?? 0,
                              max: option.estimatedDaysMax ?? option.estimatedDaysMin ?? 0,
                            })}
                          </span>
                        )}
                      </span>
                    </span>
                    <span className="font-semibold text-foreground">
                      {option.price === 0 ? tc("free") : formatMoney(option.price, currency, locale)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {user && (
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <Checkbox checked={useStoreCredit} onCheckedChange={(v) => setUseStoreCredit(!!v)} />
              {t("useStoreCredit")}
              {preview && preview.storeCreditAvailable > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({formatMoney(preview.storeCreditAvailable, currency, locale)} {t("available")})
                </span>
              )}
            </label>
          </div>
        )}

        <div className="flex flex-col gap-1.5 border-t border-border pt-4">
          <Label htmlFor="giftCardCodes">{t("giftCardCodes")}</Label>
          <Input
            id="giftCardCodes"
            placeholder={t("giftCardCodesPlaceholder")}
            value={giftCardCodes}
            onChange={(e) => setGiftCardCodes(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="customerNote">{t("customerNote")}</Label>
          <Textarea id="customerNote" rows={2} {...register("customerNote")} />
        </div>

        <Button type="submit" size="lg" disabled={isPending} className="mt-2">
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {isPending ? t("placingOrder") : t("placeOrder")}
        </Button>
      </form>

      <div className="flex h-fit flex-col gap-4 rounded-xl border border-border p-5">
        <h2 className="text-lg font-semibold text-foreground">{t("orderSummary")}</h2>

        <div className="flex flex-col gap-1.5 text-sm">
          {cart.items.map((item) => (
            <div key={`${item.productId}-${item.variantId ?? ""}`} className="flex justify-between text-muted-foreground">
              <span className="line-clamp-1 pr-2">
                {item.productName || tc("unnamedItem")}
                {item.variantSummary ? ` (${item.variantSummary})` : ""} × {item.quantity}
              </span>
              <span className="shrink-0">{formatMoney(item.lineTotal, currency, locale)}</span>
            </div>
          ))}
        </div>

        {previewLoading && !preview ? (
          <div className="flex justify-center py-6">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : preview ? (
          <div className="flex flex-col gap-1.5 border-t border-border pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{tc("subtotal")}</span>
              <span>{formatMoney(preview.subtotal, currency, locale)}</span>
            </div>
            {preview.discounts.map((d, i) => (
              <div key={i} className="flex justify-between text-primary">
                <span>{d.label || tc("discount")}</span>
                <span>-{formatMoney(d.amount, currency, locale)}</span>
              </div>
            ))}
            {business.deliveryModuleEnabled && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tc("deliveryFee")}</span>
                <span>
                  {preview.deliveryFee === 0 ? tc("free") : formatMoney(preview.deliveryFee, currency, locale)}
                </span>
              </div>
            )}
            {preview.taxAmount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>
                  {taxDisplayName}
                  {preview.pricesIncludeTax ? ` (${t("taxIncluded")})` : ""}
                </span>
                <span>{formatMoney(preview.taxAmount, currency, locale)}</span>
              </div>
            )}
            {preview.giftCardTotal > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>{t("giftCardApplied")}</span>
                <span>-{formatMoney(preview.giftCardTotal, currency, locale)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 text-base font-bold text-foreground">
              <span>{tc("total")}</span>
              <span>{formatMoney(preview.total, currency, locale)}</span>
            </div>
            {preview.amountDue !== preview.total && (
              <div className="flex justify-between text-sm font-semibold text-primary">
                <span>{t("amountDue")}</span>
                <span>{formatMoney(preview.amountDue, currency, locale)}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 border-t border-border pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{tc("subtotal")}</span>
              <span>{formatMoney(cart.estimatedTotal, currency, locale)}</span>
            </div>
            <p className="text-xs text-muted-foreground">{t("enterAddressForTotal")}</p>
          </div>
        )}

        <div className="flex items-start gap-2 rounded-lg bg-primary/10 p-3">
          {business.deliveryModuleEnabled ? (
            <>
              <Truck className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">{t("codTitle")}</p>
                <p className="text-xs text-muted-foreground">{t("codDescription")}</p>
              </div>
            </>
          ) : (
            <>
              <Store className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">{t("pickupTitle")}</p>
                <p className="text-xs text-muted-foreground">{t("pickupDescription")}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
