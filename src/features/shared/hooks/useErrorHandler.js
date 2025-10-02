import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { handleApiError, ERROR_TYPES, AppError } from '../lib/handleApiError';

/**
 * Custom hook for handling errors in React components
 */
export const useErrorHandler = (options = {}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const {
    redirectOnAuth = true,
    showToast = true,
    logErrors = true,
    onError = null,
  } = options;

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Clear specific field error
   */
  const clearFieldError = useCallback(fieldName => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  /**
   * Set field error manually
   */
  const setFieldError = useCallback((fieldName, message) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: message,
    }));
  }, []);

  /**
   * Handle authentication errors
   */
  const handleAuthError = useCallback(
    error => {
      if (redirectOnAuth) {
        logout();
        navigate('/login', {
          state: {
            message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
            from: window.location.pathname,
          },
        });
      }
    },
    [logout, navigate, redirectOnAuth]
  );

  /**
   * Handle validation errors
   */
  const handleValidationError = useCallback(error => {
    if (error.details?.validationErrors) {
      setErrors(error.details.validationErrors);
    }
  }, []);

  /**
   * Main error handler
   */
  const handleError = useCallback(
    (error, customOptions = {}) => {
      const errorOptions = {
        showToast,
        logError: logErrors,
        onAuthError: handleAuthError,
        onValidationError: handleValidationError,
        ...customOptions,
      };

      const appError = handleApiError(error, errorOptions);

      // Call custom error handler if provided
      if (onError) {
        onError(appError);
      }

      return appError;
    },
    [showToast, logErrors, handleAuthError, handleValidationError, onError]
  );

  /**
   * Wrapper for async operations with error handling
   */
  const withErrorHandling = useCallback(
    async (asyncFn, options = {}) => {
      const {
        clearErrorsOnStart = true,
        setLoadingState = true,
        customErrorMessage = null,
        retries = 0,
        retryDelay = 1000,
      } = options;

      if (clearErrorsOnStart) {
        clearErrors();
      }

      if (setLoadingState) {
        setIsLoading(true);
      }

      try {
        let lastError;

        // Retry logic
        for (let attempt = 0; attempt <= retries; attempt++) {
          try {
            const result = await asyncFn();

            if (setLoadingState) {
              setIsLoading(false);
            }

            return result;
          } catch (error) {
            lastError = error;

            // Don't retry on client errors (4xx)
            if (error.status >= 400 && error.status < 500) {
              break;
            }

            // If this isn't the last attempt, wait before retrying
            if (attempt < retries) {
              await new Promise(resolve =>
                setTimeout(resolve, retryDelay * (attempt + 1))
              );
              continue;
            }
          }
        }

        // If we get here, all attempts failed
        throw lastError;
      } catch (error) {
        if (setLoadingState) {
          setIsLoading(false);
        }

        const appError = handleError(error, {
          customMessage: customErrorMessage,
        });

        throw appError;
      }
    },
    [clearErrors, handleError]
  );

  /**
   * Handle form submission with error handling
   */
  const handleFormSubmit = useCallback(
    async (submitFn, options = {}) => {
      return withErrorHandling(submitFn, {
        clearErrorsOnStart: true,
        setLoadingState: true,
        ...options,
      });
    },
    [withErrorHandling]
  );

  /**
   * Check if there are any errors
   */
  const hasErrors = Object.keys(errors).length > 0;

  /**
   * Get error message for a specific field
   */
  const getFieldError = useCallback(
    fieldName => {
      return errors[fieldName] || null;
    },
    [errors]
  );

  /**
   * Check if a specific field has an error
   */
  const hasFieldError = useCallback(
    fieldName => {
      return Boolean(errors[fieldName]);
    },
    [errors]
  );

  /**
   * Get all error messages as an array
   */
  const getErrorMessages = useCallback(() => {
    return Object.values(errors).filter(Boolean);
  }, [errors]);

  /**
   * Create error boundary handler
   */
  const createErrorBoundary = useCallback(
    fallbackComponent => {
      return class ErrorBoundary extends React.Component {
        constructor(props) {
          super(props);
          this.state = { hasError: false, error: null };
        }

        static getDerivedStateFromError(error) {
          return { hasError: true, error };
        }

        componentDidCatch(error, errorInfo) {
          handleError(
            new AppError(error.message, ERROR_TYPES.UNKNOWN, 0, {
              originalError: error,
              errorInfo,
            })
          );
        }

        render() {
          if (this.state.hasError) {
            return (
              fallbackComponent ||
              React.createElement('div', null, 'Something went wrong.')
            );
          }

          return this.props.children;
        }
      };
    },
    [handleError]
  );

  return {
    // Error state
    errors,
    hasErrors,
    isLoading,

    // Error handlers
    handleError,
    withErrorHandling,
    handleFormSubmit,

    // Error management
    clearErrors,
    clearFieldError,
    setFieldError,
    getFieldError,
    hasFieldError,
    getErrorMessages,

    // Utilities
    createErrorBoundary,
  };
};

export default useErrorHandler;
