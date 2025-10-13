import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthProvider from './app/providers/AuthProvider';
import { NotificationProvider } from './app/providers/NotificationProvider.jsx';
import { ThemeProvider } from './app/providers/ThemeProvider';
import { router } from './app/router/router';
import './features/shared/i18n/index.js';
import './index.css';
import './select-custom.css';
import './toast.css';

createRoot(document.getElementById('root')).render(
  <ThemeProvider defaultTheme='system' storageKey='vite-ui-theme'>
    <AuthProvider>
      <NotificationProvider>
        <RouterProvider router={router} />
        <ToastContainer
          position='top-center'
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          style={{
            top: '60px',
            zIndex: 40,
          }}
        />
      </NotificationProvider>
    </AuthProvider>
  </ThemeProvider>
);
