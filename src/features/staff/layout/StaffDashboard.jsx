import {
  Bell,
  Car,
  FileText,
  LayoutDashboard,
  Users,
  Wrench,
} from 'lucide-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../shared/components/ui/card';
import {
  SidebarInset,
  SidebarProvider,
} from '../../shared/components/ui/sidebar';
import { endpoints } from '../../shared/lib/endpoints';
import { NotificationPreferences } from '../components/NotificationPreferences';
import ReturnCar from '../components/ReturnCar';
import BookingManagement from '../components/booking-management';
import VehicleManagement from '../components/car-management';
import { CheckInPage } from '../components/checkIn.jsx/CheckInPage.jsx';
import { CustomerManagement } from '../components/customer-management';
import DocumentVerification from '../components/document-verification';
import { PaymentManagement } from '../components/payment-management';
import { StaffHeader } from '../components/staff-header';
import { StaffSidebar } from '../components/staff-sidebar';
import StationManagement from '../components/station-management';

// Removed QuickVerification import

// const mockStaffData = [
//   {
//     id: 'STAFF001',
//     name: 'John Smith',
//     email: 'john.smith@company.com',
//     role: 'Station Manager',
//     station: 'Downtown Station',
//     avatar: '/api/placeholder/32/32',
//     shift: 'Morning (6AM - 2PM)',
//     status: 'Active',
//     permissions: ['car_management', 'customer_service', 'payment_processing'],
//   },
//   {
//     id: 'STAFF002',
//     name: 'Sarah Johnson',
//     email: 'sarah.j@company.com',
//     role: 'Customer Service Rep',
//     station: 'Airport Station',
//     avatar: '/api/placeholder/32/32',
//     shift: 'Evening (2PM - 10PM)',
//     status: 'Active',
//     permissions: ['customer_service', 'payment_processing'],
//   },
//   {
//     id: 'STAFF003',
//     name: 'Mike Chen',
//     email: 'mike.chen@company.com',
//     role: 'Maintenance Tech',
//     station: 'Mall Station',
//     avatar: '/api/placeholder/32/32',
//     shift: 'Night (10PM - 6AM)',
//     status: 'Off Duty',
//     permissions: ['car_management'],
//   },
// ];

// const mockCarData = [
//   {
//     id: 'CAR001',
//     model: 'Tesla Model 3',
//     licensePlate: 'EV-123-ABC',
//     station: 'Downtown Station',
//     status: 'Available',
//     batteryLevel: 85,
//     mileage: 25430,
//     lastService: '2024-01-15',
//     currentBooking: null,
//     location: { lat: 40.7128, lng: -74.006 },
//   },
//   {
//     id: 'CAR002',
//     model: 'Nissan Leaf',
//     licensePlate: 'EV-456-DEF',
//     station: 'Airport Station',
//     status: 'Rented',
//     batteryLevel: 62,
//     mileage: 18750,
//     lastService: '2024-01-10',
//     currentBooking: {
//       id: 'BOOK001',
//       customer: 'Alice Johnson',
//       startTime: '2024-01-20T09:00:00Z',
//       endTime: '2024-01-22T18:00:00Z',
//       pickupLocation: 'Airport Station',
//       dropoffLocation: 'Downtown Station',
//     },
//     location: { lat: 40.6892, lng: -74.1745 },
//   },
//   {
//     id: 'CAR003',
//     model: 'BMW i3',
//     licensePlate: 'EV-789-GHI',
//     station: 'Mall Station',
//     status: 'Maintenance',
//     batteryLevel: 0,
//     mileage: 32100,
//     lastService: '2024-01-18',
//     currentBooking: null,
//     location: { lat: 40.7282, lng: -73.7949 },
//   },
// ];

