import { cn } from "@/lib/utils/cn";

// ---------------------------------------------------------------------------
// Base skeleton block
// ---------------------------------------------------------------------------

interface LoadingSkeletonProps {
  className?: string;
}

/** A single animated skeleton block. Compose to build more complex shapes. */
export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      aria-hidden="true"
    />
  );
}

// ---------------------------------------------------------------------------
// Card skeleton
// ---------------------------------------------------------------------------

/** A card-shaped skeleton with a heading line and a few body lines. */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white p-5 space-y-3",
        className
      )}
      aria-busy="true"
      aria-label="Đang tải…"
    >
      {/* Header */}
      <LoadingSkeleton className="h-5 w-2/5" />
      {/* Body lines */}
      <LoadingSkeleton className="h-3.5 w-full" />
      <LoadingSkeleton className="h-3.5 w-4/5" />
      <LoadingSkeleton className="h-3.5 w-3/5" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Table row skeleton
// ---------------------------------------------------------------------------

/** A single row-shaped skeleton for list/table loading states. */
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div
      className="flex items-center gap-4 px-4 py-3 border-b border-gray-100"
      aria-hidden="true"
    >
      {Array.from({ length: columns }).map((_, i) => (
        <LoadingSkeleton
          key={i}
          className={cn("h-4", i === 0 ? "w-1/4" : "flex-1")}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page skeleton
// ---------------------------------------------------------------------------

/** A full-page skeleton: page heading + grid of cards. */
export function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Đang tải trang…">
      {/* Page title */}
      <div className="space-y-2">
        <LoadingSkeleton className="h-7 w-48" />
        <LoadingSkeleton className="h-4 w-72" />
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
