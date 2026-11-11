import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = { success: CheckCircle2, error: XCircle, info: Info };
const TONES = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-900',
  error: 'border-red-200 bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200 dark:border-red-900',
  info: 'border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-900',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((toast) => toast.id !== id)), 4000);
  }, []);

  const dismiss = (id) => setToasts((t) => t.filter((toast) => toast.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <div key={t.id} className={`flex items-start gap-2 rounded-lg border px-4 py-3 shadow-lg text-sm ${TONES[t.type]}`}>
              <Icon className="h-4 w-4 mt-0.5 shrink-0" />
              <span className="flex-1">{t.message}</span>
              <button onClick={() => dismiss(t.id)}>
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
