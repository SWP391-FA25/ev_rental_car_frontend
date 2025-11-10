import {
  Bell,
  Car,
  CarFront,
  FileText,
  LayoutDashboard,
  Users,
  Wrench,
  TrendingUp,
} from 'lucide-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ChartBarDefault } from '../../admin/components/barchart-revenue';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../shared/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../shared/components/ui/table';
import { Badge } from '../../shared/components/ui/badge';
import { formatCurrency } from '../../shared/lib/utils';
import {
  SidebarInset,
  SidebarProvider,
} from '../../shared/components/ui/sidebar';
import { endpoints } from '../../shared/lib/endpoints';
import { apiClient } from '../../shared/lib/apiClient';
import { NotificationPreferences } from '../components/NotificationPreferences';
import BookingManagement from '../components/booking-management';
import VehicleManagement from '../components/car-management';
import CheckInCar from '../components/CheckInCar';
import { CustomerManagement } from '../components/customer-management';
import DocumentVerification from '../components/document-verification';
import { PaymentManagement } from '../components/payment-management';
import { StaffHeader } from '../components/staff-header';
import { StaffSidebar } from '../components/staff-sidebar';
import StationManagement from '../components/station-management';
import ReturnCar from '../components/ReturnCar';
import { ContractUploadPage } from '../components/UploadContract/contract-upload-page';
import StaffProfileLayout from './StaffProfileLayout';

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

// Removed mock data: stations, customers, and payments

