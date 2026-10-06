import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  message = "Enter your admin password to permanently delete this record.",
  confirmText = "Delete",
  cancelText = "Cancel",
  isDestructive = true,
  isLoading = false,
  requirePassword = false,
  itemDetails = "",
}) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isSubmitting && !isLoading) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setShowPassword(false);
      setError("");
      setIsSubmitting(false);
      if (requirePassword) {
        const timer = setTimeout(() => {
          passwordInputRef.current?.focus();
        }, 80);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, requirePassword]);

  const handleClose = () => {
    if (isSubmitting || isLoading) return;
    setPassword("");
    setError("");
    setShowPassword(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting || isLoading) return;

    if (requirePassword) {
      if (!password || !password.trim()) {
        setError("Admin password is required.");
        passwordInputRef.current?.focus();
        return;
      }
    }

    setIsSubmitting(true);
    setError("");

    try {
      await onConfirm(password);
    } catch (err) {
      const errMsg = err?.message || "Incorrect admin password.";
      setError(errMsg);
      setPassword("");
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 50);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const busy = isSubmitting || isLoading;

  return typeof document !== "undefined" &&
    createPortal(
      <AnimatePresence>
        <div
          className="fixed inset-0 z-[99990] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0"
          />

          {/* Modal Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            className="relative w-full max-w-md bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#E7E0D2] z-10 max-h-[calc(100dvh-48px)] sm:max-h-[calc(100dvh-64px)] my-auto overflow-y-auto modal-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
          <button
            type="button"
            onClick={handleClose}
            disabled={busy}
            className="absolute top-4 right-4 p-1.5 text-[#6F6A62] hover:text-[#2B2B2B] hover:bg-[#F8F6F2] rounded-lg transition-colors disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <form onSubmit={handleSubmit}>
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-xl shrink-0 ${
                  isDestructive
                    ? "bg-rose-50 text-rose-600 border border-rose-100"
                    : "bg-[#F4EFE6] text-[#9C7B3D] border border-[#E4D3A6]"
                }`}
              >
                {isDestructive ? (
                  <Trash2 className="w-6 h-6" />
                ) : (
                  <AlertTriangle className="w-6 h-6" />
                )}
              </div>

              <div className="space-y-1.5 flex-1 pr-4">
                <h3
                  id="confirm-modal-title"
                  className="text-lg font-display font-semibold text-[#2B2B2B]"
                >
                  {title}
                </h3>
                <p className="text-sm text-[#6F6A62] leading-relaxed">
                  {message}
                </p>

                {itemDetails && (
                  <div className="mt-2.5 px-3 py-1.5 bg-[#F8F6F2] rounded-lg border border-[#E7E0D2] text-[11px] text-[#6F6A62]">
                    <span className="font-semibold text-[#2B2B2B]">Target: </span>
                    <span className="font-mono text-rose-600">{itemDetails}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Password Verification Field */}
            {requirePassword && (
              <div className="mt-5 space-y-1.5">
                <label
                  htmlFor="admin-modal-password"
                  className="block text-xs font-semibold text-[#6F6A62]"
                >
                  Admin Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    ref={passwordInputRef}
                    id="admin-modal-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Enter your admin password"
                    autoComplete="current-password"
                    disabled={busy}
                    className={`w-full pl-3 pr-10 py-2.5 bg-[#F8F6F2] border ${
                      error
                        ? "border-rose-400 focus:border-rose-500"
                        : "border-[#E7E0D2] focus:border-[#C9A669]"
                    } rounded-xl text-xs text-[#2B2B2B] placeholder:text-[#8E867B] focus:outline-none transition-colors`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    disabled={busy}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E867B] hover:text-[#2B2B2B] transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {error && (
                  <p className="text-rose-600 text-xs mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                  </p>
                )}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#E7E0D2]">
              <button
                type="button"
                onClick={handleClose}
                disabled={busy}
                className="px-4 py-2 text-sm font-medium text-[#6F6A62] hover:text-[#2B2B2B] hover:bg-[#F8F6F2] rounded-xl transition-colors disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                type="submit"
                disabled={busy || (requirePassword && !password.trim())}
                className={`px-5 py-2 text-sm font-medium text-white rounded-xl transition-all shadow-sm flex items-center gap-2 ${
                  isDestructive
                    ? "bg-rose-600 hover:bg-rose-700 active:bg-rose-800"
                    : "bg-[#2B2B2B] hover:bg-[#1C1B19] active:bg-black"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {busy && (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                )}
                <span>{confirmText}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
