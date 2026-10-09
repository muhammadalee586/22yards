"use client";

import React from 'react';
import { useToastStore, ToastType } from '@/store/useToastStore';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />,
  error: <AlertCircle size={20} className="text-ball-red flex-shrink-0" />,
  warning: <AlertTriangle size={20} className="text-amber-500 flex-shrink-0" />,
  info: <Info size={20} className="text-blue-500 flex-shrink-0" />,
};

const borderStyles: Record<ToastType, string> = {
  success: 'border-emerald-500/30 bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100',
  error: 'border-red-500/30 bg-red-50/90 dark:bg-red-950/40 text-red-950 dark:text-red-100',
  warning: 'border-amber-500/30 bg-amber-50/90 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100',
  info: 'border-blue-500/30 bg-blue-50/90 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-2 sm:px-0">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${borderStyles[t.type]}`}
        >
          <div className="mt-0.5">{icons[t.type]}</div>
          <div className="flex-1 text-sm">
            {t.title && <p className="font-black mb-0.5">{t.title}</p>}
            <p className="font-semibold text-xs leading-relaxed opacity-90">{t.message}</p>
          </div>
          <button
            onClick={() => removeToast(t.id)}
            className="p-1 rounded-lg opacity-60 hover:opacity-100 transition-opacity cursor-pointer text-current"
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
