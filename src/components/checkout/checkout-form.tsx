"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Loader2, Check, AlertTriangle } from "lucide-react";
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
import { DiscountsCard } from "@/components/cart/discounts-card";
import { FulfillmentToggle } from "@/components/cart/fulfillment-toggle";
import { CART_TOKEN_HEADER, getGuestToken } from "@/lib/cart/guest-token";
import { getLastCheckoutAddress, setLastCheckoutAddress } from "@/lib/checkout/last-address-cache";
import { orderHref } from "@/lib/routes";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AddressResponse, CheckoutRequest, CheckoutPreviewResponse, OrderResponse } from "@/types/api";
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
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { country: "Bangladesh", isDefault: true, line2: "" },
  });

  const [savedAddresses, setSavedAddresses] = useState<AddressResponse[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [saveNewAddress, setSaveNewAddress] = useState(false);
  // A signed-in customer's default address fills the form asynchronously (below) — without this,
  // a fast customer could hit Place Order while the form is still blank and submit an empty
  // shipping address instead of the one they expected.
  const [addressesLoading, setAddressesLoading] = useState(false);
  const mutatingCount = useCartStore((s) => s.mutatingCount);

  function fillFromAddress(addr: {
    label: string | null; line1: string | null; line2: string | null; city: string | null;
    state: string | null; postalCode: string | null; country: string | null; phone: string | null;
  }) {
    reset({
      label: addr.label ?? "",
      line1: addr.line1 ?? "",
      line2: addr.line2 ?? "",
      city: addr.city ?? "",
      state: addr.state ?? "",
      postalCode: addr.postalCode ?? "",
      country: addr.country || "Bangladesh",
      phone: addr.phone ?? "",
      isDefault: true,
    });
  }

  // Signed-in customers get the real saved-address book (blueprint §6.5/§9.41) — pre-fill from
  // the default one. Guests have no book, so they fall back to whatever this browser last
  // checked out with (last-address-cache.ts).
  useEffect(() => {
    if (!user) {
      const cached = getLastCheckoutAddress();
      if (cached) fillFromAddress(cached);
      return;
    }
    setAddressesLoading(true);
    browserFetch<AddressResponse[]>("/api/shop/account/addresses")
      .then((addrs) => {
        const list = Array.isArray(addrs) ? addrs : [];
        setSavedAddresses(list);
        const preferred = list.find((a) => a.isDefault) ?? list[0];
        if (preferred) {
          setSelectedAddressId(preferred.id);
          fillFromAddress(preferred);
        }
      })
      .catch(() => {})
      .finally(() => setAddressesLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function selectSavedAddress(addr: AddressResponse) {
    setSelectedAddressId(addr.id);
    fillFromAddress(addr);
  }

  function clearToNewAddress() {
    setSelectedAddressId(null);
    reset({ label: "", line1: "", line2: "", city: "", state: "", postalCode: "", country: "Bangladesh", phone: "", isDefault: true });
  }

  const address = watch();
  const isGuest = !user;
  const guestBlocked = isGuest && !business.guestCheckoutEnabled;

  // Delivery vs Pickup now lives on the cart itself (blueprint §6.3/§9.44, via FulfillmentToggle
  // below) — read it straight off `cart` instead of tracking a separate local copy that could
  // drift from what was actually set server-side.
  const fulfillmentMethod = cart.fulfillmentMethod;
  const isPickup = fulfillmentMethod === "Pickup" || fulfillmentMethod === "Digital";

  const [shippingRateId, setShippingRateId] = useState<string | null>(null);
  // A previously picked rate may not exist under the new fulfillment method's option list.
  useEffect(() => {
    setShippingRateId(null);
  }, [fulfillmentMethod]);

  const [preview, setPreview] = useState<CheckoutPreviewResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // A 409 on checkout names the specific product and quantity available in its message
  // (blueprint §5/§6.4) — surfaced inline against that cart line rather than just a toast.
  const [stockConflict, setStockConflict] = useState<string | null>(null);

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
      // Send the exact same fulfillment method already set on the cart (blueprint §9.44) — the
      // cart's preview already showed the customer this choice, so checkout can't silently
      // default back to "Delivery" and bill a fee they weren't shown.
      fulfillmentMethod: business.deliveryModuleEnabled ? fulfillmentMethod : undefined,
      shippingRateId: shippingRateId || undefined,
      // Coupon/promotion/gift-card/store-credit are all applied directly to the server-side
      // cart now (blueprint §6.6/§9.43, via DiscountsCard below) — checkout reads them straight
      // off `cart` rather than tracking a separate local copy that could drift.
      useStoreCredit: user ? cart.useStoreCredit : undefined,
      giftCardCodes: cart.giftCardCodes && cart.giftCardCodes.length > 0 ? cart.giftCardCodes : undefined,
      customerNote: address.customerNote || undefined,
      guestEmail: isGuest ? address.guestEmail || null : undefined,
      guestPhone: isGuest ? address.guestPhone || null : undefined,
      guestName: isGuest ? address.guestName || null : undefined,
    };
  }

  const promotionCodesKey = (cart.promotionCodes ?? []).join(",");
  const giftCardCodesKey = (cart.giftCardCodes ?? []).join(",");

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
    cart.couponCode,
    promotionCodesKey,
    giftCardCodesKey,
    cart.useStoreCredit,
    guestBlocked,
  ]);

  function onSubmit(values: FormValues) {
    if (isGuest && !values.guestEmail) {
      setError("guestEmail", { message: t("guestEmailRequired") });
      return;
    }

    setStockConflict(null);
    startTransition(async () => {
      try {
        const request = buildRequest();
        const order = await browserFetch<OrderResponse>("/api/shop/orders/checkout", {
          method: "POST",
          body: request,
          headers: { ...guestHeaders(), "Idempotency-Key": idempotencyKey },
        });
        if (isGuest) {
          setLastCheckoutAddress(request.shippingAddress);
        } else if (saveNewAddress && !selectedAddressId) {
          // Best-effort — the order already went through either way, so a failure here
          // shouldn't block navigating to the confirmation.
          browserFetch("/api/shop/account/addresses", {
            method: "POST",
            body: {
              label: values.label,
              line1: values.line1,
              line2: values.line2 ?? "",
              city: values.city,
              state: values.state,
              postalCode: values.postalCode,
              country: values.country,
              phone: values.phone,
              isDefault: values.isDefault,
            },
          }).catch(() => {});
        }
        setCart(null);
        router.push(orderHref(order.id) as never);
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          // Nothing was actually reserved (blueprint §6.4) — safe to let the customer just
          // adjust the offending line and retry.
          setStockConflict(err.message);
        } else {
          toast.error(err instanceof ApiError ? err.message : tc("errorGeneric"));
        }
      }
    });
  }

  const conflictedItem = stockConflict
    ? cart.items.find((item) => item.productName && stockConflict.includes(item.productName))
    : null;

  if (guestBlocked) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border py-16 text-center">
        <p className="max-w-sm text-muted-foreground">{t("signInRequired")}</p>
        <Button render={<Link href="/login?redirect=/checkout">{t("signInToCheckout")}</Link>} />
      </div>
    );
  }

  const taxDisplayName = business.tax.displayName || tc("tax");

  // Delivery fee and shipping options are resolvable the moment a fulfillment method is picked
  // (blueprint §9.44) — no address needed. Prefer preview's numbers once an address is entered
  // (it may refine per-zone), but never show a blank/loading state before that.
  const shippingOptions = preview?.shippingOptions.length ? preview.shippingOptions : cart.shippingOptions;
  const shippingMethodName = preview?.shippingMethodName ?? cart.shippingMethodName;
  const showShippingOptions = !isPickup && shippingOptions.length > 0;

  const subtotal = preview?.subtotal ?? cart.subtotal;
  const discountRows = preview?.discounts ?? cart.discounts ?? [];
  const deliveryFee = preview?.deliveryFee ?? cart.deliveryFee;
  const giftCardTotal = preview?.giftCardTotal ?? cart.giftCardTotal;
  // Pre-tax running total (what preview.total lands on once tax is known; cart.amountDue already
  // is subtotal - discounts + delivery - gift cards - credit before that point, per §9.44).
  const runningTotal = preview?.total ?? cart.amountDue;
  const amountDueFinal = preview?.amountDue ?? cart.amountDue;
  // CheckoutPreviewResponse has no discrete "amount of store credit used" field — derive it the
  // same way the total is broken down: total - giftCardTotal - amountDue.
  const storeCreditApplied = preview
    ? Math.max(0, preview.total - preview.giftCardTotal - preview.amountDue)
    : cart.storeCreditApplied;

  // The order button stays inert until everything it depends on has actually settled: a coupon/
  // gift-card/fulfillment change still writing to the cart elsewhere on this page, the tax/total
  // preview mid-recalculation, or (for a signed-in customer) their saved address still loading —
  // submitting through any of these would place an order against numbers the customer never saw.
  const cartBusy = mutatingCount > 0;
  const notReady = cartBusy || previewLoading || addressesLoading;

  const cardClass = "flex flex-col gap-4 rounded-2xl border border-border p-5";

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-5 lg:col-span-2">
        {isGuest && (
          <div className={cardClass}>
            <p className="text-sm font-extrabold text-foreground">{t("guestDetails")}</p>
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
          </div>
        )}

        {business.deliveryModuleEnabled && (
          <div className={cardClass}>
            <FulfillmentToggle />
          </div>
        )}

        <div className={cardClass}>
          <p className="text-sm font-extrabold text-foreground">
            {isPickup ? t("pickupDetailsTitle") : t("shippingAddress")}
          </p>
          {isPickup && <p className="-mt-2 text-xs text-muted-foreground">{t("pickupAddressNote")}</p>}

          {savedAddresses.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">{t("useSavedAddress")}</span>
              <div className="flex flex-wrap gap-2">
                {savedAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => selectSavedAddress(addr)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-left text-xs transition-colors",
                      selectedAddressId === addr.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="block font-medium text-foreground">{addr.label}</span>
                    <span className="text-muted-foreground">{addr.city}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearToNewAddress}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-left text-xs transition-colors",
                    selectedAddressId === null
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {t("enterNewAddress")}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="label">{t("addressLabel")}</Label>
              <Input id="label" placeholder={t("addressLabelPlaceholder")} {...register("label")} />
              {errors.label && <p className="text-xs text-destructive">{errors.label.message}</p>}
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="phone">{t("phone")}</Label>
              <Input id="phone" type="tel" {...register("phone")} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="line1">{t("line1")}</Label>
              <Input id="line1" {...register("line1")} />
              {errors.line1 && <p className="text-xs text-destructive">{errors.line1.message}</p>}
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="line2">{t("line2")}</Label>
              <Input id="line2" {...register("line2")} />
            </div>

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

          {user && !selectedAddressId && (
            <label className="flex items-center gap-2 text-sm text-foreground">
              <Checkbox checked={saveNewAddress} onCheckedChange={(v) => setSaveNewAddress(!!v)} />
              {t("saveAddressForNextTime")}
            </label>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="customerNote">{t("customerNote")}</Label>
            <Textarea id="customerNote" rows={2} {...register("customerNote")} />
          </div>
        </div>

        {showShippingOptions && (
          <div className={cardClass}>
            <p className="text-sm font-extrabold text-foreground">{t("shippingMethod")}</p>
            <div className="flex flex-col gap-2">
              {shippingOptions.map((option) => {
                const isSelected = shippingRateId
                  ? shippingRateId === option.rateId
                  : option.name === shippingMethodName;
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

        <div className={cardClass}>
          <DiscountsCard currency={currency} />
        </div>

        <div className={cardClass}>
          <p className="text-sm font-extrabold text-foreground">{t("paymentMethod")}</p>
          <div className="flex items-center gap-2.5 rounded-xl border border-primary/15 bg-primary/6 p-3">
            <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full border-[5px] border-primary" />
            {isPickup ? (
              <div>
                <p className="text-sm font-bold text-foreground">{t("pickupTitle")}</p>
                <p className="text-xs text-muted-foreground">{t("pickupDescription")}</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-bold text-foreground">{t("codTitle")}</p>
                <p className="text-xs text-muted-foreground">{t("codDescription")}</p>
              </div>
            )}
          </div>
        </div>

        <Button
          type="button"
          size="lg"
          className="rounded-full lg:hidden"
          disabled={isPending || notReady}
          onClick={handleSubmit(onSubmit)}
        >
          {(isPending || notReady) && <Loader2 className="size-4 animate-spin" />}
          {isPending ? t("placingOrder") : notReady ? t("pleaseWait") : t("placeOrder")}
        </Button>
      </div>

      <div className="flex h-fit flex-col gap-4 rounded-2xl border border-border p-5 lg:sticky lg:top-22">
        <p className="text-sm font-extrabold text-foreground">{t("orderSummary")}</p>

        <div className="flex flex-col gap-1.5 text-sm">
          {cart.items.map((item) => {
            const isConflicted = conflictedItem?.productId === item.productId && conflictedItem?.variantId === item.variantId;
            return (
              <div key={`${item.productId}-${item.variantId ?? ""}`} className="flex flex-col gap-1">
                <div
                  className={cn(
                    "flex justify-between",
                    isConflicted ? "font-medium text-destructive" : "text-muted-foreground"
                  )}
                >
                  <span className="line-clamp-1 pr-2">
                    {item.productName || tc("unnamedItem")}
                    {item.variantSummary ? ` (${item.variantSummary})` : ""} × {item.quantity}
                  </span>
                  <span className="shrink-0">{formatMoney(item.lineTotal, currency, locale)}</span>
                </div>
                {isConflicted && (
                  <p className="flex items-start gap-1 text-xs text-destructive">
                    <AlertTriangle className="mt-0.5 size-3 shrink-0" />
                    {stockConflict}
                  </p>
                )}
              </div>
            );
          })}
          {stockConflict && !conflictedItem && (
            <p className="flex items-start gap-1 text-xs text-destructive">
              <AlertTriangle className="mt-0.5 size-3 shrink-0" />
              {stockConflict}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 border-t border-border pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{tc("subtotal")}</span>
            <span>{formatMoney(subtotal, currency, locale)}</span>
          </div>
          {discountRows.map((d, i) => (
            <div key={i} className="flex justify-between text-primary">
              <span>{d.label || tc("discount")}</span>
              <span>-{formatMoney(d.amount, currency, locale)}</span>
            </div>
          ))}
          {!isPickup && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{tc("deliveryFee")}</span>
              <span>{deliveryFee === 0 ? tc("free") : formatMoney(deliveryFee, currency, locale)}</span>
            </div>
          )}
          {preview ? (
            preview.taxAmount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>
                  {taxDisplayName}
                  {preview.pricesIncludeTax ? ` (${t("taxIncluded")})` : ""}
                </span>
                <span>{formatMoney(preview.taxAmount, currency, locale)}</span>
              </div>
            )
          ) : (
            <div className="flex justify-between text-xs text-muted-foreground italic">
              <span className="flex items-center gap-1">
                {previewLoading && <Loader2 className="size-3 animate-spin" />}
                {taxDisplayName}
              </span>
              <span>{t("enterAddressForTotal")}</span>
            </div>
          )}
          {giftCardTotal > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>{t("giftCardApplied")}</span>
              <span>-{formatMoney(giftCardTotal, currency, locale)}</span>
            </div>
          )}
          {storeCreditApplied > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>{t("storeCreditApplied")}</span>
              <span>-{formatMoney(storeCreditApplied, currency, locale)}</span>
            </div>
          )}
          <div className="flex justify-between pt-1 text-base font-extrabold text-foreground">
            <span>{tc("total")}</span>
            <span>{formatMoney(runningTotal, currency, locale)}</span>
          </div>
          {amountDueFinal !== runningTotal && (
            <div className="flex justify-between text-sm font-semibold text-primary">
              <span>{t("amountDue")}</span>
              <span>{formatMoney(amountDueFinal, currency, locale)}</span>
            </div>
          )}
        </div>

        <Button
          type="button"
          size="lg"
          className="hidden rounded-full lg:flex"
          disabled={isPending || notReady}
          onClick={handleSubmit(onSubmit)}
        >
          {(isPending || notReady) && <Loader2 className="size-4 animate-spin" />}
          {isPending ? t("placingOrder") : notReady ? t("pleaseWait") : t("placeOrder")}
        </Button>
      </div>
    </div>
  );
}
