import AdminDashboard from '@/features/admin/components/AdminDashboard.jsx';
import Login from '@/features/auth/components/Login.jsx';
import SignUp from '@/features/auth/components/SignUp.jsx';
import UserPage from '@/features/booking/components/UserPage.jsx';
import Home from '@/features/shared/components/Home.jsx';
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <SignUp /> },
  { path: '/admin', element: <AdminDashboard /> },
  { path: '/user', element: <UserPage /> },
]);
