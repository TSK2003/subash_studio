import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Tag, SlidersHorizontal, Loader2 } from "lucide-react";
import AdminStatusBadge, { AdminStatusButton } from "./AdminStatusBadge";
import { useToast } from "../context/ToastContext";

/**
 * Add Category Modal
 */
export function AddCategoryModal({
  isOpen,
  onClose,
  title = "Add Portfolio Category",
  existingCategories = [],
  onAdd,
}) {
  const { addToast } = useToast();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setError("");
      setSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !submitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, submitting]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setError("Category name is required.");
      return;
    }

    // Case-insensitive duplicate check
    const isDuplicate = existingCategories.some((c) => {
      const catName = typeof c === "string" ? c : c?.name || "";
      return catName.trim().toLowerCase() === trimmed.toLowerCase();
    });

    if (isDuplicate) {
      setError("This category already exists.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await onAdd(trimmed);
      addToast(`Category "${trimmed}" created successfully.`, "success");
      setName("");
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        "Failed to create category. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return typeof document !== "undefined" &&
    createPortal(
      <AnimatePresence>
        {isOpen && (
          <div
            className="admin-portal fixed inset-0 z-[99990] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-hidden font-body"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !submitting && onClose()}
              className="fixed inset-0"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 0 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 0 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-modal="true"
              className="relative w-full max-w-md bg-[#EEF1F5] rounded-2xl shadow-xl border border-[#C9D1DC] z-10 overflow-hidden flex flex-col max-h-[calc(100dvh-48px)] sm:max-h-[calc(100dvh-64px)] my-auto"
              onClick={(e) => e.stopPropagation()}
            >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#C9D1DC] bg-[#E7EBF0] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#E5EAF1] border border-[#CAD3DF] flex items-center justify-center text-[#334155] shrink-0">
                <Tag className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#111827]">
                  {title}
                </h3>
                <p className="text-xs text-[#475569]">
                  New category will be active and available immediately.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="p-1.5 text-[#475569] hover:text-[#111827] hover:bg-[#DFE5EC] rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="p-6 space-y-4 flex-1 overflow-y-auto modal-scrollbar">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#334155]">
                  Category Name *
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="e.g. Destination Wedding"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError("");
                  }}
                  className={`w-full p-2.5 bg-white border rounded-xl text-xs text-[#111827] placeholder:text-[#64748B] focus:outline-none transition-colors ${
                    error
                      ? "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                      : "border-[#C9D1DC] focus:border-[#111827]"
                  }`}
                />
                {error && (
                  <p className="text-rose-600 text-xs font-medium mt-1">
                    {error}
                  </p>
                )}
                <p className="text-[11px] text-[#475569] leading-relaxed">
                  Enter a unique category name. Duplicates are rejected case-insensitively.
                </p>
              </div>
            </div>

            {/* Pinned Footer */}
            <div className="px-6 py-4 bg-[#E7EBF0] border-t border-[#C9D1DC] flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 rounded-lg border border-[#C9D1DC] text-[#334155] hover:bg-[#DFE5EC] text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !name.trim()}
                className="inline-flex items-center gap-2 px-5 py-2 bg-black text-white hover:bg-gray-800 rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Category</span>
                  </>
                )}
              </button>
            </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    );
}

/**
 * Manage Categories Modal
 * Displays Category Name | Count | Status | Action
 * NO DELETE FUNCTIONALITY PER SPEC
 */
