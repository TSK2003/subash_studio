export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendPositive = true,
  description,
  accent = "blue",
  onClick,
}) {
  const pastelStyles = {
    blue: "bg-blue-50/90 text-blue-600 border-blue-200/70",
    lavender: "bg-purple-50/90 text-purple-600 border-purple-200/70",
    purple: "bg-purple-50/90 text-purple-600 border-purple-200/70",
    violet: "bg-violet-50/90 text-violet-600 border-violet-200/70",
    amber: "bg-amber-50/90 text-amber-600 border-amber-200/70",
    gold: "bg-amber-50/90 text-amber-600 border-amber-200/70",
    coral: "bg-rose-50/90 text-rose-600 border-rose-200/70",
    rose: "bg-rose-50/90 text-rose-600 border-rose-200/70",
    mint: "bg-emerald-50/90 text-emerald-600 border-emerald-200/70",
    green: "bg-emerald-50/90 text-emerald-600 border-emerald-200/70",
    neutral: "bg-slate-100 text-slate-600 border-slate-200",
  }[accent] || "bg-blue-50/90 text-blue-600 border-blue-200/70";

  return (
    <div
      onClick={onClick}
      className={`bg-[#EEF1F5] rounded-xl border border-[#C9D1DC] p-3 sm:p-3.5 shadow-xs hover:border-[#B5BFCF] hover:shadow-sm transition-all min-w-0 flex items-start gap-3 ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      {/* Compact pastel icon badge on the left */}
      {Icon && (
        <div
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg border flex items-center justify-center shrink-0 ${pastelStyles}`}
        >
          <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
        </div>
      )}

      {/* Title, number, and description aligned in one text column to its right */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {/* Title */}
        <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#475569] truncate leading-tight">
          {title}
        </p>

        {/* Number beneath Title */}
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827] leading-none mt-1">
          {value}
        </h3>

        {/* Description or Trend beneath Number */}
        {(trend || description) && (
          <p className="text-[10px] sm:text-[11px] mt-1 leading-normal truncate">
            {trend ? (
              <span className={trendPositive ? "text-[#047857] font-semibold" : "text-[#475569] font-medium"}>
                {trend}
              </span>
            ) : (
              <span className="text-[#475569] font-medium">{description}</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
