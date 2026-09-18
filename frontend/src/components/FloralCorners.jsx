import { BotanicalBranch, BotanicalCorner } from "./BotanicalDecoration";

export default function FloralCorners() {
  return (
    <>
      {/* Top-left corner subtle botanical line art */}
      <div className="absolute -top-4 -left-6 pointer-events-none select-none hidden sm:block">
        <BotanicalBranch className="w-56 h-56 lg:w-64 lg:h-64" rotate={10} />
      </div>

      {/* Lower-left subtle botanical curve decoration */}
      <div className="absolute -bottom-8 -left-6 pointer-events-none select-none hidden md:block">
        <BotanicalCorner className="w-48 h-48 lg:w-56 lg:h-56" flip rotate={-15} />
      </div>
    </>
  );
}
