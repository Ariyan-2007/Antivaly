import { Skeleton } from "@/components/ui/skeleton";

export default function StoreCreditLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-40" />

      <div className="rounded-xl border border-border p-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-2 h-9 w-32" />
      </div>

      <div className="rounded-xl border border-border p-5">
        <Skeleton className="mb-4 h-5 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
