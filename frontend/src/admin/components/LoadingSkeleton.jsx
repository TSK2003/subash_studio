export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="h-6 w-36 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-8 w-64 bg-gray-100 rounded-xl animate-pulse" />
      </div>

      {/* Rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0"
          >
            {Array.from({ length: cols }).map((_, j) => (
              <div
                key={j}
                className="h-4 bg-gray-100 rounded animate-pulse"
                style={{ width: `${Math.max(40, 100 / cols - 5)}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs space-y-3 p-4"
        >
          <div className="aspect-[4/3] w-full bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-5 w-3/4 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="h-6 w-16 bg-gray-100 rounded-full animate-pulse" />
            <div className="h-6 w-16 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatCardsSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-3.5 sm:p-4 rounded-xl bg-white border border-gray-200 shadow-xs space-y-3"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
              <div className="h-7 w-28 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse" />
          </div>
          <div className="h-3 w-32 bg-gray-100 rounded animate-pulse pt-2" />
        </div>
      ))}
    </div>
  );
}
