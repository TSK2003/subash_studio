import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 text-xs text-gray-500">
      <div>
        Showing <span className="font-semibold text-gray-900">{startItem}</span> to{" "}
        <span className="font-semibold text-gray-900">{endItem}</span> of{" "}
        <span className="font-semibold text-gray-900">{totalItems}</span> results
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }).map((_, index) => {
          const pageNum = index + 1;
          const isActive = pageNum === currentPage;
          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-black text-white shadow-xs font-semibold"
                  : "border border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
