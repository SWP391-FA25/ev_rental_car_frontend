import {
  ArrowUpCircleIcon,
  BarChartIcon,
  BellIcon,
  Building2Icon,
  CalendarIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  PercentIcon,
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

import { useTranslation } from 'react-i18next';

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/admin',
      icon: LayoutDashboardIcon,
    },
    {
      title: 'Booking Management',
      url: '/admin/bookings',
      icon: CalendarIcon,
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
      title: 'Vehicals Management',
      url: '/admin/vehicles',
      icon: FileTextIcon,
    },
    {
      title: 'Promotion Management',
      url: '/admin/promotions',
      icon: PercentIcon,
    },
    {
      title: 'Notification Management',
      url: '/admin/notifications',
      icon: BellIcon,
    },
  ],
};

export function AppSidebar(props) {
  const { user } = useAuth();
  const { t } = useTranslation();

  // Translate nav items using the correct keys from the locale file
  const translatedNav = data.navMain.map(item => {
    // Map the item title to the correct translation key
    const translationKeyMap = {
      Dashboard: 'dashboard',
      'Booking Management': 'bookingManagement',
      'User Management': 'userManagement',
      'Staff Management': 'staffManagement',
      'Station Management': 'stationManagement',
      'Vehicals Management': 'vehiclesManagement',
      'Promotion Management': 'promotionManagement',
      'Notification Management': 'notificationManagement',
      'Booking Management': 'bookingManagement',
    };

    const key = translationKeyMap[item.title];
    // Use the translation if the key exists, otherwise use the original title
    const translatedTitle = key ? t(`sidebar.${key}`, item.title) : item.title;
    return {
      ...item,
      title: translatedTitle,
    };
  });

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
        <NavMain items={translatedNav} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
