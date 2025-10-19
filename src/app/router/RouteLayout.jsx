import { Outlet } from 'react-router-dom';
import ScrollToTop from '../utils/ScrollToTop';

export default function RootLayout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}
