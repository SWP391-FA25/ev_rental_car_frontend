# Error Handling System Guide

Hệ thống xử lý lỗi toàn diện cho ứng dụng EV Rental Car, tương thích với backend validation.js.

## 📋 Tổng quan

Hệ thống bao gồm:

- **Error Handler**: Xử lý và phân loại các loại lỗi khác nhau
- **API Client**: Tích hợp error handling vào các API calls
- **Validation Service**: Validation phía client tương thích với backend
- **Error Boundary**: Bắt các lỗi React không được handle
- **React Hooks**: Hooks để quản lý errors trong components

## 🚀 Cách sử dụng

### 1. Basic Error Handling

```jsx
import { useErrorHandler } from '@/features/shared/hooks/useErrorHandler';
import { apiClient } from '@/features/shared/lib/apiClient';

function MyComponent() {
  const { handleError, withErrorHandling, isLoading } = useErrorHandler();

  const fetchData = async () => {
    try {
      const result = await withErrorHandling(async () => {
        return await apiClient.get('/api/data');
      });

      // Xử lý kết quả thành công
      console.log(result);
    } catch (error) {
      // Lỗi đã được handle tự động
      console.log('Fetch failed:', error.message);
    }
  };

  return (
    <button onClick={fetchData} disabled={isLoading}>
      {isLoading ? 'Loading...' : 'Fetch Data'}
    </button>
  );
}
```

### 2. Form Validation với Error Handling

```jsx
import {
  useFormValidation,
  CommonSchemas,
} from '@/features/shared/services/validationService';
import { useErrorHandler } from '@/features/shared/hooks/useErrorHandler';

function LoginForm() {
  const { handleFormSubmit, isLoading } = useErrorHandler();

  const { data, errors, setValue, setTouched, validateAll, reset } =
    useFormValidation(CommonSchemas.login, {
      email: '',
      password: '',
    });

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateAll()) {
      return;
    }

    try {
      await handleFormSubmit(async () => {
        return await apiClient.post('/auth/login', data);
      });

      // Đăng nhập thành công
      reset();
    } catch (error) {
      // Lỗi đã được handle
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type='email'
        value={data.email}
        onChange={e => setValue('email', e.target.value)}
        onBlur={() => setTouched('email')}
      />
      {errors.email && <span className='error'>{errors.email}</span>}

      <input
        type='password'
        value={data.password}
        onChange={e => setValue('password', e.target.value)}
        onBlur={() => setTouched('password')}
      />
      {errors.password && <span className='error'>{errors.password}</span>}

      <button type='submit' disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### 3. Custom Validation Schema

```jsx
import {
  ValidationSchema,
  ValidationRules,
} from '@/features/shared/services/validationService';

const bookingSchema = new ValidationSchema({
  pickupDate: [
    ValidationRules.date.required,
    ValidationRules.date.minDate(new Date()),
  ],
  returnDate: [
    ValidationRules.date.required,
    (value, allData) => {
      if (new Date(value) <= new Date(allData.pickupDate)) {
        return 'Return date must be after pickup date';
      }
      return null;
    },
  ],
  vehicleType: [ValidationRules.required],
});

function BookingForm() {
  const { data, errors, setValue, validateAll } =
    useFormValidation(bookingSchema);

  // ... rest of component
}
```

### 4. Manual Error Handling

```jsx
import {
  handleApiError,
  AppError,
  ERROR_TYPES,
} from '@/features/shared/lib/handleApiError';

function handleCustomError() {
  try {
    // Simulate error
    throw new AppError(
      'Custom validation failed',
      ERROR_TYPES.VALIDATION,
      400,
      {
        validationErrors: {
          email: 'Email already exists',
          phone: 'Invalid phone format',
        },
      }
    );
  } catch (error) {
    const processedError = handleApiError(error, {
      showToast: true,
      customMessage: 'Registration failed',
      onValidationError: err => {
        // Handle validation errors specifically
        console.log('Validation errors:', err.details.validationErrors);
      },
    });
  }
}
```

### 5. API Calls với Retry

```jsx
import { makeApiCall } from '@/features/shared/lib/apiClient';

async function reliableApiCall() {
  try {
    const result = await makeApiCall(
      () => apiClient.get('/api/unreliable-endpoint'),
      {
        retries: 3,
        retryDelay: 1000,
        showErrorToast: true,
      }
    );

    return result;
  } catch (error) {
    console.log('Failed after retries:', error);
  }
}
```

### 6. Error Boundary Usage

```jsx
import ErrorBoundary from '@/features/shared/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Send to error reporting service
        console.error('Boundary caught:', error, errorInfo);
      }}
    >
      <MyComponent />
    </ErrorBoundary>
  );
}

