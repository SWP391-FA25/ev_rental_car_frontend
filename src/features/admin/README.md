# Admin Dashboard - Staff Management

## Tổng quan
Module quản lý nhân viên (Staff Management) trong Admin Dashboard, tích hợp đầy đủ với backend API.

## Các tính năng chính

### 1. **Xem danh sách staff**
- Hiển thị tất cả staff accounts từ database
- Loading state và error handling
- Search theo tên và email
- Filter theo status (Active, Inactive, Suspended)
- Filter theo role (Staff)

### 2. **Tạo staff mới**
- Form tạo staff với validation
- Các trường: name*, email*, password*, phone, address, accountStatus
- Toast notifications cho success/error

### 3. **Xem chi tiết staff**
- Modal hiển thị thông tin chi tiết
- Chế độ edit inline
- Cập nhật thông tin staff
- Hiển thị timestamps (createdAt, updatedAt)

### 4. **Quản lý staff**
- Suspend staff (soft delete)
- Delete staff (hard delete)
- Reset password (placeholder)
- Confirmation dialogs

### 5. **Thống kê**
- Total Staff
- Active Staff
- Staff Members
- Active Accounts

## Cấu trúc file

```
src/features/admin/
├── components/
│   ├── StaffForm.jsx          # Form tạo staff mới
│   ├── StaffDetails.jsx       # Modal chi tiết staff
│   └── ...
├── hooks/
│   └── useStaff.js            # Custom hook quản lý staff API
├── pages/
│   └── StaffManagement.jsx    # Trang chính quản lý staff
└── README.md                  # Tài liệu này
```

## API Endpoints

```javascript
// Staff endpoints
GET    /api/staff              # Lấy danh sách staff
GET    /api/staff/:id          # Lấy staff theo ID
POST   /api/staff              # Tạo staff mới
PUT    /api/staff/:id          # Cập nhật staff
PATCH  /api/staff/:id/soft-delete  # Suspend staff
DELETE /api/staff/:id          # Xóa staff
```

## Custom Hook: useStaff

```javascript
const {
  staff,           // Danh sách staff
  loading,         // Trạng thái loading
  error,           // Lỗi nếu có
  fetchStaff,      // Lấy danh sách staff
  createStaff,     // Tạo staff mới
  updateStaff,     // Cập nhật staff
  softDeleteStaff, // Suspend staff
  deleteStaff      // Xóa staff
} = useStaff();
```

## Cách sử dụng

### 1. Import và sử dụng hook
```javascript
import { useStaff } from '../hooks/useStaff';

function StaffManagement() {
  const { staff, loading, createStaff } = useStaff();
  // ...
}
```

### 2. Tạo staff mới
```javascript
const handleCreateStaff = async (staffData) => {
  try {
    await createStaff(staffData);
    toast.success('Staff created successfully');
  } catch (err) {
    toast.error('Failed to create staff');
  }
};
```

### 3. Cập nhật staff
```javascript
const handleUpdateStaff = async (id, staffData) => {
  try {
    await updateStaff(id, staffData);
    toast.success('Staff updated successfully');
  } catch (err) {
    toast.error('Failed to update staff');
  }
};
```

## Validation

### Frontend Validation
- Name: required
- Email: required, valid format
- Password: required
- Phone: format 0xxxxxxxxx (10 digits, starts with 0)
- AccountStatus: ACTIVE, INACTIVE, SUSPENDED

### Backend Validation
- Email uniqueness check
- Phone format validation
- AccountStatus validation
- Role validation (STAFF only)

## Error Handling

- API errors được catch và hiển thị toast
- Loading states cho tất cả operations
- Empty states khi không có data
- Error states khi API fails

## UI Components

- **Table**: Hiển thị danh sách staff
- **Dialog**: Form tạo staff và chi tiết staff
- **Badge**: Hiển thị status và role
- **Button**: Actions và navigation
- **Input/Textarea**: Form inputs
- **Select**: Dropdown selections
- **Toast**: Notifications

## Dependencies

- React Router DOM (navigation)
- Sonner (toast notifications)
- Lucide React (icons)
- Radix UI (dialog, select, etc.)
- Tailwind CSS (styling)

## Notes

- Tất cả operations đều có loading states
- Error handling toàn diện
- Responsive design
- Accessibility support
- TypeScript ready (có thể convert)
