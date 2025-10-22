import { toast as sonnerToast } from 'sonner';

/**
 * Toast wrapper utility for Sonner
 * Provides a consistent API similar to react-toastify
 */
export const toast = Object.assign(
  // Default toast function
  (message, options = {}) => sonnerToast(message, options),
  {
    success: (message, options = {}) => sonnerToast.success(message, options),
    error: (message, options = {}) => sonnerToast.error(message, options),
    info: (message, options = {}) => sonnerToast.info(message, options),
    warning: (message, options = {}) => sonnerToast.warning(message, options),
    loading: (message, options = {}) => sonnerToast.loading(message, options),
    promise: (promise, options = {}) => sonnerToast.promise(promise, options),
    dismiss: (toastId) => sonnerToast.dismiss(toastId),
  }
);