const mockStationData = [
  {
    id: 'STATION001',
    name: 'Downtown Station',
    address: '123 Main St, New York, NY 10001',
    coordinates: { lat: 40.7128, lng: -74.006 },
    capacity: 20,
    availableSpots: 12,
    chargingPorts: 15,
    activeChargingPorts: 8,
    staff: ['John Smith', 'Maria Garcia'],
    operatingHours: '24/7',
    status: 'Active',
    amenities: ['WiFi', 'Restrooms', 'Vending Machines', 'Waiting Area'],
  },
  {
    id: 'STATION002',
    name: 'Airport Station',
    address: '456 Airport Rd, Queens, NY 11430',
    coordinates: { lat: 40.6892, lng: -74.1745 },
    capacity: 35,
    availableSpots: 22,
    chargingPorts: 25,
    activeChargingPorts: 13,
    staff: ['Sarah Johnson', 'David Kim'],
    operatingHours: '5:00 AM - 11:00 PM',
    status: 'Active',
    amenities: ['WiFi', 'Restrooms', 'Food Court', 'Shuttle Service'],
  },
  {
    id: 'STATION003',
    name: 'Mall Station',
    address: '789 Shopping Center Dr, Brooklyn, NY 11201',
    coordinates: { lat: 40.7282, lng: -73.7949 },
    capacity: 15,
    availableSpots: 8,
    chargingPorts: 12,
    activeChargingPorts: 4,
    staff: ['Mike Chen'],
    operatingHours: '10:00 AM - 10:00 PM',
    status: 'Maintenance',
    amenities: ['WiFi', 'Restrooms', 'Shopping', 'Food Court'],
  },
];

const mockCustomerData = [
  {
    id: 'CUST001',
    name: 'Alice Johnson',
    email: 'alice.johnson@email.com',
    phone: '+1-555-0123',
    licenseNumber: 'NY123456789',
    licenseExpiry: '2026-08-15',
    membershipType: 'Premium',
    joinDate: '2023-03-15',
    totalBookings: 28,
    status: 'Active',
    currentBooking: {
      id: 'BOOK001',
      car: 'Tesla Model 3 (EV-123-ABC)',
      startTime: '2024-01-20T09:00:00Z',
      endTime: '2024-01-22T18:00:00Z',
    },
    verificationStatus: {
      identity: 'Verified',
      license: 'Verified',
      payment: 'Verified',
    },
  },
  {
    id: 'CUST002',
    name: 'Bob Wilson',
    email: 'bob.wilson@email.com',
    phone: '+1-555-0456',
    licenseNumber: 'NY987654321',
    licenseExpiry: '2025-12-20',
    membershipType: 'Standard',
    joinDate: '2023-07-22',
    totalBookings: 15,
    status: 'Pending Check-in',
    currentBooking: null,
    verificationStatus: {
      identity: 'Verified',
      license: 'Pending',
      payment: 'Verified',
    },
  },
];

