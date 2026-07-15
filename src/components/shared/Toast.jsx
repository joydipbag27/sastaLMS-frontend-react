import React, { useEffect } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

export const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg text-xs font-bold animate-slide-up ${
      type === "success"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : type === "error"
          ? "bg-rose-50 text-rose-700 border-rose-200"
          : "bg-amber-50 text-amber-700 border-amber-200"
    }`}>
      {type === "success" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-current opacity-50 hover:opacity-100">×</button>
    </div>
  );
};

export default Toast;
