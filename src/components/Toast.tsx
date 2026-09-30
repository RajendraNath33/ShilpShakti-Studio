import { useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  toast: { message: string; type: 'info' | 'error' | 'success' } | null;
  onDismiss: () => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const styles = {
    info: 'bg-dusk-800 text-white dark:bg-dusk-700',
    success: 'bg-success-600 text-white',
    error: 'bg-error-600 text-white',
  };

  const icons = {
    info: Info,
    success: CheckCircle2,
    error: AlertCircle,
  };

  const Icon = icons[toast.type];

  return (
    <div className="fixed bottom-20 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 animate-slide-up md:bottom-6">
      <div className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-2xl ${styles[toast.type]}`}>
        <Icon className="h-5 w-5 shrink-0" />
        <p className="flex-1 text-sm font-medium">{toast.message}</p>
        <button onClick={onDismiss} className="shrink-0 opacity-70 transition hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