const mockPaymentData = [
  {
    id: 'PAY001',
    bookingId: 'BOOK001',
    customer: 'Alice Johnson',
    amount: 245.5,
    currency: 'USD',
    method: 'Credit Card',
    status: 'Completed',
    transactionDate: '2024-01-20T09:15:00Z',
    dueDate: '2024-01-22T18:00:00Z',
    description: 'Tesla Model 3 rental - 3 days',
    breakdown: {
      baseRate: 180.0,
      insurance: 45.0,
      taxes: 20.5,
    },
  },
  {
    id: 'PAY002',
    bookingId: 'BOOK002',
    customer: 'Bob Wilson',
    amount: 120.75,
    currency: 'USD',
    method: 'Debit Card',
    status: 'Pending',
    transactionDate: '2024-01-21T14:30:00Z',
    dueDate: '2024-01-23T12:00:00Z',
    description: 'Nissan Leaf rental - 2 days',
    breakdown: {
      baseRate: 90.0,
      insurance: 22.5,
      taxes: 8.25,
    },
  },
  {
    id: 'PAY003',
    bookingId: 'BOOK003',
    customer: 'Carol Davis',
    amount: 89.99,
    currency: 'USD',
    method: 'Digital Wallet',
    status: 'Failed',
    transactionDate: '2024-01-19T16:45:00Z',
    dueDate: '2024-01-21T10:00:00Z',
    description: 'BMW i3 rental - 1 day',
    breakdown: {
      baseRate: 70.0,
      insurance: 15.0,
      taxes: 4.99,
    },
  },
];

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const { t } = useTranslation();
  const [carData, setCarData] = React.useState([]);
  const [staffData, setStaffData] = React.useState(null);

  // Fetch vehicles
  React.useEffect(() => {
    fetch(endpoints.vehicles.getAll())
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data && Array.isArray(json.data.vehicles)) {
          setCarData(json.data.vehicles);
        }
      });
  }, []);

  // Fetch staff info (current logged-in user)
  React.useEffect(() => {
    fetch(endpoints.auth.me())
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data && json.data.user) {
          setStaffData(json.data.user);
        }
      });
  }, []);

  const renderDashboard = () => (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>{t('dashboard.title')}</h1>
        <p className='text-muted-foreground'>
          {/* {t('dashboard.welcome', {
            name: mockStaffData[0].name,
            shift: mockStaffData[0].shift,
          })} */}
          {t('dashboard.welcome', {
            name: staffData?.name || '',
            shift: '', // No shift info from API, leave blank or add if available
          })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('dashboard.availableCars')}
            </CardTitle>
            <Car className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            {/* <div className='text-2xl font-bold'>
              {mockCarData.filter(car => car.status === 'Available').length}
            </div> */}
            <div className='text-2xl font-bold'>
              {carData.filter(car => car.status === 'AVAILABLE').length}
            </div>
            <p className='text-xs text-muted-foreground'>
              {t('dashboard.availableCarsSub')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('dashboard.activeRentals')}
            </CardTitle>
            <Car className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            {/* <div className='text-2xl font-bold'>
              {mockCarData.filter(car => car.status === 'Rented').length}
            </div> */}
            <div className='text-2xl font-bold'>
              {carData.filter(car => car.status === 'RENTED').length}
            </div>
            <p className='text-xs text-muted-foreground'>
              {t('dashboard.activeRentalsSub')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('dashboard.maintenance')}
            </CardTitle>
            <Wrench className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            {/* <div className='text-2xl font-bold'>
              {mockCarData.filter(car => car.status === 'Maintenance').length}
            </div> */}
            <div className='text-2xl font-bold'>
              {carData.filter(car => car.status === 'MAINTENANCE').length}
            </div>
            <p className='text-xs text-muted-foreground'>
              {t('dashboard.maintenanceSub')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('dashboard.pendingVerifications')}
            </CardTitle>
            <FileText className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>12</div>
            <p className='text-xs text-muted-foreground'>
              {t('dashboard.pendingVerificationsSub')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.quickActions')}</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-2 gap-3'>
            <Button onClick={() => setActiveTab('bookings')}>
              Manage Bookings
            </Button>
            <Button variant='outline' onClick={() => setActiveTab('cars')}>
              {t('dashboard.manageCars')}
            </Button>
            <Button variant='outline' onClick={() => setActiveTab('customers')}>
              {t('dashboard.customerService')}
            </Button>
            <Button variant='outline' onClick={() => setActiveTab('payments')}>
              {t('dashboard.processPayments')}
            </Button>
            <Button variant='outline' onClick={() => setActiveTab('returnCar')}>
              {t('staff.returnCar.quickAction')}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center'>
                <div className='ml-4 space-y-1'>
                  <p className='text-sm font-medium'>
                    {t('dashboard.newBookingConfirmed')}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {t('dashboard.bookingDetails', {
                      customer: 'Alice Johnson',
                      car: 'Tesla Model 3',
                    })}
                  </p>
                </div>
                <div className='ml-auto text-sm text-muted-foreground'>
                  10m ago
                </div>
              </div>
              <div className='flex items-center'>
                <div className='ml-4 space-y-1'>
                  <p className='text-sm font-medium'>
                    {t('dashboard.documentVerified')}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {t('dashboard.documentDetails', {
                      customer: 'John Doe',
                      document: "driver's license",
                    })}
                  </p>
                </div>
                <div className='ml-auto text-sm text-muted-foreground'>
                  25m ago
                </div>
              </div>
              <div className='flex items-center'>
                <div className='ml-4 space-y-1'>
                  <p className='text-sm font-medium'>
                    {t('dashboard.carReturned')}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {t('dashboard.carReturnDetails', {
                      car: 'Nissan Leaf',
                      location: 'Downtown Station',
                    })}
                  </p>
                </div>
                <div className='ml-auto text-sm text-muted-foreground'>
                  1h ago
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
  const renderCheckIn = () => {
    return <CheckInPage />;
  };
  const renderCars = () => {
    return <VehicleManagement />;
  };

  const renderStations = () => {
    return <StationManagement />;
  };

  const renderCustomers = () => {
    return <CustomerManagement />;
  };

  const renderPayments = () => {
    return <PaymentManagement />;
  };

  const renderBookings = () => {
    return <BookingManagement />;
  };
  const renderReturnCar = () => {
    return <ReturnCar />;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'check-in':
        return renderCheckIn();
      case 'cars':
        return renderCars();
      case 'stations':
        return renderStations();
      case 'customers':
        return renderCustomers();
      case 'payments':
        return renderPayments();
      case 'bookings':
        return renderBookings();
      case 'returnCar':
        return renderReturnCar();
      case 'documents':
        return <DocumentVerification />;
      case 'notifications':
        return <NotificationPreferences />;
      // Removed quick-verify case

      default:
        return renderDashboard();
    }
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className='h-4 w-4' />,
    },
    {
      id: 'operations',
      label: 'Operations',
      icon: <Car className='h-4 w-4' />,
      items: [
        {
          id: 'bookings',
          label: 'Booking Management',
        },
        {
          id: 'check-in',
          label: 'Check-In',
        },
        {
          id: 'returnCar',
          label: 'Return Car',
        },
      ],
    },

    {
      id: 'vehicle-management',
      label: 'Vehicle Management',
      icon: <Car className='h-4 w-4' />,
      items: [
        {
          id: 'cars',
          label: 'Car Management',
        },
        {
          id: 'stations',
          label: 'Stations',
        },
      ],
    },
    {
      id: 'customer-service',
      label: 'Customer Service',
      icon: <Users className='h-4 w-4' />,
      items: [
        {
          id: 'customers',
          label: 'Customers',
        },
        {
          id: 'documents',
          label: 'Document Verification',
        },
      ],
    },
    // {
    //   id: 'payments',
    //   label: 'Payments',
    //   icon: <CreditCard className='h-4 w-4' />,
    // },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className='h-4 w-4' />,
    },
    // Removed quick-verify menu item
  ];

  return (
    <SidebarProvider>
      <StaffSidebar
        // staff={mockStaffData[0]}
        // cars={mockCarData}
        staff={staffData}
        cars={carData}
        stations={mockStationData}
        customers={mockCustomerData}
        payments={mockPaymentData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        menuItems={menuItems.map(item => ({
          ...item,
          label: t(`staffSidebar.${item.id}`),
          items: item.items?.map(subItem => ({
            ...subItem,
            label: t(`staffSidebar.${subItem.id}`),
          })),
        }))}
      />
      <SidebarInset>
        {/* Header có thêm Language Toggle */}
        <div className='flex justify-between items-center px-4 py-2 border-b'>
          <StaffHeader />
        </div>

        <div className='flex flex-1 flex-col gap-4 p-4'>{renderContent()}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
