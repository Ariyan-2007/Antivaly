import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "@/components/shop/product-card-skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6">
      <Skeleton className="h-4 w-64" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-xl" />

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-11 w-full rounded-lg" />
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-48" />
        <ProductGridSkeleton count={5} />
      </div>
    </div>
  );
}
