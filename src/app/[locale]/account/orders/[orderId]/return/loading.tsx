import { Skeleton } from "@/components/ui/skeleton";

export default function ReturnRequestLoading() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Skeleton className="h-8 w-40" />
      <div className="flex flex-col gap-4 rounded-xl border border-border p-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-5 shrink-0 rounded" />
            <Skeleton className="size-12 shrink-0 rounded-lg" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
    </div>
  );
}
