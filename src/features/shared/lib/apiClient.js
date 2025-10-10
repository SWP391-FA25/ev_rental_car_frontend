import axios from 'axios';
import { toast } from 'sonner';
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

    // Kiểm tra nếu response có success: false thì coi như error
    if (payload && typeof payload === 'object' && payload.success === false) {
      const error = {
        response: {
          status: response.status,
          data: payload,
        },
      };
      return Promise.reject(error);
    }

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
    const responseData = error?.response?.data || {};

    // Tự động hiển thị toast cho các lỗi phổ biến
    if (status === 401) {
      toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      // Redirect to login sau 2 giây
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } else if (status === 403) {
      toast.error('Bạn không có quyền thực hiện hành động này.');
    } else if (status === 400 && responseData.errors) {
      // Hiển thị lỗi validation
      if (Array.isArray(responseData.errors)) {
        responseData.errors.forEach(err => toast.error(err));
      } else if (typeof responseData.errors === 'object') {
        Object.values(responseData.errors).forEach(err => {
          toast.error(err.msg || err);
        });
      }
    } else if (status === 0 || !error.response) {
      toast.error('Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.');
    } else {
      // Hiển thị message từ backend hoặc message mặc định
      const message = responseData.message || error.message || 'Đã xảy ra lỗi';
      toast.error(message);
    }

    // Vẫn trả về error object để component có thể xử lý thêm nếu cần
    return Promise.reject({
      success: false,
      data: null,
      message: responseData.message || error.message || 'Request error',
      status,
      errors: responseData.errors,
      timestamp: new Date().toISOString(),
    });
  }
);
