import { toast } from 'react-toastify';

/**
 * Error types that can occur in the application
 */
export const ERROR_TYPES = {
  VALIDATION: 'VALIDATION',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN',
};

/**
 * HTTP status codes mapping to error types
 */
const STATUS_TO_ERROR_TYPE = {
  400: ERROR_TYPES.VALIDATION,
  401: ERROR_TYPES.AUTHENTICATION,
  403: ERROR_TYPES.AUTHORIZATION,
  404: ERROR_TYPES.NOT_FOUND,
  422: ERROR_TYPES.VALIDATION,
  500: ERROR_TYPES.SERVER_ERROR,
  502: ERROR_TYPES.SERVER_ERROR,
  503: ERROR_TYPES.SERVER_ERROR,
  504: ERROR_TYPES.TIMEOUT,
};

/**
 * Default error messages for different error types
 */
const DEFAULT_ERROR_MESSAGES = {
  [ERROR_TYPES.VALIDATION]:
    'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.',
  [ERROR_TYPES.AUTHENTICATION]:
    'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  [ERROR_TYPES.AUTHORIZATION]: 'Bạn không có quyền thực hiện hành động này.',
  [ERROR_TYPES.NOT_FOUND]: 'Không tìm thấy tài nguyên yêu cầu.',
  [ERROR_TYPES.SERVER_ERROR]: 'Lỗi máy chủ. Vui lòng thử lại sau.',
  [ERROR_TYPES.NETWORK_ERROR]:
    'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.',
  [ERROR_TYPES.TIMEOUT]: 'Yêu cầu quá thời gian chờ. Vui lòng thử lại.',
  [ERROR_TYPES.UNKNOWN]: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.',
};

/**
 * Standardized error class for the application
 */
