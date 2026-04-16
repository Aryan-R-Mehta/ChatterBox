"use client";

import { createContext, useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { CircleAlert, CircleCheck, TriangleAlert, X } from "lucide-react";
import { midnightHex } from "@/constants/colors";

const ToastContext = createContext();

const toastUi = {
  success: { icon: <CircleCheck size={18} />, color: midnightHex.success },
  error: { icon: <CircleAlert size={18} />, color: midnightHex.danger },
  warning: { icon: <TriangleAlert size={18} />, color: midnightHex.warning },
};

let externalShowToast = null;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type, message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  externalShowToast = showToast;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 w-[min(92vw,360px)]">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} {...toast} onClose={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ id, type, message, onClose }) {
  const ui = toastUi[type] || toastUi.success;
  const controls = useAnimation();
  const duration = 3.5;
  const timerRef = useRef(null);

  const startTimer = () => {
    controls.start({
      width: "0%",
      transition: { duration, ease: "linear" },
    });

    timerRef.current = setTimeout(() => {
      onClose(id);
    }, duration * 1000);
  };

  const resetTimer = () => {
    controls.stop();
    clearTimeout(timerRef.current);

    controls.set({ width: "100%" });
    startTimer();
  };

  const pauseTimer = () => {
    controls.stop();
    clearTimeout(timerRef.current);
  };

  useEffect(() => {
    startTimer();
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      drag="x"
      dragConstraints={{ left: 0, right: 100 }}
      onDragEnd={(e, info) => {
        if (info.offset.x > 80) onClose(id);
      }}
      onMouseEnter={pauseTimer}
      onMouseLeave={resetTimer}
      className="relative overflow-hidden rounded-xl border shadow-2xl backdrop-blur-md"
      style={{
        borderColor: ui.color,
        backgroundColor: midnightHex.elevated,
        color: midnightHex.text,
      }}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <span style={{ color: ui.color }} className="mt-[2px] shrink-0">
          {ui.icon}
        </span>

        <p className="flex-1 text-sm leading-relaxed">{message}</p>

        <button
          onClick={() => onClose(id)}
          className="opacity-60 hover:opacity-100 transition"
        >
          <X size={16} />
        </button>
      </div>

      <motion.div
        initial={{ width: "100%" }}
        animate={controls}
        className="absolute bottom-0 left-0 h-[2px]"
        style={{ backgroundColor: ui.color }}
      />
    </motion.div>
  );
}

export function showAppToast(type, message) {
  if (!externalShowToast || !message) return;

  const normalizedType = type === "warnign" ? "warning" : type;
  externalShowToast(normalizedType, message);
}