export function ManageCategoriesModal({
  isOpen,
  onClose,
  title = "Manage Categories",
  categories = [],
  items = [],
  onToggleStatus,
  onOpenAdd,
}) {
  const { addToast } = useToast();
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleToggle = async (cat) => {
    setTogglingId(cat.id);
    try {
      const updated = await onToggleStatus(cat.id);
      const isNowActive = updated ? Boolean(updated.active) : !cat.active;
      addToast(
        `Category "${cat.name}" is now ${isNowActive ? "Active" : "Inactive"}.`,
        "success"
      );
    } catch (err) {
      addToast(
        err.response?.data?.error || err.message || "Failed to update category status.",
        "error"
      );
    } finally {
      setTogglingId(null);
    }
  };

  // Compute live count for each category
  const getCategoryCount = (categoryName) => {
    if (!categoryName) return 0;
    const lower = categoryName.trim().toLowerCase();
    return items.filter(
      (item) => (item.category || "").trim().toLowerCase() === lower
    ).length;
  };

  const activeCount = categories.filter((c) => c.active).length;
  const inactiveCount = categories.filter((c) => !c.active).length;

  return typeof document !== "undefined" &&
    createPortal(
      <AnimatePresence>
        {isOpen && (
          <div
            className="admin-portal fixed inset-0 z-[99990] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-hidden font-body"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 0 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 0 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-modal="true"
              className="relative w-full max-w-2xl bg-[#EEF1F5] rounded-2xl shadow-xl border border-[#C9D1DC] z-10 overflow-hidden flex flex-col max-h-[calc(100dvh-48px)] sm:max-h-[calc(100dvh-64px)] my-auto"
              onClick={(e) => e.stopPropagation()}
            >
          {/* Fixed Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#C9D1DC] bg-[#E7EBF0] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#E5EAF1] border border-[#CAD3DF] flex items-center justify-center text-[#334155] shrink-0">
                <SlidersHorizontal className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#111827]">
                  {title}
                </h3>
                <p className="text-xs text-[#475569]">
                  {categories.length} total categories ({activeCount} active, {inactiveCount} inactive)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdd();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#111827] text-white hover:bg-black rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-[#475569] hover:text-[#111827] hover:bg-[#DFE5EC] rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Table / List */}
          <div className="overflow-y-auto flex-1 p-6 modal-scrollbar">
            {categories.length === 0 ? (
              <div className="text-center py-10 text-xs text-[#475569]">
                No categories found. Click &quot;Add Category&quot; to create one.
              </div>
            ) : (
              <div className="border border-[#C9D1DC] rounded-xl overflow-hidden bg-[#EEF1F5] shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#E7EBF0] border-b border-[#C9D1DC] text-[#475569] uppercase tracking-wider text-[10px] font-bold">
                      <th className="py-3 px-4">Category Name</th>
                      <th className="py-3 px-4 text-center">Items</th>
                      <th className="py-3 px-4 text-center">Current Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C9D1DC]">
                    {categories.map((cat) => {
                      const count = getCategoryCount(cat.name);
                      const isToggling = togglingId === cat.id;

                      return (
                        <tr
                          key={cat.id || cat.name}
                          className="hover:bg-gray-50/60 transition-colors"
                        >
                          {/* Name */}
                          <td className="py-3 px-4 font-semibold text-gray-900">
                            <div className="flex items-center gap-2">
                              <span>{cat.name}</span>
                              {!cat.active && (
                                <span className="text-[10px] font-normal text-gray-400 italic">
                                  (Hidden from filters)
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Items Count */}
                          <td className="py-3 px-4 text-center">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-semibold text-[11px]">
                              {count}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4 text-center">
                            <AdminStatusBadge active={cat.active} size="xs" />
                          </td>

                          {/* Action Button */}
                          <td className="py-3 px-4 text-right">
                            <AdminStatusButton
                              active={cat.active}
                              onClick={() => handleToggle(cat)}
                              disabled={isToggling}
                              className="px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 active:scale-95 transition-all text-xs"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <p className="text-[11px] text-gray-500 mt-4 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-200">
              <strong className="text-gray-700">Note on Deletion:</strong> Categories cannot be permanently deleted to preserve historical integrity and existing portfolio/gallery stories. Inactive categories are hidden from the public and creation dropdowns, but remain safe here for reactivation at any time.
            </p>
          </div>

          {/* Fixed Footer */}
          <div className="px-6 py-3.5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between shrink-0">
            <span className="text-[11px] text-gray-400">
              Changes update immediately in PostgreSQL.
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 text-xs font-semibold shadow-xs transition-all"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>,
  document.body
);
}
