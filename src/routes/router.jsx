import { createBrowserRouter } from 'react-router-dom';
import AdminDashboard from '../views/admin/AdminDashboard.jsx';
import Login from '../views/auth/Login.jsx';
import SignUp from '../views/auth/Signup.jsx';
import Home from '../views/Home.jsx';
import UserPage from '../views/user/UserPage.jsx';

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <SignUp /> },
  { path: '/admin', element: <AdminDashboard /> },
  { path: '/user', element: <UserPage /> },
]);