// Hoặc sử dụng HOC
import { withErrorBoundary } from '@/features/shared/components/ErrorBoundary';

const SafeComponent = withErrorBoundary(MyComponent, {
  onError: error => console.error('Error in MyComponent:', error),
});
```

## 🔧 Configuration

### Error Handler Options

```jsx
const { handleError } = useErrorHandler({
  showToast: true, // Hiển thị toast notification
  redirectOnAuth: true, // Redirect khi lỗi authentication
  logErrors: true, // Log errors to console
  onError: error => {
    // Custom error handler
    // Send to analytics/monitoring
  },
});
```

### API Client Configuration

```jsx
// Trong apiClient.js, bạn có thể customize:
export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 20000, // Timeout 20s
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## 📊 Error Types

Hệ thống hỗ trợ các loại lỗi sau:

- `VALIDATION`: Lỗi validation dữ liệu (400, 422)
- `AUTHENTICATION`: Lỗi xác thực (401)
- `AUTHORIZATION`: Lỗi phân quyền (403)
- `NOT_FOUND`: Không tìm thấy tài nguyên (404)
- `SERVER_ERROR`: Lỗi máy chủ (500, 502, 503)
- `NETWORK_ERROR`: Lỗi mạng
- `TIMEOUT`: Timeout
- `UNKNOWN`: Lỗi không xác định

## 🎯 Best Practices

### 1. Sử dụng withErrorHandling cho async operations

```jsx
// ✅ Good
const fetchData = async () => {
  try {
    return await withErrorHandling(async () => {
      return await apiClient.get('/api/data');
    });
  } catch (error) {
    // Handle specific error if needed
  }
};

// ❌ Bad - không có error handling
const fetchData = async () => {
  return await apiClient.get('/api/data');
};
```

### 2. Validate form trước khi submit

```jsx
// ✅ Good
const handleSubmit = async e => {
  e.preventDefault();

  if (!validateAll()) {
    return; // Dừng nếu validation fail
  }

  await handleFormSubmit(async () => {
    return await apiClient.post('/api/submit', data);
  });
};
```

### 3. Sử dụng appropriate error handling patterns

```jsx
import { ErrorHandlingPatterns } from '@/features/shared/lib';

// For silent operations
handleError(error, ErrorHandlingPatterns.silent);

// For form validation
handleError(error, ErrorHandlingPatterns.validation);

// For authentication
handleError(error, ErrorHandlingPatterns.auth);

// For critical errors
handleError(error, ErrorHandlingPatterns.critical);
```

### 4. Custom validation rules

```jsx
const customValidator = ValidationUtils.custom(
  value => value.includes('@company.com'),
  'Must be a company email'
);

const schema = new ValidationSchema({
  email: [
    ValidationRules.email.required,
    ValidationRules.email.format,
    customValidator,
  ],
});
```

## 🔍 Debugging

### Development Mode

Trong development mode, hệ thống sẽ:

- Log chi tiết các API calls
- Hiển thị error details trong ErrorBoundary
- Log validation errors to console

### Error Tracking

Để tích hợp với error tracking services (Sentry, Bugsnag, etc.):

```jsx
// Trong handleApiError.js
const handleApiError = (error, options = {}) => {
  // ... existing code

  // Send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Sentry.captureException(appError);
    // Bugsnag.notify(appError);
  }

  return appError;
};
```

## 📝 Examples

Xem file `ErrorHandlingExample.jsx` để có ví dụ đầy đủ về cách sử dụng tất cả các tính năng của hệ thống error handling.

## 🤝 Tương thích với Backend

Hệ thống được thiết kế để tương thích với backend validation.js:

### Backend Response Format

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": {
      "msg": "Email is required",
      "value": "",
      "param": "email"
    },
    "password": {
      "msg": "Password must be at least 8 characters",
      "value": "123",
      "param": "password"
    }
  }
}
```

### Frontend Parsing

```jsx
// Tự động parse validation errors từ backend
const validationErrors = parseValidationErrors(response.errors);
// Result: { email: "Email is required", password: "Password must be at least 8 characters" }
```

Hệ thống này cung cấp một cách tiếp cận nhất quán và mạnh mẽ để xử lý lỗi trong toàn bộ ứng dụng, đảm bảo trải nghiệm người dùng tốt và dễ dàng debug/maintain.
