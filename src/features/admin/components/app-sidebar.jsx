import {
  ArrowUpCircleIcon,
  BarChartIcon,
  Building2Icon,
  FileTextIcon,
  LayoutDashboardIcon,
  PercentIcon,
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

import { useTranslation } from 'react-i18next';

const data = {
  navMain: [
    { title: 'sidebar.dashboard', url: '/admin', icon: LayoutDashboardIcon },
    { title: 'sidebar.userManagement', url: '/admin/users', icon: UsersIcon },
    { title: 'sidebar.staffManagement', url: '/admin/staff', icon: BarChartIcon },
    { title: 'sidebar.stationManagement', url: '/admin/stations', icon: Building2Icon },
    { title: 'sidebar.vehiclesManagement', url: '/admin/vehicles', icon: FileTextIcon },
    { title: 'sidebar.promotionManagement', url: '/admin/promotions', icon: PercentIcon },
    { title: 'sidebar.settings', url: '/admin/settings', icon: SettingsIcon },
  ],
};

export function AppSidebar(props) {
  const { user } = useAuth();
  const { t } = useTranslation();

  // map title sang text theo ngôn ngữ
  const translatedNav = data.navMain.map((item) => ({
    ...item,
    title: t(item.title),
  }));

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">EV Rental</span>
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
