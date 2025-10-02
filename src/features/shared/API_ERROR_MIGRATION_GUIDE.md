# API Error Handling Migration Guide

Hướng dẫn áp dụng hệ thống error handling lên toàn bộ API calls trong frontend.

## 🎯 Tổng quan

Đã hoàn thành việc áp dụng error handling cho:

- ✅ `useApi` hook - Core API wrapper với error handling
- ✅ `AuthProvider` - Silent error handling cho auth verification
- ✅ `Login` component - Form validation + error handling
- ✅ `SignUp` component - Form validation + error handling
- ✅ `useStaff` hook - Admin hook với error handling

## 🔄 Pattern Migration

### 1. Thay thế `apiClient` trực tiếp bằng `useApi` hook

**❌ Cũ:**

```jsx
import { apiClient } from '../../shared/lib/apiClient';

const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);
    const response = await apiClient.get('/api/endpoint');
    // handle success
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

**✅ Mới:**

```jsx
import { useApi } from '../../shared/hooks/useApi';

const { get, loading } = useApi();

const fetchData = async () => {
  try {
    const response = await get('/api/endpoint');
    // handle success - error handling tự động
  } catch (err) {
    // Error đã được handle, chỉ cần log nếu cần
    console.error('Fetch failed:', err.message);
  }
};
```

### 2. Form Components với Validation

**❌ Cũ:**

```jsx
const [formData, setFormData] = useState({});
const [error, setError] = useState(null);

const handleSubmit = async e => {
  e.preventDefault();
  try {
    const response = await apiClient.post('/api/submit', formData);
    // handle success
  } catch (err) {
    setError(err.message);
  }
};
```

**✅ Mới:**

```jsx
import { useErrorHandler } from '../../shared/hooks/useErrorHandler';
import {
  useFormValidation,
  CommonSchemas,
} from '../../shared/services/validationService';

const { handleFormSubmit, isLoading } = useErrorHandler();
const { data, errors, setValue, setTouched, validateAll } = useFormValidation(
  CommonSchemas.login
);

const handleSubmit = async e => {
  e.preventDefault();

  if (!validateAll()) return;

  try {
    await handleFormSubmit(async () => {
      return await apiClient.post('/api/submit', data);
    });
    // handle success
  } catch (error) {
    // Error đã được handle
  }
};
```

### 3. Custom Hooks Migration

**❌ Cũ:**

```jsx
export function useCustomHook() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/api/data');
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchData };
}
```

**✅ Mới:**

```jsx
import { useApi } from '../../shared/hooks/useApi';

