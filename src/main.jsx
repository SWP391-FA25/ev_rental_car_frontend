import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import AuthProvider from './app/providers/AuthProvider';
import { NotificationProvider } from './app/providers/NotificationProvider.jsx';
import { ThemeProvider } from './app/providers/ThemeProvider';
import { router } from './app/router/router';
import { Toaster } from './features/shared/components/ui/sonner';
import './features/shared/i18n/index.js';
import './index.css';
import './select-custom.css';

createRoot(document.getElementById('root')).render(
  <ThemeProvider defaultTheme='system' storageKey='vite-ui-theme'>
    <AuthProvider>
      <NotificationProvider>
        <RouterProvider router={router} />
        <Toaster position='top-right' />
      </NotificationProvider>
    </AuthProvider>
  </ThemeProvider>
);
