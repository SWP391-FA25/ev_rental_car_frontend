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

apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Nếu payload là FormData, bỏ Content-Type mặc định để axios tự thêm boundary
    if (config.data instanceof FormData) {
      if (config.headers && config.headers['Content-Type']) {
        delete config.headers['Content-Type'];
      }
    }
    return config;
  },
  error => Promise.reject(error)
);

apiClient.interceptors.response.use(
  response => {
    const payload = response?.data;
    if (
      payload &&
      typeof payload === 'object' &&
      'success' in payload &&
      'data' in payload
    ) {
      return payload;
    }
    return {
      success: true,
      data: payload,
      message: '',
      timestamp: new Date().toISOString(),
    };
  },
  error => {
    const status = error?.response?.status || 0;
    const message =
      error?.response?.data?.message || error?.message || 'Request error';
    const errors = error?.response?.data?.errors || null;

    return Promise.reject({
      success: false,
      data: null,
      message,
      errors,
      status,
      timestamp: new Date().toISOString(),
    });
  }
);
