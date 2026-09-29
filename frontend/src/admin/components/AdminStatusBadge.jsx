export default function AdminStatusBadge({
  active,
  size = "sm",
  className = "",
}) {
  // Support boolean, string "Active"/"Inactive", or null/undefined (default active)
  const isActive =
    typeof active === "boolean"
      ? active
      : typeof active === "string"
      ? active.trim().toLowerCase() === "active"
      : active !== undefined && active !== null
      ? Boolean(active)
      : true;

  const sizeClasses =
    {
      xs: "px-2 py-0.5 text-[10px]",
      sm: "px-2.5 py-0.5 text-[11px]",
      md: "px-3 py-1 text-xs",
    }[size] || "px-2.5 py-0.5 text-[11px]";

  if (isActive) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wider uppercase transition-colors whitespace-nowrap bg-[#EBF3EC] text-[#2E683E] border-[#CDE3D2] ${sizeClasses} ${className}`}
        aria-label="Active status"
      >
        <span
          className="w-1.5 h-1.5 rounded-full bg-[#2E683E] shrink-0"
          aria-hidden="true"
        />
        <span>ACTIVE</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wider uppercase transition-colors whitespace-nowrap bg-[#F2EFE9] text-[#6E685F] border-[#DFDAD0] ${sizeClasses} ${className}`}
      aria-label="Inactive status"
    >
      <span
        className="w-1.5 h-1.5 rounded-full border border-[#8C8479] bg-transparent shrink-0"
        aria-hidden="true"
      />
      <span>INACTIVE</span>
    </span>
  );
}

export function AdminStatusButton({
  active,
  onClick,
  disabled = false,
  className = "",
}) {
  const isActive =
    typeof active === "boolean"
      ? active
      : typeof active === "string"
      ? active.trim().toLowerCase() === "active"
      : active !== undefined && active !== null
      ? Boolean(active)
      : true;

  const nextActionText = isActive ? "Set Inactive" : "Set Active";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`text-xs font-semibold text-[#6F6A62] hover:text-[#1C1B19] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${className}`}
    >
      {nextActionText}
    </button>
  );
}
