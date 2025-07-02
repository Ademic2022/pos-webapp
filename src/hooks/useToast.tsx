import React, { useState, useCallback } from "react";

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
}

export interface UseToastResult {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, "id">) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

/**
 * Custom hook for managing toast notifications
 */
export function useToast(): UseToastResult {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 5000, // Default 5 seconds
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-hide toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, newToast.duration);
    }
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    showToast,
    hideToast,
    clearAllToasts,
  };
}

/**
 * Toast notification component
 */
export const ToastContainer: React.FC<{
  toasts: Toast[];
  hideToast: (id: string) => void;
}> = ({ toasts, hideToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastNotification key={toast.id} toast={toast} onHide={hideToast} />
      ))}
    </div>
  );
};

const ToastNotification: React.FC<{
  toast: Toast;
  onHide: (id: string) => void;
}> = ({ toast, onHide }) => {
  const getToastStyles = () => {
    const baseStyles =
      "px-4 py-3 rounded-lg shadow-lg border-l-4 bg-white max-w-sm";
    switch (toast.type) {
      case "success":
        return `${baseStyles} border-green-500 text-green-800`;
      case "error":
        return `${baseStyles} border-red-500 text-red-800`;
      case "warning":
        return `${baseStyles} border-yellow-500 text-yellow-800`;
      case "info":
        return `${baseStyles} border-blue-500 text-blue-800`;
      default:
        return `${baseStyles} border-gray-500 text-gray-800`;
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "info":
        return "ℹ";
      default:
        return "•";
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2">
          <span className="text-lg font-semibold">{getIcon()}</span>
          <div>
            <h4 className="font-semibold">{toast.title}</h4>
            {toast.message && (
              <p className="text-sm opacity-80 mt-1">{toast.message}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => onHide(toast.id)}
          className="ml-2 text-gray-400 hover:text-gray-600 text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
};
