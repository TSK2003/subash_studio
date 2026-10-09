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
    blue: "bg-blue-50 text-blue-600 border-blue-100/60",
    lavender: "bg-purple-50 text-purple-600 border-purple-100/60",
    purple: "bg-purple-50 text-purple-600 border-purple-100/60",
    violet: "bg-violet-50 text-violet-600 border-violet-100/60",
    amber: "bg-amber-50 text-amber-600 border-amber-100/60",
    gold: "bg-amber-50 text-amber-600 border-amber-100/60",
    coral: "bg-rose-50 text-rose-600 border-rose-100/60",
    rose: "bg-rose-50 text-rose-600 border-rose-100/60",
    mint: "bg-emerald-50 text-emerald-600 border-emerald-100/60",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100/60",
    neutral: "bg-gray-100 text-gray-600 border-gray-200/60",
  }[accent] || "bg-blue-50 text-blue-600 border-blue-100/60";

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-200/90 p-3.5 sm:p-4 shadow-xs hover:border-gray-300 hover:shadow-sm transition-all min-w-0 flex flex-col justify-between ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {Icon && (
          <div className={`p-1.5 sm:p-2 rounded-lg border ${pastelStyles} shrink-0`}>
            <Icon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </div>
        )}
        <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400 truncate">
          {title}
        </p>
      </div>

      <div className="mt-2.5 sm:mt-3">
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 leading-none">
          {value}
        </h3>
        {(trend || description) && (
          <p className="text-[11px] mt-1.5 truncate">
            {trend ? (
              <span className={trendPositive ? "text-emerald-600 font-semibold" : "text-gray-500 font-medium"}>
                {trend}
              </span>
            ) : (
              <span className="text-gray-400 font-normal">{description}</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
