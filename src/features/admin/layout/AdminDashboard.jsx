import { Outlet } from 'react-router-dom';
import {
  SidebarInset,
  SidebarProvider,
} from '../../shared/components/ui/sidebar';
import { AppSidebar } from '../components/app-sidebar';
import { SiteHeader } from '../components/site-header';

export default function AdminDashboard() {
  return (
    <SidebarProvider
      style={{
        '--sidebar-width': 'calc(var(--spacing) * 72)',
        '--header-height': 'calc(var(--spacing) * 12)',
      }}
    >
      <AppSidebar variant='inset' />
      <SidebarInset>
        <SiteHeader />
        <div className='flex flex-1 flex-col'>
          <div className='@container/main flex flex-1 flex-col gap-2'>
            <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6 p-5'>
              <Outlet />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
