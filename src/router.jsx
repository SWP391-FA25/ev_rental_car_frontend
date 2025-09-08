import { createBrowserRouter } from 'react-router-dom';
import Health from './views/Health.jsx';
import Home from './views/Home.jsx';

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/health', element: <Health /> },
]);
