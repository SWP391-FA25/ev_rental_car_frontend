import * as React from 'react';
import {
  SidebarInset,
  SidebarProvider,
} from '../../shared/components/ui/sidebar';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../shared/components/ui/tabs';
import { CarManagement } from '../components/car-management';
import { CustomerManagement } from '../components/customer-management';
import { PaymentManagement } from '../components/payment-management';
import { StaffHeader } from '../components/staff-header';
import { StaffSidebar } from '../components/staff-sidebar';
import { StationManagement } from '../components/station-management';

const mockStaffData = [
  {
    id: 'STAFF001',
    name: 'John Smith',
    email: 'john.smith@company.com',
    role: 'Station Manager',
    station: 'Downtown Station',
    avatar: '/api/placeholder/32/32',
    shift: 'Morning (6AM - 2PM)',
    status: 'Active',
    permissions: ['car_management', 'customer_service', 'payment_processing'],
  },
  {
    id: 'STAFF002',
    name: 'Sarah Johnson',
    email: 'sarah.j@company.com',
    role: 'Customer Service Rep',
    station: 'Airport Station',
    avatar: '/api/placeholder/32/32',
    shift: 'Evening (2PM - 10PM)',
    status: 'Active',
    permissions: ['customer_service', 'payment_processing'],
  },
  {
    id: 'STAFF003',
    name: 'Mike Chen',
    email: 'mike.chen@company.com',
    role: 'Maintenance Tech',
    station: 'Mall Station',
    avatar: '/api/placeholder/32/32',
    shift: 'Night (10PM - 6AM)',
    status: 'Off Duty',
    permissions: ['car_management'],
  },
];

const mockCarData = [
  {
    id: 'CAR001',
    model: 'Tesla Model 3',
    licensePlate: 'EV-123-ABC',
    station: 'Downtown Station',
    status: 'Available',
    batteryLevel: 85,
    mileage: 25430,
    lastService: '2024-01-15',
    currentBooking: null,
    location: { lat: 40.7128, lng: -74.006 },
  },
  {
    id: 'CAR002',
    model: 'Nissan Leaf',
    licensePlate: 'EV-456-DEF',
    station: 'Airport Station',
    status: 'Rented',
    batteryLevel: 62,
    mileage: 18750,
    lastService: '2024-01-10',
    currentBooking: {
      id: 'BOOK001',
      customer: 'Alice Johnson',
      startTime: '2024-01-20T09:00:00Z',
      endTime: '2024-01-22T18:00:00Z',
      pickupLocation: 'Airport Station',
      dropoffLocation: 'Downtown Station',
    },
    location: { lat: 40.6892, lng: -74.1745 },
  },
  {
    id: 'CAR003',
    model: 'BMW i3',
    licensePlate: 'EV-789-GHI',
    station: 'Mall Station',
    status: 'Maintenance',
    batteryLevel: 0,
    mileage: 32100,
    lastService: '2024-01-18',
    currentBooking: null,
    location: { lat: 40.7282, lng: -73.7949 },
  },
];

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
  return (
    <SidebarProvider>
      <StaffSidebar
        staff={mockStaffData[0]}
        cars={mockCarData}
        stations={mockStationData}
        customers={mockCustomerData}
        payments={mockPaymentData}
      />
      <SidebarInset>
        <StaffHeader />
        <div className='flex flex-1 flex-col gap-4 p-4'>
          <Tabs defaultValue='cars' className='space-y-4'>
            <TabsList className='grid w-full grid-cols-4'>
              <TabsTrigger value='cars'>Car Management</TabsTrigger>
              <TabsTrigger value='stations'>Station Management</TabsTrigger>
              <TabsTrigger value='customers'>Customer Service</TabsTrigger>
              <TabsTrigger value='payments'>Payment Management</TabsTrigger>
            </TabsList>

            <TabsContent value='cars' className='space-y-4'>
              <CarManagement />
            </TabsContent>

            <TabsContent value='stations' className='space-y-4'>
              <StationManagement />
            </TabsContent>

            <TabsContent value='customers' className='space-y-4'>
              <CustomerManagement />
            </TabsContent>

            <TabsContent value='payments' className='space-y-4'>
              <PaymentManagement />
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
