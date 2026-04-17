"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react";
import { useEffect } from "react";

export type ToastType = "success" | "error" | "info";

interface AdminToastProps {
  show: boolean;
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

export function AdminToast({ show, message, type = "success", onClose, duration = 5000 }: AdminToastProps) {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          className="fixed bottom-8 right-8 z-[100] min-w-[320px] max-w-md"
        >
          <div className={`
            flex items-center gap-4 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl
            ${type === "success" ? "bg-green-500/10 border-green-500/30 text-green-400" : ""}
            ${type === "error" ? "bg-red-500/10 border-red-500/30 text-red-400" : ""}
            ${type === "info" ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : ""}
          `}>
            <div className={`p-2 rounded-xl scale-110 ${
              type === "success" ? "bg-green-500/20 text-green-500" :
              type === "error" ? "bg-red-500/20 text-red-500" :
              "bg-blue-500/20 text-blue-500"
            }`}>
              {type === "success" && <CheckCircle2 className="w-5 h-5" />}
              {type === "error" && <AlertCircle className="w-5 h-5" />}
              {type === "info" && <Info className="w-5 h-5" />}
            </div>

            <div className="flex-1">
              <p className="text-sm font-bold uppercase tracking-tight">
                {type === "success" ? "Sucesso" : type === "error" ? "Erro" : "Aviso"}
              </p>
              <p className="text-xs text-gray-300 font-medium leading-relaxed mt-0.5">
                {message}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1 hover:bg-white/5 rounded-lg transition-colors text-gray-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
