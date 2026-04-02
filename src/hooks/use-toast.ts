import { useCallback, useState } from "react";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "destructive" | "warning" | "info";
}

let toastId = 0;

function generateId() {
  return `toast-${++toastId}`;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((props: Omit<Toast, "id">) => {
    const id = generateId();
    const newToast: Toast = { id, ...props };

    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);

    return {
      id,
      dismiss: () => setToasts((prev) => prev.filter((t) => t.id !== id)),
    };
  }, []);

  const dismiss = useCallback((id?: string) => {
    if (id) {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    } else {
      setToasts([]);
    }
  }, []);

  return {
    toasts,
    toast,
    dismiss,
  };
}

// Export a simple callable toast function for direct usage
type ToastFunction = (props: {
  title?: string;
  description?: string;
  variant?: string;
}) => void;

function createToastFunction(_variant: string = "default"): ToastFunction {
  return (props) => {
    console.log(`[Toast]`, props);
  };
}

export const toast = Object.assign(
  (props: { title?: string; description?: string; variant?: string }) => {
    console.log("[Toast]", props);
  },
  {
    success: createToastFunction("success"),
    error: createToastFunction("destructive"),
    warning: createToastFunction("warning"),
    info: createToastFunction("info"),
  },
);
