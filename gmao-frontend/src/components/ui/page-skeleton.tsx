import { Skeleton } from '@/components/ui/skeleton';

function HeaderSkeleton() {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-3">
        <Skeleton className="h-8 w-64 md:w-80" />
        <Skeleton className="h-4 w-72 md:w-96" />
      </div>
      <Skeleton className="h-11 w-40 shrink-0 rounded-xl md:w-56" />
    </div>
  );
}

export function ListPageSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-8">
      <HeaderSkeleton />
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function GridPageSkeleton({ cards = 8 }: { cards?: number }) {
  return (
    <div className="space-y-8">
      <HeaderSkeleton />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: cards }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
