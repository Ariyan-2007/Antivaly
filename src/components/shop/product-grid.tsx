import { ProductCard } from "@/components/shop/product-card";
import type { ProductResponse } from "@/types/api";

export function ProductGrid({
  products,
  currency,
  locale,
  emptyMessage,
}: {
  products: ProductResponse[];
  currency: string;
  locale: string;
  emptyMessage?: string;
}) {
  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">{emptyMessage}</p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} currency={currency} locale={locale} />
      ))}
    </div>
  );
}
