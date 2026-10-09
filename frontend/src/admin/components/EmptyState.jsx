import { Camera, Plus } from "lucide-react";

export default function EmptyState({
  icon: Icon = Camera,
  title = "No records found",
  description = "Get started by adding your first record.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-10 text-center rounded-xl bg-[#EEF1F5] border border-[#C9D1DC] my-4 shadow-xs">
      <div className="w-12 h-12 rounded-xl bg-[#E7EBF0] border border-[#C9D1DC] flex items-center justify-center text-[#475569] mb-3.5">
        <Icon className="w-6 h-6 stroke-[1.5]" />
      </div>
      <h4 className="text-base font-bold text-[#111827] mb-1">
        {title}
      </h4>
      <p className="text-xs text-[#475569] max-w-sm mb-4 leading-relaxed">
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
