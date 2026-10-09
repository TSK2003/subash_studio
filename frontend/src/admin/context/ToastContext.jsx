import { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((firstArg, secondArg = "success", durationArg = 4000) => {
    let message = "";
    let type = "info";
    let duration = 4000;

    if (typeof firstArg === "string" || typeof firstArg === "number") {
      message = String(firstArg).trim();
      type = typeof secondArg === "string" ? secondArg : "success";
      duration = typeof durationArg === "number" ? durationArg : 4000;
    } else if (firstArg instanceof Error) {
      message = firstArg.message || "An unexpected error occurred.";
      type = typeof secondArg === "string" && secondArg !== "success" ? secondArg : "error";
      duration = typeof durationArg === "number" ? durationArg : 5000;
    } else if (typeof firstArg === "object" && firstArg !== null) {
      // Structured payload: { message, type, duration, error, ... }
      type = firstArg.type || (firstArg.error ? "error" : "success");
      duration = typeof firstArg.duration === "number" ? firstArg.duration : 4000;

      if (typeof firstArg.message === "string") {
        message = firstArg.message.trim();
      } else if (typeof firstArg.text === "string") {
        message = firstArg.text.trim();
      } else if (typeof firstArg.title === "string") {
        message = firstArg.title.trim();
      } else if (firstArg.error && typeof firstArg.error === "string") {
        message = firstArg.error.trim();
      } else if (firstArg.error?.message && typeof firstArg.error.message === "string") {
        message = firstArg.error.message.trim();
      } else {
        message = type === "error" ? "An error occurred. Please try again." : "Operation completed successfully.";
      }
    } else {
      message = "Notification";
      type = "info";
    }

    // Safety fallback: ensure message is strictly a non-empty string
    if (!message || typeof message !== "string") {
      message = type === "error" ? "An unexpected error occurred." : "Operation completed.";
    }

    // Normalize type to supported styles
    const validTypes = ["success", "error", "warning", "info"];
    if (!validTypes.includes(type)) {
      type = type === "danger" ? "error" : "info";
    }

    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100000] flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-lg border backdrop-blur-md transition-all ${
                toast.type === "success"
                  ? "bg-white border-emerald-200 text-gray-900"
                  : toast.type === "error"
                  ? "bg-white border-red-200 text-gray-900"
                  : toast.type === "warning"
                  ? "bg-white border-amber-200 text-gray-900"
                  : "bg-white border-gray-200 text-gray-900"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {toast.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {toast.type === "error" && <AlertCircle className="w-4 h-4 text-red-600" />}
                {toast.type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                {toast.type === "info" && <Info className="w-4 h-4 text-blue-600" />}
              </div>
              <div className="flex-1 text-xs font-medium leading-relaxed">
                {typeof toast.message === "string" ? toast.message : String(toast.message || "")}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 text-gray-400 hover:text-gray-700 rounded-lg transition-colors"
                aria-label="Dismiss toast"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
