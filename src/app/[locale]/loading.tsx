import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "@/components/shop/product-card-skeleton";

export default function HomeLoading() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-6">
      <Skeleton className="aspect-[21/9] w-full rounded-2xl sm:aspect-[3/1]" />

      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-48" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
          <ProductGridSkeleton count={5} />
        </div>
      ))}
    </div>
  );
}
