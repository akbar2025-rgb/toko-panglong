"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastTone = "success" | "error" | "info";

type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);

    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, tone: ToastTone = "success") => {
      const id = Date.now() + Math.random();

      setToasts((current) => [...current.slice(-2), { id, message, tone }]);

      const timer = setTimeout(() => dismiss(id), 5000);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      activeTimers.forEach((timer) => clearTimeout(timer));
      activeTimers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[90] flex flex-col items-end gap-2 sm:left-auto sm:max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex w-full items-start justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-xl shadow-ink/20 ${
              toast.tone === "success"
                ? "bg-moss text-surface"
                : toast.tone === "error"
                  ? "bg-danger text-surface"
                  : "bg-ink text-surface"
            }`}
          >
            <p className="py-2.5 leading-relaxed">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Tutup notifikasi"
              className="inline-flex h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-current opacity-80 transition-opacity hover:opacity-100"
            >
              <CloseIcon />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast harus dipakai di dalam ToastProvider.");
  }

  return context;
}
