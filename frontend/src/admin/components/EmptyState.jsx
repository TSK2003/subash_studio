import { Camera, Plus } from "lucide-react";

export default function EmptyState({
  icon: Icon = Camera,
  title = "No records found",
  description = "Get started by adding your first record.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center rounded-xl bg-white border border-[#E7E0D2] my-4 shadow-sm">
      <div className="w-12 h-12 rounded-xl bg-[#F8F6F2] border border-[#E7E0D2] flex items-center justify-center text-[#9C7B3D] mb-3.5">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-lg font-display font-semibold text-[#2B2B2B] mb-1">
        {title}
      </h4>
      <p className="text-sm text-[#6F6A62] max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2B2B2B] text-white hover:bg-[#1C1B19] text-xs font-medium rounded-lg transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4 text-[#E4D3A6]" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
