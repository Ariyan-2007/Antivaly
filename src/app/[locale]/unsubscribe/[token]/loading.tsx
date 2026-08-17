import { Skeleton } from "@/components/ui/skeleton";

export default function UnsubscribeLoading() {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-3 px-4 py-24 text-center">
      <Skeleton className="size-10 rounded-full" />
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-56" />
      <Skeleton className="h-8 w-28 rounded-lg" />
    </div>
  );
}
