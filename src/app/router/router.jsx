import AdminDashboard from '@/features/admin/layout/AdminDashboard.jsx';
import Dashboard from '@/features/admin/pages/Dashboard.jsx';
import Settings from '@/features/admin/pages/Settings.jsx';
import StaffManagement from '@/features/admin/pages/StaffManagement.jsx';
import StationManagement from '@/features/admin/pages/StationManagement.jsx';
import UserManagement from '@/features/admin/pages/UserManagement.jsx';
import Login from '@/features/auth/components/Login.jsx';
import SignUp from '@/features/auth/components/SignUp.jsx';
import BookingsPage from '@/features/booking/components/BookingsPage.jsx';
import CarDetailPage from '@/features/cars/components/CarDetailPage.jsx';
import CarsPage from '@/features/cars/components/CarsPage.jsx';
import Home from '@/features/shared/components/Home.jsx';
import StaffDashboard from '@/features/staff/layout/StaffDashboard.jsx';
import { createBrowserRouter } from 'react-router-dom';
import VehicleManagement from '../../features/admin/pages/VehicleManagement';
import UserPage from '../../features/booking/components/UserPage';
import PrivateRoutes from '../utils/PrivateRoutes';
import RoleBasedRoute from '../utils/RoleBaseRoutes';

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/cars', element: <CarsPage /> },
  { path: '/cars/:id', element: <CarDetailPage /> },
  { path: '/bookings', element: <BookingsPage /> },
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
      { path: 'vehicles', element: <VehicleManagement /> },
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
  {
    path: '/user',
    element: (
      <PrivateRoutes>
        <RoleBasedRoute allowedRoles={['RENTER']}>
          <UserPage />
        </RoleBasedRoute>
      </PrivateRoutes>
    ),
    children: [
      { index: true, element: <UserPage /> },
      { path: 'cars', element: <CarsPage /> },
    ],
  },
]);
