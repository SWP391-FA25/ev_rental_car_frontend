import AdminDashboard from '@/features/admin/layout/AdminDashboard.jsx';
import BookingManagement from '@/features/admin/pages/BookingManagement.jsx';
import Dashboard from '@/features/admin/pages/Dashboard.jsx';
import Settings from '@/features/admin/pages/Settings.jsx';
import StaffManagement from '@/features/admin/pages/StaffManagement.jsx';
import StationManagement from '@/features/admin/pages/StationManagement.jsx';
import UserManagement from '@/features/admin/pages/UserManagement.jsx';
import Login from '@/features/auth/components/Login.jsx';
import SignUp from '@/features/auth/components/SignUp.jsx';
import UserPage from '@/features/booking/components/UserPage.jsx';
import Home from '@/features/shared/components/Home.jsx';
import StaffDashboard from '@/features/staff/layout/StaffDashboard.jsx';
import { createBrowserRouter } from 'react-router-dom';
import PrivateRoutes from '../utils/PrivateRoutes';
import RoleBasedRoute from '../utils/RoleBaseRoutes';

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <SignUp /> },
  {
    path: '/admin',
    element: (
      <PrivateRoutes>
        <RoleBasedRoute allowedRoles={['ADMIN']}>
          <AdminDashboard />
        </RoleBasedRoute>
      </PrivateRoutes>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'users', element: <UserManagement /> },
      { path: 'staff', element: <StaffManagement /> },
      { path: 'stations', element: <StationManagement /> },
      { path: 'bookings', element: <BookingManagement /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
  {
    path: '/staff',
    element: (
      <PrivateRoutes>
        <RoleBasedRoute allowedRoles={['STAFF']}>
          <StaffDashboard />
        </RoleBasedRoute>
      </PrivateRoutes>
    ),
  },
  { path: '/user', element: <UserPage /> },
]);
