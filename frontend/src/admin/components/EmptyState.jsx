import { Camera, Plus } from "lucide-react";

export default function EmptyState({
  icon: Icon = Camera,
  title = "No records found",
  description = "Get started by adding your first record.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-10 text-center rounded-xl bg-white border border-gray-200 my-4 shadow-xs">
      <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 mb-3.5">
        <Icon className="w-6 h-6 stroke-[1.5]" />
      </div>
      <h4 className="text-base font-bold text-gray-900 mb-1">
        {title}
      </h4>
      <p className="text-xs text-gray-500 max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#111827] text-white hover:bg-black text-xs font-semibold rounded-lg transition-all shadow-xs active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
