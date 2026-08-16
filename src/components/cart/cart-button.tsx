"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/store/cart-store";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { formatMoney } from "@/lib/format";

export function CartButton({ currency }: { currency: string }) {
  const tNav = useTranslations("nav");
  const tCart = useTranslations("cart");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const { cart, itemCount, hasLoaded, fetchCart } = useCartStore();

  useEffect(() => {
    if (!hasLoaded) fetchCart();
  }, [hasLoaded, fetchCart]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="relative" aria-label={tNav("cart")}>
            <ShoppingCart className="size-5" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex size-4.5 items-center justify-center rounded-full bg-deal text-[10px] font-bold text-deal-foreground">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Button>
        }
      />
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{tCart("title")}</SheetTitle>
        </SheetHeader>

        {!cart || cart.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingCart className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{tCart("emptyTitle")}</p>
            <Button
              render={
                <Link href="/products" onClick={() => setOpen(false)}>
                  {tCart("emptyCta")}
                </Link>
              }
            />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4">
              {cart.items.map((item) => (
                <CartLineItem
                  key={`${item.productId}-${item.variantId ?? ""}`}
                  item={item}
                  currency={currency}
                />
              ))}
            </div>
            <SheetFooter className="gap-3 border-t border-border pt-4">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>{tCommon("subtotal")}</span>
                <span>{formatMoney(cart.subtotal, currency, locale)}</span>
              </div>
              <Button
                size="lg"
                render={
                  <Link href="/checkout" onClick={() => setOpen(false)}>
                    {tCart("proceedToCheckout")}
                  </Link>
                }
              />
              <Button
                variant="outline"
                render={
                  <Link href="/cart" onClick={() => setOpen(false)}>
                    {tCommon("viewDetails")}
                  </Link>
                }
              />
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