export function useCustomHook() {
  const [data, setData] = useState([]);
  const { get, post, put, del, loading } = useApi();

  const fetchData = async () => {
    try {
      const response = await get('/api/data');
      setData(response.data);
    } catch (err) {
      // Error đã được handle tự động
      console.error('Fetch failed:', err);
    }
  };

  const createItem = async itemData => {
    try {
      const response = await post('/api/data', itemData);
      setData(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      throw err; // Re-throw để component có thể handle nếu cần
    }
  };

  return { data, loading, fetchData, createItem };
}
```

## 📋 Checklist Migration cho từng file

### Admin Components

- [ ] `ev_rental_car_frontend/src/features/admin/hooks/useUsers.js`
- [ ] `ev_rental_car_frontend/src/features/admin/hooks/usePromotion.js`
- [ ] `ev_rental_car_frontend/src/features/admin/components/assignment/SimpleAssignmentForm.jsx`
- [ ] `ev_rental_car_frontend/src/features/admin/components/vehicle/VehicleDetails.jsx`
- [ ] `ev_rental_car_frontend/src/features/admin/components/renter/UserDetails.jsx`
- [ ] `ev_rental_car_frontend/src/features/admin/pages/VehicleManagement.jsx`
- [ ] `ev_rental_car_frontend/src/features/admin/pages/StationManagement.jsx`
- [ ] `ev_rental_car_frontend/src/features/admin/pages/StaffManagement.jsx`

### User Components

- [ ] `ev_rental_car_frontend/src/features/user/components/ProfileContent.jsx`

### Staff Components

- [ ] `ev_rental_car_frontend/src/features/staff/components/staff-sidebar.jsx`

### Shared Services

- [ ] `ev_rental_car_frontend/src/features/shared/services/documentService.js`

### Navigation Components

- [ ] `ev_rental_car_frontend/src/features/shared/components/homepage/Navbar.jsx`
- [ ] `ev_rental_car_frontend/src/features/admin/components/nav-user.jsx`

## 🔧 Các bước thực hiện

### Bước 1: Import các dependencies cần thiết

```jsx
// Thay thế apiClient imports
import { useApi } from '../../shared/hooks/useApi';

// Cho form components
import { useErrorHandler } from '../../shared/hooks/useErrorHandler';
import {
  useFormValidation,
  CommonSchemas,
} from '../../shared/services/validationService';

// Cho endpoints
import { endpoints } from '../../shared/lib/endpoints';
```

### Bước 2: Thay thế state management

```jsx
// Xóa manual loading/error states
const { get, post, put, del, loading } = useApi();

// Hoặc cho forms
const { handleFormSubmit, isLoading } = useErrorHandler();
```

### Bước 3: Cập nhật API calls

```jsx
// Thay thế tất cả apiClient.method() bằng method() từ useApi
const response = await get(endpoints.someEndpoint());
```

### Bước 4: Cập nhật error handling

```jsx
// Xóa try/catch blocks phức tạp, chỉ giữ lại logic cần thiết
try {
  const result = await apiCall();
  // handle success
} catch (error) {
  // Error đã được handle tự động, chỉ log nếu cần
  console.error('Operation failed:', error.message);
}
```

### Bước 5: Cập nhật form handling (nếu có)

```jsx
// Thêm validation
const { data, errors, setValue, setTouched, validateAll } =
  useFormValidation(schema);

// Cập nhật form inputs
<Input
  value={data.fieldName}
  onChange={e => setValue('fieldName', e.target.value)}
  onBlur={() => setTouched('fieldName')}
  className={errors.fieldName ? 'border-destructive' : ''}
/>;
{
  errors.fieldName && (
    <p className='text-sm text-destructive'>{errors.fieldName}</p>
  );
}
```

## 🎨 Custom Error Handling Options

### Silent Operations (không hiển thị toast)

```jsx
const { get } = useApi({ showToast: false });
```

### Custom Error Messages

```jsx
try {
  await handleFormSubmit(
    async () => {
      return await post('/api/endpoint', data);
    },
    { customErrorMessage: 'Custom error message' }
  );
} catch (error) {
  // Handle specific error
}
```

### Skip Error Handling (cho special cases)

```jsx
const response = await get('/api/endpoint', { skipErrorHandling: true });
```

## 🚀 Lợi ích sau khi migration

1. **Consistent Error Handling**: Tất cả errors được handle theo cùng một pattern
2. **Better UX**: Toast notifications tự động, loading states
3. **Form Validation**: Client-side validation tương thích với backend
4. **Reduced Boilerplate**: Ít code hơn, dễ maintain hơn
5. **Type Safety**: Better error typing và handling
6. **Centralized Logging**: Tất cả errors được log centrally

## ⚠️ Lưu ý quan trọng

1. **Không xóa error handling logic quan trọng** - chỉ thay thế boilerplate
2. **Test thoroughly** sau khi migration
3. **Giữ lại custom error handling** cho các cases đặc biệt
4. **Update dependencies** nếu cần thiết
5. **Check console** để đảm bảo không có errors mới

## 📞 Hỗ trợ

Nếu gặp vấn đề trong quá trình migration, tham khảo:

- `ERROR_HANDLING_GUIDE.md` - Hướng dẫn chi tiết
- `ErrorHandlingExample.jsx` - Ví dụ đầy đủ
- Existing migrated components như `Login.jsx`, `useStaff.js`
