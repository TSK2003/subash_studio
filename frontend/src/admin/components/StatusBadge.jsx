export default function StatusBadge({ status, size = "md" }) {
  const normalized = (status || "").toLowerCase().replace(/[_-]/g, " ");

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] font-semibold",
    md: "px-2.5 py-0.5 text-xs font-semibold",
    lg: "px-3 py-1 text-xs font-semibold",
  }[size] || "px-2.5 py-0.5 text-xs font-semibold";

  let styles = "bg-gray-100 text-gray-700 border-gray-200";

  switch (normalized) {
    case "new":
      styles = "bg-amber-50 text-amber-700 border-amber-200/80";
      break;
    case "contacted":
      styles = "bg-sky-50 text-sky-700 border-sky-200";
      break;
    case "confirmed":
      styles = "bg-blue-50 text-blue-700 border-blue-200";
      break;
    case "in progress":
      styles = "bg-purple-50 text-purple-700 border-purple-200";
      break;
    case "completed":
    case "active":
    case "published":
    case "approved":
      styles = "bg-emerald-50 text-emerald-700 border-emerald-200";
      break;
    case "cancelled":
    case "closed":
      styles = "bg-rose-50 text-rose-700 border-rose-200";
      break;
    case "inactive":
      styles = "bg-gray-100 text-gray-500 border-gray-200";
      break;
    case "read":
    case "draft":
      styles = "bg-slate-100 text-slate-600 border-slate-200";
      break;
    default:
      styles = "bg-gray-100 text-gray-700 border-gray-200";
  }

  const displayLabel =
    normalized === "in progress"
      ? "In Progress"
      : typeof status === "string" && status.includes("_")
      ? status
          .split("_")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(" ")
      : typeof status === "string" && status === status.toUpperCase() && status.length > 3
      ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
      : status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses} ${styles} transition-colors tracking-wide`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0" />
      {displayLabel}
    </span>
  );
}
