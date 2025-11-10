import AdminDashboard from '@/features/admin/layout/AdminDashboard.jsx';
import Dashboard from '@/features/admin/pages/Dashboard.jsx';
import NotificationManagement from '@/features/admin/pages/NotificationManagement.jsx';
import Profile from '@/features/admin/pages/Profile.jsx';
import PromotionManagement from '@/features/admin/pages/PromotionManagement.jsx';
import Settings from '@/features/admin/pages/Settings.jsx';
import StaffManagement from '@/features/admin/pages/StaffManagement.jsx';
import StationManagement from '@/features/admin/pages/StationManagement.jsx';
import UserManagement from '@/features/admin/pages/UserManagement.jsx';
import ForgotPassword from '@/features/auth/components/ForgotPassword.jsx';
import Login from '@/features/auth/components/Login.jsx';
import ResetPassword from '@/features/auth/components/ResetPassword.jsx';
import SignUp from '@/features/auth/components/SignUp.jsx';
import VerifyEmail from '@/features/auth/components/VerifyEmail.jsx';
import CarDetailPage from '@/features/cars/components/CarDetailPage.jsx';
import CarsPage from '@/features/cars/components/CarsPage.jsx';
import DepositPaymentPage from '@/features/payment/pages/DepositPaymentPage.jsx';
import PaymentCancelPage from '@/features/payment/pages/PaymentCancelPage.jsx';
import PaymentSuccessPage from '@/features/payment/pages/PaymentSuccessPage.jsx';
import TotalAmountPaymentPage from '@/features/payment/pages/TotalAmountPaymentPage.jsx';
import SearchResultsPage from '@/features/search/pages/SearchResultsPage.jsx';
import Home from '@/features/shared/components/Home.jsx';
import { NotificationPage } from '@/features/shared/components/NotificationPage';
import PolicyPage from '@/features/shared/components/PolicyPage.jsx';
import StaffDashboard from '@/features/staff/layout/StaffDashboard.jsx';
import StaffProfileLayout from '@/features/staff/layout/StaffProfileLayout';
import { createBrowserRouter } from 'react-router-dom';
import VehicleManagement from '../../features/admin/pages/VehicleManagement';
import UserPage from '../../features/user/layout/UserPage';
import UserProfileLayout from '../../features/user/layout/UserProfileLayout';
import PrivateRoutes from '../utils/PrivateRoutes';
import RoleBasedRoute from '../utils/RoleBaseRoutes';
import RootLayout from './RouteLayout';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/cars', element: <CarsPage /> },
      { path: '/cars/:id', element: <CarDetailPage /> },
      { path: '/search-results', element: <SearchResultsPage /> },
      { path: '/policy', element: <PolicyPage /> },
      { path: '/payment/deposit', element: <DepositPaymentPage /> },
      { path: '/payment/total-amount', element: <TotalAmountPaymentPage /> },
      { path: '/payment/success', element: <PaymentSuccessPage /> },
      { path: '/payment/cancel', element: <PaymentCancelPage /> },
      { path: '/payment/failure', element: <PaymentCancelPage /> },
      { path: '/login', element: <Login /> },
      { path: '/signup', element: <SignUp /> },
      { path: '/verify-email', element: <VerifyEmail /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
      { path: '/reset-password', element: <ResetPassword /> },
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
          { path: 'users/:id', element: <Profile /> },
          { path: 'staff', element: <StaffManagement /> },
          { path: 'stations', element: <StationManagement /> },
          { path: 'vehicles', element: <VehicleManagement /> },
          { path: 'promotions', element: <PromotionManagement /> },
          { path: 'notifications', element: <NotificationManagement /> },
          { path: 'settings', element: <Settings /> },
          { path: 'profile', element: <Profile /> },
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
      },
      {
        path: '/notifications',
        element: (
          <PrivateRoutes>
            <RoleBasedRoute allowedRoles={['RENTER', 'STAFF', 'ADMIN']}>
              <NotificationPage />
            </RoleBasedRoute>
          </PrivateRoutes>
        ),
      },
      {
        path: '/user/profile',
        element: (
          <PrivateRoutes>
            <RoleBasedRoute allowedRoles={['RENTER']}>
              <UserProfileLayout />
            </RoleBasedRoute>
          </PrivateRoutes>
        ),
      },
    ],
  },
]);
