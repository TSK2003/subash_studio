export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendPositive = true,
  description,
  accent: _accent = "blue",
  onClick,
}) {
  // Uniform neutral badge palette matching approved reference design
  const badgeClasses =
    "w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-[#CAD3DF] bg-[#E5EAF1] text-[#334155] flex items-center justify-center shrink-0";

  return (
    <div
      onClick={onClick}
      className={`bg-[#EEF1F5] rounded-xl border border-[#C9D1DC] p-3 sm:p-3.5 shadow-xs hover:border-[#B5BFCF] hover:shadow-sm transition-all min-w-0 flex items-start gap-3 ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      {/* Compact rounded-square icon badge on the left */}
      {Icon && (
        <div className={badgeClasses}>
          <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 stroke-[1.75]" />
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