export default function StaffDashboard() {
  const { t } = useTranslation();
  const [carData, setCarData] = React.useState([]);
  const [staffData, setStaffData] = React.useState(null);
  const [analytics, setAnalytics] = React.useState({
    revenue: 0,
    rentedCount: 0,
  });
  const [revenueGrowth, setRevenueGrowth] = React.useState(0);
  const [popularVehicles, setPopularVehicles] = React.useState([]);
  const [activeCustomersCount, setActiveCustomersCount] = React.useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = React.useState(Array(12).fill(0));
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = React.useState(currentYear);
  const [activeCustomersGrowth, setActiveCustomersGrowth] = React.useState(0);
  const [rentedGrowth, setRentedGrowth] = React.useState(0);
  const [maintenanceGrowth, setMaintenanceGrowth] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState('dashboard');

  // Fetch vehicles
  React.useEffect(() => {
    const loadVehicles = async () => {
      try {
        const res = await apiClient.get(endpoints.vehicles.getAll());
        if (res.success && Array.isArray(res.data?.vehicles)) {
          setCarData(res.data.vehicles);
        } else {
          setCarData([]);
        }
      } catch (err) {
        setCarData([]);
      }
    };
    loadVehicles();
  }, []);

  // Compute revenue growth (%): compare current month vs last month from COMPLETED bookings
  React.useEffect(() => {
    const computeRevenueGrowth = async () => {
      try {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1
        );
        const lastMonthEnd = new Date(
          now.getFullYear(),
          now.getMonth(),
          0,
          23,
          59,
          59
        );

        let page = 1;
        const limit = 100;
        const all = [];
        while (true) {
          const res = await apiClient.get(endpoints.bookings.getAll(), {
            params: {
              status: 'COMPLETED',
              page,
              limit,
              startDate: lastMonthStart.toISOString(),
              endDate: now.toISOString(),
            },
          });
          const pageBookings = Array.isArray(res?.data?.bookings)
            ? res.data.bookings
            : [];
          all.push(...pageBookings);
          const pagination = res?.data?.pagination;
          const currentPage = Number(pagination?.currentPage || page);
          const totalPages = Number(pagination?.totalPages || page);
          if (currentPage >= totalPages || pageBookings.length === 0) break;
          page += 1;
        }

        const getDate = b =>
          new Date(b.actualEndTime || b.endTime || b.updatedAt || b.createdAt);

        const monthRevenue = all
          .filter(b => {
            const d = getDate(b);
            return d >= monthStart && d <= now;
          })
          .reduce((sum, b) => {
            const base = Number(b.basePrice || 0);
            const insurance = Number(b.insuranceAmount || 0);
            const discount = Number(b.discountAmount || 0);
            return sum + (base + insurance - discount);
          }, 0);

        const lastMonthRevenue = all
          .filter(b => {
            const d = getDate(b);
            return d >= lastMonthStart && d <= lastMonthEnd;
          })
          .reduce((sum, b) => {
            const base = Number(b.basePrice || 0);
            const insurance = Number(b.insuranceAmount || 0);
            const discount = Number(b.discountAmount || 0);
            return sum + (base + insurance - discount);
          }, 0);

        const growth =
          lastMonthRevenue === 0
            ? monthRevenue > 0
              ? 100
              : 0
            : Math.round(
                ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
              );
        setRevenueGrowth(growth);
      } catch (_) {
        setRevenueGrowth(0);
      }
    };
    computeRevenueGrowth();
  }, []);

  // Fetch staff info (current logged-in user)
  React.useEffect(() => {
    const loadMe = async () => {
      try {
        const res = await apiClient.get(endpoints.auth.me());
        if (res.success && res.data?.user) {
          setStaffData(res.data.user);
        }
      } catch (_) {}
    };
    loadMe();
  }, []);

  // Try to fetch booking analytics for revenue and counts; fallback to local compute
  React.useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const startOfYear = new Date(selectedYear, 0, 1);
        const endOfRange =
          selectedYear === currentYear
            ? new Date()
            : new Date(selectedYear, 11, 31, 23, 59, 59);
        const res = await apiClient.get(endpoints.bookings.getAnalytics(), {
          params: {
            startDate: startOfYear.toISOString(),
            endDate: endOfRange.toISOString(),
          },
        });
        const summary = res?.data?.summary || {};
        const statusBreakdown = res?.data?.statusBreakdown || {};
        const popularRaw = Array.isArray(res?.data?.popularVehicles)
          ? res.data.popularVehicles
          : [];
        const popular = [...popularRaw].sort(
          (a, b) => (b.bookingCount || 0) - (a.bookingCount || 0)
        );
        setAnalytics(prev => ({
          ...prev,
          revenue: summary.totalRevenue || prev.revenue || 0,
          rentedCount: statusBreakdown.in_progress || 0,
        }));
        setPopularVehicles(popular);
      } catch (_) {}
    };
    loadAnalytics();
  }, [selectedYear]);

  // Compute total revenue for the card using Admin formula across all COMPLETED bookings
  React.useEffect(() => {
    const computeTotalRevenue = async () => {
      try {
        let page = 1;
        const limit = 100;
        let total = 0;
        while (true) {
          const res = await apiClient.get(endpoints.bookings.getAll(), {
            params: {
              status: 'COMPLETED',
              page,
              limit,
            },
          });
          const pageBookings = Array.isArray(res?.data?.bookings)
            ? res.data.bookings
            : [];
          total += pageBookings.reduce((sum, b) => {
            const base = Number(b.basePrice || 0);
            const insurance = Number(b.insuranceAmount || 0);
            const discount = Number(b.discountAmount || 0);
            return sum + (base + insurance - discount);
          }, 0);
          const pagination = res?.data?.pagination;
          const currentPage = Number(pagination?.currentPage || page);
          const totalPages = Number(pagination?.totalPages || page);
          if (currentPage >= totalPages || pageBookings.length === 0) break;
          page += 1;
        }
        setAnalytics(prev => ({ ...prev, revenue: total }));
      } catch (_) {
        // keep current revenue
      }
    };
    computeTotalRevenue();
  }, []);

  // Active customers via renters API
  React.useEffect(() => {
    const loadRenters = async () => {
      try {
        const res = await apiClient.get(endpoints.renters.getAll());
        const renters = Array.isArray(res?.data?.renters)
          ? res.data.renters
          : [];
        const active = renters.filter(r => r.accountStatus === 'ACTIVE').length;
        setActiveCustomersCount(active);
      } catch (_) {
        setActiveCustomersCount(0);
      }
    };
    loadRenters();
  }, []);

  // Growth for Active Customers and Rented using IN_PROGRESS bookings month-over-month
  React.useEffect(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59
    );

    const fetchRange = async (start, end) => {
      let page = 1;
      const limit = 100;
      const all = [];
      while (true) {
        const res = await apiClient.get(endpoints.bookings.getAll(), {
          params: {
            status: 'IN_PROGRESS',
            page,
            limit,
            startDate: start.toISOString(),
            endDate: end.toISOString(),
          },
        });
        const pageBookings = Array.isArray(res?.data?.bookings)
          ? res.data.bookings
          : [];
        all.push(...pageBookings);
        const pagination = res?.data?.pagination;
        const currentPage = Number(pagination?.currentPage || page);
        const totalPages = Number(pagination?.totalPages || page);
        if (currentPage >= totalPages || pageBookings.length === 0) break;
        page += 1;
      }
      return all;
    };

    const run = async () => {
      try {
        const current = await fetchRange(monthStart, now);
        const last = await fetchRange(lastMonthStart, lastMonthEnd);

        // Active customers growth: distinct renterId/customerId
        const getCustomerId = b => b.renterId || b.customerId || b.userId;
        const currentActiveCustomers = new Set(
          current.map(getCustomerId).filter(Boolean)
        ).size;
        const lastActiveCustomers = new Set(
          last.map(getCustomerId).filter(Boolean)
        ).size;
        const growthActive =
          lastActiveCustomers === 0
            ? currentActiveCustomers > 0
              ? 100
              : 0
            : Math.round(
                ((currentActiveCustomers - lastActiveCustomers) /
                  lastActiveCustomers) *
                  100
              );
        setActiveCustomersGrowth(growthActive);

        // Rented growth: number of IN_PROGRESS bookings
        const currentRented = current.length;
        const lastRented = last.length;
        const growthRented =
          lastRented === 0
            ? currentRented > 0
              ? 100
              : 0
            : Math.round(((currentRented - lastRented) / lastRented) * 100);
        setRentedGrowth(growthRented);
      } catch (_) {
        setActiveCustomersGrowth(0);
        setRentedGrowth(0);
      }
    };
    run();
  }, []);

  // Maintenance growth: compare MAINTENANCE cars updated/serviced month-over-month
  React.useEffect(() => {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59
      );

      const getDate = v => new Date(v.updatedAt || v.lastService || 0);
      const isMaint = v => (v.status || '').toUpperCase() === 'MAINTENANCE';

      const currentMaint = carData.filter(
        v => isMaint(v) && getDate(v) >= monthStart && getDate(v) <= now
      ).length;
      const lastMaint = carData.filter(
        v =>
          isMaint(v) &&
          getDate(v) >= lastMonthStart &&
          getDate(v) <= lastMonthEnd
      ).length;
      const growth =
        lastMaint === 0
          ? currentMaint > 0
            ? 100
            : 0
          : Math.round(((currentMaint - lastMaint) / lastMaint) * 100);
      setMaintenanceGrowth(growth);
    } catch (_) {
      setMaintenanceGrowth(0);
    }
  }, [carData]);

  // Real-time monthly revenue from completed bookings (frontend-only aggregation with pagination)
  React.useEffect(() => {
    const fetchAllCompletedBookings = async () => {
      const bookingsAll = [];
      try {
        let page = 1;
        const limit = 100;
        while (true) {
          const res = await apiClient.get(endpoints.bookings.getAll(), {
            params: {
              status: 'COMPLETED',
              page,
              limit,
              // Optional range to reduce payload (backend filters by startTime)
              startDate: new Date(selectedYear, 0, 1).toISOString(),
              endDate:
                selectedYear === currentYear
                  ? new Date().toISOString()
                  : new Date(selectedYear, 11, 31, 23, 59, 59).toISOString(),
            },
          });
          const pageBookings = Array.isArray(res?.data?.bookings)
            ? res.data.bookings
            : [];
          bookingsAll.push(...pageBookings);
          const pagination = res?.data?.pagination;
          const currentPage = Number(pagination?.currentPage || page);
          const totalPages = Number(pagination?.totalPages || page);
          if (currentPage >= totalPages || pageBookings.length === 0) break;
          page += 1;
        }
      } catch (_) {
        return [];
      }
      return bookingsAll;
    };

    const loadMonthlyRevenue = async () => {
      try {
        const bookings = await fetchAllCompletedBookings();
        const months = Array(12).fill(0);
        const year = selectedYear;
        bookings.forEach(b => {
          const dt = new Date(
            b.actualEndTime || b.endTime || b.updatedAt || b.createdAt
          );
          if (dt.getFullYear() === year) {
            const idx = dt.getMonth();
            const base = Number(b.basePrice || 0);
            const insurance = Number(b.insuranceAmount || 0);
            const discount = Number(b.discountAmount || 0);
            const revenue = base + insurance - discount;
            months[idx] += revenue;
          }
        });
        setMonthlyRevenue(months);
      } catch (_) {
        setMonthlyRevenue(Array(12).fill(0));
      }
    };

    loadMonthlyRevenue();

    const intervalId = setInterval(loadMonthlyRevenue, 60_000); // refresh mỗi 60s
    return () => clearInterval(intervalId);
  }, [selectedYear]);

  const renderDashboard = () => {
    // Prepare chart data usage
    const points = monthlyRevenue;

    // Top 5 cars from booking analytics popularVehicles
    const topVehicles = popularVehicles.slice(0, 5);
    const topMax = Math.max(1, ...topVehicles.map(v => v.bookingCount || 0));

    const availableCars = carData.filter(
      v => (v.status || '').toUpperCase() === 'AVAILABLE'
    );

    return (
      <div className='space-y-6'>
        {/* Greeting */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold'>
              {`Good Morning, ${staffData?.name || 'Teams'}`}
            </h1>
            <p className='text-muted-foreground text-sm'>
              Welcome back, you have 0 new messages
            </p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Revenue
              </CardTitle>
              <Car className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {formatCurrency(analytics.revenue || 0, 'VND')}
              </div>
              <div
                className={`flex items-center gap-1 text-xs ${
                  revenueGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                <TrendingUp size={12} />
                <span>
                  {revenueGrowth > 0
                    ? `+${revenueGrowth}%`
                    : `${revenueGrowth}%`}
                </span>
              </div>
              <p className='mt-1 text-[11px] text-muted-foreground'>
                Total revenue from booking
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Active Customers
              </CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{activeCustomersCount}</div>
              <div
                className={`flex items-center gap-1 text-xs ${
                  activeCustomersGrowth >= 0
                    ? 'text-emerald-600'
                    : 'text-red-600'
                }`}
              >
                <TrendingUp size={12} />
                <span>
                  {activeCustomersGrowth > 0
                    ? `+${activeCustomersGrowth}%`
                    : `${activeCustomersGrowth}%`}
                </span>
              </div>
              <p className='mt-1 text-[11px] text-muted-foreground'>
                Currently renting
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                No. Car Rented Out
              </CardTitle>
              <CarFront className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {analytics.rentedCount ||
                  carData.filter(
                    v => (v.status || '').toUpperCase() === 'RENTED'
                  ).length}
              </div>
              <div
                className={`flex items-center gap-1 text-xs ${
                  rentedGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                <TrendingUp size={12} />
                <span>
                  {rentedGrowth > 0 ? `+${rentedGrowth}%` : `${rentedGrowth}%`}
                </span>
              </div>
              <p className='mt-1 text-[11px] text-muted-foreground'>
                Total number of cars currently rented out
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Maintenance</CardTitle>
              <Wrench className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {
                  carData.filter(
                    v => (v.status || '').toUpperCase() === 'MAINTENANCE'
                  ).length
                }
              </div>
              <div
                className={`flex items-center gap-1 text-xs ${
                  maintenanceGrowth >= 0 ? 'text-amber-600' : 'text-red-600'
                }`}
              >
                <TrendingUp size={12} />
                <span>
                  {maintenanceGrowth > 0
                    ? `+${maintenanceGrowth}%`
                    : `${maintenanceGrowth}%`}
                </span>
              </div>
              <p className='mt-1 text-[11px] text-muted-foreground'>
                Total number of cars currently in maintenance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Middle: Revenue + Right column */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Revenue chart reused from Admin */}
          <div className='lg:col-span-2'>
            <ChartBarDefault />
          </div>

          {/* Right column: Top 5 */}
          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Car Rented Out</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {topVehicles.length ? (
                    topVehicles.map(v => (
                      <div key={v.vehicleId} className='space-y-1'>
                        <div className='flex justify-between text-sm'>
                          <span>{v.model}</span>
                          <span>{v.bookingCount}</span>
                        </div>
                        <div className='h-2 bg-muted rounded'>
                          <div
                            className='h-2 bg-primary rounded'
                            style={{
                              width: `${
                                ((v.bookingCount || 0) / topMax) * 100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='text-sm text-muted-foreground'>
                      No rented cars yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Available Cars Table */}
        <Card>
          <CardHeader>
            <CardTitle>Available Cars</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand/Model</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>License Plate</TableHead>
                  <TableHead className='text-right'>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availableCars.map(v => (
                  <TableRow key={v.id} className='hover:bg-muted/50'>
                    <TableCell className='font-medium'>
                      {`${v.brand || ''} ${v.model || ''}`.trim() ||
                        v.name ||
                        '—'}
                    </TableCell>
                    <TableCell>{v.type || '—'}</TableCell>
                    <TableCell>{v.licensePlate || '—'}</TableCell>
                    <TableCell className='text-right'>
                      <Badge
                        variant='outline'
                        className='text-emerald-700 border-emerald-200'
                      >
                        Available
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {availableCars.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className='text-center text-muted-foreground'
                    >
                      No available cars
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };
  const renderCheckIn = () => {
    return <CheckInCar />;
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
  const renderUploadContract = () => {
    return <ContractUploadPage />;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'profile':
        return <StaffProfileLayout />;
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
      case 'uploadContract':
        return renderUploadContract();
      case 'documents':
        return <DocumentVerification />;
      // case 'notifications':
      //   return <NotificationPreferences />;
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
      icon: <CarFront className='h-4 w-4' />,
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
        {
          id: 'uploadContract',
          label: 'Upload User Contract', // ✅ Hiển thị tên rõ ràng hơn
        },
      ],
    },
    // {
    //   id: 'notifications',
    //   label: 'Notifications',
    //   icon: <Bell className='h-4 w-4' />,
    // },
    // Removed quick-verify menu item
  ];

  return (
    <SidebarProvider>
      <StaffSidebar
        staff={staffData}
        cars={carData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        // Use explicit label if provided, otherwise fallback to i18n key
        menuItems={menuItems.map(item => ({
          ...item,
          label: item.label ?? t(`staffSidebar.${item.id}`),
          items: item.items?.map(subItem => ({
            ...subItem,
            label: subItem.label ?? t(`staffSidebar.${subItem.id}`),
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
