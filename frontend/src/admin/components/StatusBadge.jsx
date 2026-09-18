export default function StatusBadge({ status, size = "md" }) {
  const normalized = (status || "").toLowerCase();

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-medium",
    md: "px-2.5 py-1 text-xs font-medium",
    lg: "px-3 py-1.5 text-sm font-medium",
  }[size] || "px-2.5 py-1 text-xs font-medium";

  let styles = "bg-neutral-100 text-neutral-700 border-neutral-200";

  switch (normalized) {
    case "new":
      styles = "bg-amber-50/80 text-amber-800 border-amber-200/80";
      break;
    case "contacted":
      styles = "bg-sky-50 text-sky-800 border-sky-200";
      break;
    case "confirmed":
      styles = "bg-[#F4EFE6] text-[#9C7B3D] border-[#E4D3A6]";
      break;
    case "in progress":
      styles = "bg-indigo-50 text-indigo-800 border-indigo-200";
      break;
    case "completed":
    case "active":
    case "published":
    case "approved":
      styles = "bg-emerald-50 text-emerald-800 border-emerald-200";
      break;
    case "cancelled":
    case "inactive":
    case "closed":
      styles = "bg-rose-50 text-rose-700 border-rose-200";
      break;
    case "read":
    case "draft":
      styles = "bg-stone-100 text-stone-700 border-stone-200";
      break;
    default:
      styles = "bg-[#F8F6F2] text-[#2B2B2B] border-[#E7E0D2]";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses} ${styles} transition-colors tracking-wide`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0" />
      {status}
    </span>
  );
}
