import axios from 'axios';
import { env } from './env';

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 20000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  config => {
    // Add timestamp to prevent caching
    config.metadata = { startTime: new Date() };
    return config;
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  response => {
    // Calculate request duration
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;

    // Log successful requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `✔ ${response.config.method?.toUpperCase()} ${
          response.config.url
        } - ${duration}ms`
      );
    }

    const payload = response?.data;

    // Handle standardized API response format
    if (
      payload &&
      typeof payload === 'object' &&
      'success' in payload &&
      'data' in payload
    ) {
      return payload;
    }

    // Wrap non-standardized responses
    return {
      success: true,
      data: payload,
      message: '',
      timestamp: new Date().toISOString(),
    };
  },
  error => {
    // Calculate request duration if available
    const endTime = new Date();
    const duration = error.config?.metadata?.startTime
      ? endTime - error.config.metadata.startTime
      : 0;

    // Log failed requests in development
    if (process.env.NODE_ENV === 'development') {
      console.error(
        `❌ ${error.config?.method?.toUpperCase()} ${
          error.config?.url
        } - ${duration}ms`,
        error
      );
    }

    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      // Create standardized error object
      const errorResponse = {
        success: false,
        data: null,
        message: data?.message || `HTTP ${status} Error`,
        status,
        errors: data?.errors || null,
        timestamp: new Date().toISOString(),
        duration,
      };

      return Promise.reject(errorResponse);
    } else if (error.request) {
      // Network error or no response
      const errorResponse = {
        success: false,
        data: null,
        message: 'Network error - Unable to connect to server',
        status: 0,
        errors: null,
        timestamp: new Date().toISOString(),
        duration,
        code: error.code,
      };

      return Promise.reject(errorResponse);
    } else {
      // Something else happened
      const errorResponse = {
        success: false,
        data: null,
        message: error.message || 'Unknown error occurred',
        status: 0,
        errors: null,
        timestamp: new Date().toISOString(),
        duration,
      };

      return Promise.reject(errorResponse);
    }
  }
);

// Helper function to make API calls with built-in error handling
export const makeApiCall = async (apiCall, options = {}) => {
  const {
    // Removed unused options for now
    retries = 0,
    retryDelay = 1000,
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await apiCall();
      return response;
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx) or authentication errors
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
};