export class AppError extends Error {
  constructor(message, type = ERROR_TYPES.UNKNOWN, status = 0, details = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.status = status;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Check if error is a validation error
   */
  isValidationError() {
    return this.type === ERROR_TYPES.VALIDATION;
  }

  /**
   * Check if error is an authentication error
   */
  isAuthError() {
    return this.type === ERROR_TYPES.AUTHENTICATION;
  }

  /**
   * Check if error is an authorization error
   */
  isAuthorizationError() {
    return this.type === ERROR_TYPES.AUTHORIZATION;
  }

  /**
   * Check if error is a server error
   */
  isServerError() {
    return this.type === ERROR_TYPES.SERVER_ERROR;
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage() {
    return this.message || DEFAULT_ERROR_MESSAGES[this.type];
  }
}

/**
 * Parse validation errors from backend response
 */
export const parseValidationErrors = errors => {
  if (!errors || typeof errors !== 'object') {
    return {};
  }

  // Handle express-validator format: { field: { msg: "message", value: "value" } }
  const parsedErrors = {};

  Object.keys(errors).forEach(field => {
    const error = errors[field];
    if (typeof error === 'object' && error.msg) {
      parsedErrors[field] = error.msg;
    } else if (typeof error === 'string') {
      parsedErrors[field] = error;
    } else if (Array.isArray(error) && error.length > 0) {
      parsedErrors[field] = error[0].msg || error[0];
    }
  });

  return parsedErrors;
};

/**
 * Determine error type from status code and error details
 */
const getErrorType = (status, errorData) => {
  // Check for network errors
  if (status === 0 || !status) {
    return ERROR_TYPES.NETWORK_ERROR;
  }

  // Check for timeout
  if (errorData?.code === 'ECONNABORTED') {
    return ERROR_TYPES.TIMEOUT;
  }

  // Map status code to error type
  return STATUS_TO_ERROR_TYPE[status] || ERROR_TYPES.UNKNOWN;
};

/**
 * Main error handler function
 */
export const handleApiError = (error, options = {}) => {
  const {
    showToast = true,
    logError = true,
    customMessage = null,
    onAuthError = null,
    onValidationError = null,
  } = options;

  let appError;

  // Handle different error formats
  if (error instanceof AppError) {
    appError = error;
  } else if (error?.response) {
    // Axios error with response
    const { status, data } = error.response;
    const errorType = getErrorType(status, data);
    const message =
      customMessage || data?.message || DEFAULT_ERROR_MESSAGES[errorType];

    appError = new AppError(message, errorType, status, {
      originalError: error,
      responseData: data,
      validationErrors:
        errorType === ERROR_TYPES.VALIDATION
          ? parseValidationErrors(data?.errors)
          : null,
    });
  } else if (error?.request) {
    // Network error
    appError = new AppError(
      customMessage || DEFAULT_ERROR_MESSAGES[ERROR_TYPES.NETWORK_ERROR],
      ERROR_TYPES.NETWORK_ERROR,
      0,
      { originalError: error }
    );
  } else if (error?.success === false) {
    // Custom API error format
    const errorType = getErrorType(error.status);
    appError = new AppError(
      customMessage || error.message || DEFAULT_ERROR_MESSAGES[errorType],
      errorType,
      error.status || 0,
      {
        originalError: error,
        validationErrors:
          errorType === ERROR_TYPES.VALIDATION
            ? parseValidationErrors(error.errors)
            : null,
      }
    );
  } else {
    // Unknown error
    appError = new AppError(
      customMessage ||
        error?.message ||
        DEFAULT_ERROR_MESSAGES[ERROR_TYPES.UNKNOWN],
      ERROR_TYPES.UNKNOWN,
      0,
      { originalError: error }
    );
  }

  // Log error for debugging
  if (logError) {
    console.error('API Error:', {
      type: appError.type,
      status: appError.status,
      message: appError.message,
      details: appError.details,
      timestamp: appError.timestamp,
    });
  }

  // Handle specific error types
  if (appError.isAuthError() && onAuthError) {
    onAuthError(appError);
  } else if (appError.isValidationError() && onValidationError) {
    onValidationError(appError);
  }

  // Show toast notification
  if (showToast) {
    const toastOptions = {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    };

    switch (appError.type) {
      case ERROR_TYPES.VALIDATION:
        toast.error(appError.getUserMessage(), toastOptions);
        break;
      case ERROR_TYPES.AUTHENTICATION:
        toast.warn(appError.getUserMessage(), {
          ...toastOptions,
          autoClose: 3000,
        });
        break;
      case ERROR_TYPES.AUTHORIZATION:
        toast.warn(appError.getUserMessage(), toastOptions);
        break;
      case ERROR_TYPES.SERVER_ERROR:
        toast.error(appError.getUserMessage(), toastOptions);
        break;
      case ERROR_TYPES.NETWORK_ERROR:
        toast.error(appError.getUserMessage(), {
          ...toastOptions,
          autoClose: 7000,
        });
        break;
      default:
        toast.error(appError.getUserMessage(), toastOptions);
    }
  }

  return appError;
};

/**
 * Utility function to handle async operations with error handling
 */
export const withErrorHandling = async (asyncFn, errorOptions = {}) => {
  try {
    return await asyncFn();
  } catch (error) {
    const appError = handleApiError(error, errorOptions);
    throw appError;
  }
};

/**
 * React hook for handling errors in components
 */
export const useErrorHandler = (defaultOptions = {}) => {
  const handleError = (error, options = {}) => {
    return handleApiError(error, { ...defaultOptions, ...options });
  };

  return { handleError };
};

/**
 * Validation helper for form fields
 */
export const getFieldError = (fieldName, validationErrors) => {
  if (!validationErrors || typeof validationErrors !== 'object') {
    return null;
  }
  return validationErrors[fieldName] || null;
};

/**
 * Check if there are any validation errors
 */
export const hasValidationErrors = validationErrors => {
  return validationErrors && Object.keys(validationErrors).length > 0;
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = validationErrors => {
  if (!hasValidationErrors(validationErrors)) {
    return '';
  }

  return Object.values(validationErrors).join(', ');
};

export default handleApiError;
