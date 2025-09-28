import * as React from 'react';
import {
  Car,
  MapPin,
  Users,
  CreditCard,
  Menu,
  X,
  Battery,
  Wrench,
  CheckCircle,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { toast } from 'sonner';
import { Button } from '../../shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../shared/components/ui/card';
import { Badge } from '../../shared/components/ui/badge';
import { ThemeToggle } from '../../shared/components/homepage/ThemeToggle';

// Mock data for demonstration
const mockStaffData = {
  id: 'STAFF001',
  name: 'John Smith',
  email: 'john.smith@company.com',
  role: 'Station Manager',
  station: 'Downtown Station',
  avatar: '/api/placeholder/32/32',
  shift: 'Morning (6AM - 2PM)',
  status: 'Active',
};

const mockCarData = [
  {
    id: 'CAR001',
    model: 'Tesla Model 3',
    licensePlate: 'EV-123-ABC',
    station: 'Downtown Station',
    status: 'Available',
    batteryLevel: 85,
  },
  {
    id: 'CAR002',
    model: 'Nissan Leaf',
    licensePlate: 'EV-456-DEF',
    station: 'Airport Station',
    status: 'Rented',
    batteryLevel: 62,
  },
  {
    id: 'CAR003',
    model: 'BMW i3',
    licensePlate: 'EV-789-GHI',
    station: 'Mall Station',
    status: 'Maintenance',
    batteryLevel: 0,
  },
];

const mockStationData = {
  id: 'STATION001',
  name: 'Downtown Station',
  address: '123 Main St, New York, NY 10001',
  availableSpots: 12,
  capacity: 20,
  chargingPorts: 15,
  activeChargingPorts: 8,
};

const mockCustomerData = [
  {
    id: 'CUST001',
    name: 'Alice Johnson',
    currentBooking: 'BOOK001',
    status: 'Active',
  },
  {
    id: 'CUST002',
    name: 'Bob Wilson',
    currentBooking: null,
    status: 'Pending Check-in',
  },
];

const mockPaymentData = [
  {
    id: 'PAY001',
    customer: 'Alice Johnson',
    amount: 245.5,
    status: 'Completed',
  },
  {
    id: 'PAY002',
    customer: 'Bob Wilson',
    amount: 120.75,
    status: 'Pending',
  },
];

export default function StaffDashboard() {
  const { logout: authLogout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('dashboard');

  const handleLogout = async () => {
    try {
      // In a real app, you would call your logout API endpoint here
      // For now, we'll just clear the auth state
      console.log('Logging out...');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authLogout();
      toast.success('Logged out successfully');
      navigate('/');
    }
  };

  const CarStatusBadge = ({ status }) => {
    const statusConfig = {
      Available: { variant: 'default', icon: CheckCircle },
      Rented: { variant: 'secondary', icon: Car },
      Maintenance: { variant: 'destructive', icon: Wrench },
    };

    const config = statusConfig[status] || statusConfig.Available;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className='gap-1'>
        <Icon className='h-3 w-3' />
        {status}
      </Badge>
    );
  };

  const renderDashboard = () => (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>Staff Dashboard</h1>
        <p className='text-muted-foreground'>
          Welcome back, {mockStaffData.name}. Your shift: {mockStaffData.shift}
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Available Cars
            </CardTitle>
            <Car className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {mockCarData.filter(car => car.status === 'Available').length}
            </div>
            <p className='text-xs text-muted-foreground'>Ready for rental</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Active Rentals
            </CardTitle>
            <Car className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {mockCarData.filter(car => car.status === 'Rented').length}
            </div>
            <p className='text-xs text-muted-foreground'>Currently in use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Maintenance</CardTitle>
            <Wrench className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {mockCarData.filter(car => car.status === 'Maintenance').length}
            </div>
            <p className='text-xs text-muted-foreground'>Vehicles in service</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Pending Payments
            </CardTitle>
            <CreditCard className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {
                mockPaymentData.filter(payment => payment.status === 'Pending')
                  .length
              }
            </div>
            <p className='text-xs text-muted-foreground'>Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-2 gap-3'>
            <Button onClick={() => setActiveTab('cars')}>Manage Cars</Button>
            <Button variant='outline' onClick={() => setActiveTab('customers')}>
              Customer Service
            </Button>
            <Button variant='outline' onClick={() => setActiveTab('payments')}>
              Process Payments
            </Button>
            <Button variant='outline' onClick={() => setActiveTab('stations')}>
              Station Info
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center'>
                <div className='ml-4 space-y-1'>
                  <p className='text-sm font-medium'>New booking confirmed</p>
                  <p className='text-sm text-muted-foreground'>
                    Alice Johnson booked Tesla Model 3
                  </p>
                </div>
                <div className='ml-auto text-sm text-muted-foreground'>
                  10m ago
                </div>
              </div>
              <div className='flex items-center'>
                <div className='ml-4 space-y-1'>
                  <p className='text-sm font-medium'>Car returned</p>
                  <p className='text-sm text-muted-foreground'>
                    Nissan Leaf returned at Downtown Station
                  </p>
                </div>
                <div className='ml-auto text-sm text-muted-foreground'>
                  25m ago
                </div>
              </div>
              <div className='flex items-center'>
                <div className='ml-4 space-y-1'>
                  <p className='text-sm font-medium'>Maintenance completed</p>
                  <p className='text-sm text-muted-foreground'>
                    BMW i3 maintenance finished
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

  const renderCars = () => (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>Car Management</h1>
        <p className='text-muted-foreground'>
          Manage vehicle availability and status
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {mockCarData.map(car => (
              <div
                key={car.id}
                className='flex items-center justify-between p-4 border rounded-lg bg-card'
              >
                <div className='flex items-center space-x-4'>
                  <div>
                    <p className='font-medium'>{car.model}</p>
                    <p className='text-sm text-muted-foreground'>
                      {car.licensePlate}
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-4'>
                  <div className='text-right'>
                    <p className='text-sm text-muted-foreground'>Battery</p>
                    <div className='flex items-center'>
                      <Battery className='h-4 w-4 mr-1 text-muted-foreground' />
                      <span>{car.batteryLevel}%</span>
                    </div>
                  </div>
                  <CarStatusBadge status={car.status} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className='flex space-x-3'>
        <Button>Add New Car</Button>
        <Button variant='outline'>Update Status</Button>
        <Button variant='outline'>Process Return</Button>
      </div>
    </div>
  );

  const renderStations = () => (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>Station Management</h1>
        <p className='text-muted-foreground'>
          Manage station information and capacity
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{mockStationData.name}</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <p className='text-sm text-muted-foreground'>Address</p>
            <p>{mockStationData.address}</p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='p-4 border rounded-lg bg-card'>
              <p className='text-sm text-muted-foreground'>Parking Spots</p>
              <p className='text-2xl font-bold'>
                {mockStationData.availableSpots}/{mockStationData.capacity}
              </p>
            </div>
            <div className='p-4 border rounded-lg bg-card'>
              <p className='text-sm text-muted-foreground'>Charging Ports</p>
              <p className='text-2xl font-bold'>
                {mockStationData.activeChargingPorts}/
                {mockStationData.chargingPorts}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCustomers = () => (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>Customer Service</h1>
        <p className='text-muted-foreground'>
          Manage customer interactions and check-ins
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {mockCustomerData.map(customer => (
              <div
                key={customer.id}
                className='flex items-center justify-between p-4 border rounded-lg bg-card'
              >
                <div>
                  <p className='font-medium'>{customer.name}</p>
                  <p className='text-sm text-muted-foreground'>
                    {customer.currentBooking
                      ? `Booking: ${customer.currentBooking}`
                      : 'No active booking'}
                  </p>
                </div>
                <Badge
                  variant={
                    customer.status === 'Active' ? 'default' : 'secondary'
                  }
                >
                  {customer.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPayments = () => (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>Payment Management</h1>
        <p className='text-muted-foreground'>
          Process payments and handle billing
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {mockPaymentData.map(payment => (
              <div
                key={payment.id}
                className='flex items-center justify-between p-4 border rounded-lg bg-card'
              >
                <div>
                  <p className='font-medium'>{payment.customer}</p>
                  <p className='text-sm text-muted-foreground'>
                    Payment ID: {payment.id}
                  </p>
                </div>
                <div className='flex items-center space-x-4'>
                  <p className='font-medium'>${payment.amount}</p>
                  <Badge
                    variant={
                      payment.status === 'Completed' ? 'default' : 'secondary'
                    }
                  >
                    {payment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'cars':
        return renderCars();
      case 'stations':
        return renderStations();
      case 'customers':
        return renderCustomers();
      case 'payments':
        return renderPayments();
      default:
        return renderDashboard();
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Car className='h-4 w-4' /> },
    { id: 'cars', label: 'Car Management', icon: <Car className='h-4 w-4' /> },
    { id: 'stations', label: 'Stations', icon: <MapPin className='h-4 w-4' /> },
    {
      id: 'customers',
      label: 'Customers',
      icon: <Users className='h-4 w-4' />,
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: <CreditCard className='h-4 w-4' />,
    },
  ];

  return (
    <div className='flex h-screen bg-background'>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className='flex flex-col h-full'>
          {/* Sidebar header */}
          <div className='flex items-center justify-between p-4 border-b border-sidebar-border'>
            <div className='flex items-center space-x-2'>
              <Car className='h-6 w-6 text-sidebar-primary' />
              <span className='text-lg font-bold text-sidebar-foreground'>
                EV Staff
              </span>
            </div>
            <button className='md:hidden' onClick={() => setSidebarOpen(false)}>
              <X className='h-5 w-5 text-sidebar-foreground' />
            </button>
          </div>

          {/* Staff info */}
          <div className='p-4 border-b border-sidebar-border'>
            <p className='font-semibold text-sidebar-foreground'>
              {mockStaffData.name}
            </p>
            <p className='text-sm text-sidebar-accent-foreground'>
              {mockStaffData.role}
            </p>
            <p className='text-xs text-sidebar-accent-foreground'>
              {mockStaffData.station}
            </p>
          </div>

          {/* Navigation */}
          <nav className='flex-1 p-2 overflow-y-auto'>
            <ul className='space-y-1'>
              {menuItems.map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${
                      activeTab === item.id
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout button */}
          <div className='p-2 border-t border-sidebar-border'>
            <Button
              variant='ghost'
              className='w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50'
              onClick={handleLogout}
            >
              <LogOut className='h-4 w-4 mr-3' />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        {/* Header */}
        <header className='bg-card border-b'>
          <div className='flex items-center justify-between p-4'>
            <div className='flex items-center'>
              <button
                className='md:hidden mr-3'
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className='h-6 w-6' />
              </button>
              <h1 className='text-lg font-semibold capitalize'>
                {activeTab.replace('-', ' ')}
              </h1>
            </div>
            <div className='flex items-center space-x-3'>
              <ThemeToggle />
              <Badge variant='secondary'>{mockStaffData.station}</Badge>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
