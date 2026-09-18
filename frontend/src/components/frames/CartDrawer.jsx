import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Trash2,
  Edit3,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ImageIcon,
} from "lucide-react";
import { formatRupee } from "../../lib/framePricing";
import { formatRatioDisplayLabel } from "../../lib/frameDimensions";

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems = [],
  onUpdateQuantity,
  onRemoveItem,
  onEditItem,
  onProceedToCheckout,
  onCustomizeAnother,
}) {
  const totalItemsCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const grandTotal = cartItems.reduce((sum, item) => sum + (item.totalAmount || 0), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 no-print"
          />

          {/* Drawer Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#F8F6F2] text-[#2B2B2B] shadow-2xl z-50 flex flex-col no-print border-l border-[#E7E0D2]"
          >
            {/* Header */}
            <div className="p-5 bg-white border-b border-[#E7E0D2] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#1C1B19] text-[#F8F6F2] flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-[#C9A669]" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-[#1C1B19]">
                    Your Framing Cart
                  </h3>
                  <p className="text-[11px] text-[#6F6A62]">
                    {totalItemsCount} Frame{totalItemsCount !== 1 ? "s" : ""} configured
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#E7E0D2] text-[#1C1B19] flex items-center justify-center hover:bg-[#EFE9DD] transition-colors"
                title="Close Cart"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[#EAE3D2] flex items-center justify-center text-[#8C6D32]">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base text-[#1C1B19]">
                      Your cart is empty
                    </h4>
                    <p className="text-xs text-[#6F6A62] mt-1 max-w-xs">
                      Customise your photograph, timber, and finish on the left, then click &ldquo;Add to Cart&rdquo;.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 bg-[#1C1B19] text-[#F8F6F2] rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#322F2A] transition-all shadow"
                  >
                    Start Customizing
                  </button>
                </div>
              ) : (
                cartItems.map((item, index) => {
                  const displaySize = formatRatioDisplayLabel(
                    item.ratio?.name || item.frameRatio,
                    item.orientation
                  );

                  return (
                    <div
                      key={item.id || index}
                      className="bg-white rounded-2xl p-4 border border-[#E7E0D2] shadow-sm space-y-3 relative group"
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Mini Thumbnail */}
                        <div className="w-16 h-20 rounded-lg overflow-hidden bg-[#24221F] border-2 border-[#DCD3C0] shrink-0 relative flex items-center justify-center">
                          {item.photoUrl ? (
                            <img
                              src={item.photoUrl}
                              alt={item.photoName || "Framed photograph"}
                              className="w-full h-full object-cover pointer-events-none select-none"
                              draggable={false}
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-[#8C6D32] opacity-40" />
                          )}
                          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="font-display font-bold text-sm text-[#1C1B19] truncate">
                              {item.wood?.name || item.woodType}
                            </h4>
                            <span className="font-bold text-xs text-[#8C6D32] shrink-0">
                              {formatRupee(item.totalAmount)}
                            </span>
                          </div>

                          <div className="text-[11px] text-[#6F6A62] space-y-0.5 mt-0.5">
                            <div>Profile: <strong className="text-[#1C1B19]">{item.design?.name || item.frameDesign}</strong></div>
                            <div>
                              Size: <strong className="text-[#1C1B19]">{displaySize}</strong> ({item.orientation})
                            </div>
                            <div className="text-[10px] text-[#8C6D32]">
                              Unit: {formatRupee(item.unitPrice)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions Row */}
                      <div className="pt-2 border-t border-[#E7E0D2]/70 flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 bg-[#FAF8F5] px-2 py-1 rounded-xl border border-[#E7E0D2]">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                            disabled={(item.quantity || 1) <= 1}
                            className="w-5 h-5 rounded-md bg-white border border-[#E7E0D2] flex items-center justify-center hover:bg-[#F0EBE0] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3 h-3 text-[#1C1B19]" />
                          </button>

                          <span className="font-bold text-xs text-[#1C1B19] w-5 text-center">
                            {item.quantity || 1}
                          </span>

                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, Math.min(20, (item.quantity || 1) + 1))}
                            disabled={(item.quantity || 1) >= 20}
                            className="w-5 h-5 rounded-md bg-white border border-[#E7E0D2] flex items-center justify-center hover:bg-[#F0EBE0] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Increase quantity"
                          >
                            <Plus className="w-3 h-3 text-[#1C1B19]" />
                          </button>
                        </div>

                        {/* Edit & Remove */}
                        <div className="flex items-center gap-3 text-xs">
                          <button
                            type="button"
                            onClick={() => onEditItem(item)}
                            className="text-[#8C6D32] hover:text-[#C9A669] font-semibold flex items-center gap-1 transition-colors"
                            title="Edit this customization in the customizer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <span className="text-[#DCD3C0]">&bull;</span>

                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 transition-colors"
                            title="Remove frame from cart"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Summary & CTAs */}
            {cartItems.length > 0 && (
              <div className="p-5 bg-white border-t border-[#E7E0D2] space-y-3.5 shadow-lg">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-[#6F6A62]">
                    <span>Total Frames</span>
                    <span className="font-semibold text-[#1C1B19]">{totalItemsCount}</span>
                  </div>
                  <div className="flex justify-between text-[#6F6A62]">
                    <span>Packaging &amp; Archival Mount</span>
                    <span className="text-emerald-700 font-semibold">Included (Free)</span>
                  </div>
                  <div className="pt-2 border-t border-[#E7E0D2] flex justify-between items-center text-sm font-bold text-[#1C1B19]">
                    <span className="uppercase tracking-wider">Grand Total</span>
                    <span className="text-lg font-display text-[#8C6D32]">{formatRupee(grandTotal)}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={onProceedToCheckout}
                    className="w-full py-3 px-5 bg-gradient-to-r from-[#1C1B19] to-[#322F2A] hover:from-[#C9A669] hover:to-[#9C7B3D] text-[#F8F6F2] hover:text-[#1C1B19] rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Checkout ({formatRupee(grandTotal)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={onCustomizeAnother}
                    className="w-full py-2.5 px-4 bg-[#FAF8F5] hover:bg-[#F0EBE0] text-[#1C1B19] rounded-xl text-xs font-bold tracking-wider uppercase border border-[#E7E0D2] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#8C6D32]" />
                    <span>Customize Another Frame</span>
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
