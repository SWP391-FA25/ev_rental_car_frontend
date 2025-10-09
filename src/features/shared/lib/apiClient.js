import axios from 'axios';
import { env } from './env';

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 10000, // Giảm từ 20s xuống 10s
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  config => config,
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

    return Promise.reject({
      success: false,
      data: null,
      message,
      status,
      timestamp: new Date().toISOString(),
    });
  }
);
