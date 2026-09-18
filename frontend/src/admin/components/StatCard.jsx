import { motion } from "framer-motion";

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendPositive = true,
  description,
  accent = "gold",
  onClick,
}) {
  const accentStyles = {
    gold: "bg-[#FDFBF7] border-[#E7E0D2] text-[#9C7B3D]",
    dark: "bg-[#242320] text-[#F8F6F2] border-[#383632]",
    neutral: "bg-white border-[#E7E0D2] text-[#2B2B2B]",
  }[accent] || "bg-white border-[#E7E0D2] text-[#2B2B2B]";

  const iconBg = {
    gold: "bg-[#F4EFE6] text-[#9C7B3D]",
    dark: "bg-[#33312D] text-[#E4D3A6]",
    neutral: "bg-[#F8F6F2] text-[#2B2B2B]",
  }[accent] || "bg-[#F8F6F2] text-[#2B2B2B]";

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`p-3.5 sm:p-4 rounded-xl border ${accentStyles} shadow-sm transition-all duration-200 min-w-0 ${
        onClick ? "cursor-pointer hover:border-[#C9A669]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className="space-y-0.5 min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[#6F6A62] truncate">
            {title}
          </p>
          <h3 className="text-xl sm:text-2xl font-display font-semibold tracking-tight text-[#2B2B2B]">
            {value}
          </h3>
        </div>
        {Icon && (
          <div className={`p-2 sm:p-2.5 rounded-lg ${iconBg} shrink-0`}>
            <Icon className="w-4 sm:w-4.5 h-4 sm:h-4.5" />
          </div>
        )}
      </div>

      {(trend || description) && (
        <div className="mt-3 pt-3 border-t border-[#E7E0D2]/60 flex items-center justify-between text-xs gap-2 min-w-0">
          {trend && (
            <span
              className={`inline-flex items-center font-medium ${
                trendPositive ? "text-emerald-700" : "text-stone-600"
              }`}
            >
              {trend}
            </span>
          )}
          {description && (
            <span className="text-[#6F6A62] truncate">{description}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}
