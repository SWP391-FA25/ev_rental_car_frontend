import {
  Bell,
  Calendar,
  Car,
  CheckCircle,
  ChevronUp,
  Clock,
  CreditCard,
  MapPin,
  Settings,
  User2,
  Users,
  Wrench,
} from 'lucide-react';
import * as React from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../shared/components/ui/avatar';
import { Badge } from '../../shared/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../shared/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../shared/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '../../shared/components/ui/sidebar';
import { apiClient } from '../../shared/lib/apiClient';
import { endpoints } from '../../shared/lib/endpoints';

const data = {
  staff: {
    name: 'John Smith',
    email: 'john.smith@company.com',
    avatar: '/api/placeholder/32/32',
    role: 'Station Manager',
    station: 'Downtown Station',
  },
  navMain: [
    {
      title: 'Car Management',
      url: '#',
      icon: Car,
      isActive: true,
      items: [
        {
          title: 'View Bookings',
          url: '#',
          description: 'Active and upcoming car bookings',
        },
        {
          title: 'Car Drop-off',
          url: '#',
          description: 'Process vehicle returns',
        },
        {
          title: 'Update Car Status',
          url: '#',
          description: 'Change availability and maintenance status',
        },
        {
          title: 'Vehicle Inspection',
          url: '#',
          description: 'Pre and post rental inspections',
        },
      ],
    },
    {
      title: 'Station Management',
      url: '#',
      icon: MapPin,
      items: [
        {
          title: 'Station Overview',
          url: '#',
          description: 'Current station status and metrics',
        },
        {
          title: 'Charging Stations',
          url: '#',
          description: 'Monitor charging port status',
        },
        {
          title: 'Parking Spots',
          url: '#',
          description: 'Manage parking availability',
        },
        {
          title: 'Maintenance Requests',
          url: '#',
          description: 'Station facility maintenance',
        },
      ],
    },
    {
      title: 'Customer Service',
      url: '#',
      icon: Users,
      items: [
        {
          title: 'Customer Check-in',
          url: '#',
          description: 'Process customer arrivals',
        },
        {
          title: 'License Verification',
          url: '#',
          description: 'Verify driver licenses',
        },
        {
          title: 'Customer Support',
          url: '#',
          description: 'Handle customer inquiries',
        },
        {
          title: 'Incident Reports',
          url: '#',
          description: 'Document and manage incidents',
        },
        {
          title: 'Notifications',
          url: '/notifications',
          description: 'View and manage notifications',
        },
      ],
    },
    {
      title: 'Payment Management',
      url: '#',
      icon: CreditCard,
      items: [
        {
          title: 'Process Payments',
          url: '#',
          description: 'Handle payment transactions',
        },
        {
          title: 'Refunds & Adjustments',
          url: '#',
          description: 'Process refunds and billing adjustments',
        },
        {
          title: 'Payment History',
          url: '#',
          description: 'View transaction history',
        },
        {
          title: 'Billing Issues',
          url: '#',
          description: 'Resolve payment disputes',
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: 'Schedule',
      url: '#',
      icon: Calendar,
    },
    {
      title: 'Notifications',
      url: '#',
      icon: Bell,
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings,
    },
  ],
};

function StaffNav({ items }) {
  const { t } = useTranslation();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Staff Dashboard</SidebarGroupLabel>
      <SidebarMenu>
        {items.map(item => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className='group/collapsible'
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronUp className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180' />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map(subItem => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <a href={subItem.url}>
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function StaffSecondaryNav({ items, ...props }) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(item => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function StaffQuickStats({ cars, stations, customers, payments }) {
  const stats = React.useMemo(() => {
    const availableCars = cars.filter(car => car.status === 'Available').length;
    const rentedCars = cars.filter(car => car.status === 'Rented').length;
    const maintenanceCars = cars.filter(
      car => car.status === 'Maintenance'
    ).length;
    const pendingCheckIns = customers.filter(
      customer => customer.status === 'Pending Check-in'
    ).length;
    const pendingPayments = payments.filter(
      payment => payment.status === 'Pending'
    ).length;
    const activeStations = stations.filter(
      station => station.status === 'Active'
    ).length;

    return {
      availableCars,
      rentedCars,
      maintenanceCars,
      pendingCheckIns,
      pendingPayments,
      activeStations,
    };
  }, [cars, stations, customers, payments]);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Quick Stats</SidebarGroupLabel>
      <div className='px-2 py-1 space-y-2'>
        <div className='flex items-center justify-between text-sm'>
          <div className='flex items-center gap-2'>
            <CheckCircle className='h-3 w-3 text-green-500' />
            <span className='text-muted-foreground'>Available Cars</span>
          </div>
          <Badge variant='secondary'>{stats.availableCars}</Badge>
        </div>
        <div className='flex items-center justify-between text-sm'>
          <div className='flex items-center gap-2'>
            <Clock className='h-3 w-3 text-blue-500' />
            <span className='text-muted-foreground'>Rented Cars</span>
          </div>
          <Badge variant='secondary'>{stats.rentedCars}</Badge>
        </div>
        <div className='flex items-center justify-between text-sm'>
          <div className='flex items-center gap-2'>
            <Wrench className='h-3 w-3 text-orange-500' />
            <span className='text-muted-foreground'>Maintenance</span>
          </div>
          <Badge variant='secondary'>{stats.maintenanceCars}</Badge>
        </div>
        <div className='flex items-center justify-between text-sm'>
          <div className='flex items-center gap-2'>
            <Users className='h-3 w-3 text-purple-500' />
            <span className='text-muted-foreground'>Pending Check-ins</span>
          </div>
          <Badge
            variant={stats.pendingCheckIns > 0 ? 'destructive' : 'secondary'}
          >
            {stats.pendingCheckIns}
          </Badge>
        </div>
        <div className='flex items-center justify-between text-sm'>
          <div className='flex items-center gap-2'>
            <CreditCard className='h-3 w-3 text-green-600' />
            <span className='text-muted-foreground'>Pending Payments</span>
          </div>
          <Badge
            variant={stats.pendingPayments > 0 ? 'destructive' : 'secondary'}
          >
            {stats.pendingPayments}
          </Badge>
        </div>
        <div className='flex items-center justify-between text-sm'>
          <div className='flex items-center gap-2'>
            <MapPin className='h-3 w-3 text-indigo-500' />
            <span className='text-muted-foreground'>Active Stations</span>
          </div>
          <Badge variant='secondary'>{stats.activeStations}</Badge>
        </div>
      </div>
    </SidebarGroup>
  );
}

function StaffUser({ staff }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const handleLogout = async () => {
    try {
      await apiClient.post(endpoints.auth.logout());
    } catch {
      // ignore error; proceed to clear local state
    } finally {
      logout();
      navigate('/');
    }
  };
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <Avatar className='h-8 w-8 rounded-lg'>
                <AvatarImage src={staff.avatar} alt={staff.name} />
                <AvatarFallback className='rounded-lg'>
                  {staff.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>{staff.name}</span>
                <span className='truncate text-xs text-muted-foreground'>
                  {staff.role}
                </span>
              </div>
              <ChevronUp className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg z-50'
            side='bottom'
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarImage src={staff.avatar} alt={staff.name} />
                  <AvatarFallback className='rounded-lg'>
                    {staff.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>{staff.name}</span>
                  <span className='truncate text-xs text-muted-foreground'>
                    {staff.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User2 className='mr-2 h-4 w-4' />
                {t('staffSidebar.profile')}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Calendar className='mr-2 h-4 w-4' />
                {t('staffSidebar.schedule')}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className='mr-2 h-4 w-4' />
                {t('staffSidebar.settings')}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <span className='mr-2 h-4 w-4' />
              {t('staffSidebar.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function StaffSidebar({
  staff,
  activeTab,
  setActiveTab,
  menuItems,
  ...props
}) {
  const { t } = useTranslation();
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
                <Car className='h-5 w-5' />
                <span className='text-base font-semibold'>EV Staff Portal</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className='[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-border/80'>
        <SidebarGroup>
          <SidebarGroupLabel>{t('staffSidebar.navigation')}</SidebarGroupLabel>
          <SidebarMenu>
            {menuItems.map(item => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => setActiveTab(item.id)}
                  isActive={activeTab === item.id}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <StaffUser staff={staff || data.staff} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
