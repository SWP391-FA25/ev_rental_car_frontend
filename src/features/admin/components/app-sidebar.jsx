import {
  ArrowUpCircleIcon,
  BarChartIcon,
  Building2Icon,
  FileTextIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UsersIcon,
} from 'lucide-react';

import { useAuth } from '@/app/providers/AuthProvider';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../../shared/components/ui/sidebar';
import { NavMain } from './nav-main';
import { NavUser } from './nav-user';

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/admin',
      icon: LayoutDashboardIcon,
    },
    {
      title: 'User Management',
      url: '/admin/users',
      icon: UsersIcon,
    },
    {
      title: 'Staff Management',
      url: '/admin/staff',
      icon: BarChartIcon,
    },
    {
      title: 'Station Management',
      url: '/admin/stations',
      icon: Building2Icon,
    },
    {
      title: 'Booking Management',
      url: '/admin/bookings',
      icon: FileTextIcon,
    },
    {
      title: 'Settings',
      url: '/admin/settings',
      icon: SettingsIcon,
    },
  ],
};

export function AppSidebar(props) {
  const { user } = useAuth();
  return (
    <Sidebar collapsible='offcanvas' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className='data-[slot=sidebar-menu-button]:!p-1.5'
            >
              <a href='#'>
                <ArrowUpCircleIcon className='h-5 w-5' />
                <span className='text-base font-semibold'>EV Rental</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
