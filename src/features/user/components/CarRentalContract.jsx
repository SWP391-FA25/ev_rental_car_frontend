'use client';

import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  DollarSign,
  Mail,
  MapPin,
  Phone,
  User,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '../../shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../shared/components/ui/card';
import { Checkbox } from '../../shared/components/ui/checkbox';

export default function RentalContractPage() {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookings, setBookings] = useState(null);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    notes: 'Minor scratch on left door, battery at 85%',
    clauses: 'Return the vehicle before 18:00 today',
    images: {
      exterior: 'image_exterior.jpg',
      interior: 'image_interior.jpg',
      engine: 'image_engine.jpg',
      damage: 'image_damage.jpg',
      accessories: 'image_accessories.jpg',
      odometer: 'image_odometer.jpg',
    },
  });

  const [agreements, setAgreements] = useState({
    termsAccepted: false,
    conditionsAccepted: false,
    damageResponsibility: false,
    dataPrivacy: false,
  });

  // Mock booking data (fallback)
  const mockBookings = [
    {
      id: 1,
      bookingCode: 'BK001',
      renterName: 'Nguyễn Văn A',
      renterPhone: '0912345678',
      scooterModel: 'Xiaomi Mi 3',
      rentalDate: '2024-10-20',
      returnDate: '2024-10-22',
      duration: '2 days',
      price: '200,000 VND',
      staff: {
        id: 1,
        name: 'Trần Thị B',
        phone: '0987654321',
        email: 'tranb@company.com',
      },
      station: {
        id: 1,
        name: 'Hanoi Station - Hoan Kiem',
        address: '123 Trang Tien Street, Hoan Kiem, Hanoi',
        phone: '024-1234-5678',
      },
    },
    {
      id: 2,
      bookingCode: 'BK002',
      renterName: 'Phạm Thị C',
      renterPhone: '0923456789',
      scooterModel: 'Xiaomi Mi 4 Pro',
      rentalDate: '2024-10-21',
      returnDate: '2024-10-23',
      duration: '2 days',
      price: '250,000 VND',
      staff: {
        id: 2,
        name: 'Lê Văn D',
        phone: '0976543210',
        email: 'levand@company.com',
      },
      station: {
        id: 2,
        name: 'Hanoi Station - Ba Dinh',
        address: '456 Dinh Tien Hoang Street, Ba Dinh, Hanoi',
        phone: '024-8765-4321',
      },
    },
    {
      id: 3,
      bookingCode: 'BK003',
      renterName: 'Vũ Minh E',
      renterPhone: '0934567890',
      scooterModel: 'Xiaomi Mi 3',
      rentalDate: '2024-10-22',
      returnDate: '2024-10-24',
      duration: '2 days',
      price: '200,000 VND',
      staff: {
        id: 3,
        name: 'Hoàng Anh F',
        phone: '0965432109',
        email: 'hoangf@company.com',
      },
      station: {
        id: 1,
        name: 'Hanoi Station - Hoan Kiem',
        address: '123 Trang Tien Street, Hoan Kiem, Hanoi',
        phone: '024-1234-5678',
      },
    },
  ];

  const imageCategories = [
    {
      id: 'exterior',
      label: 'Exterior',
      description: 'Outside views: doors, mirrors, corners',
    },
    {
      id: 'interior',
      label: 'Interior',
      description: 'Interior, dashboard, steering wheel',
    },
    {
      id: 'engine',
      label: 'Motor & Battery',
      description: 'Engine bay, battery, charging port',
    },
    {
      id: 'damage',
      label: 'Damages',
      description: 'Scratches, dents, and damage spots',
    },
    {
      id: 'accessories',
      label: 'Accessories',
      description: 'In-car accessories (charger, tools)',
    },
    {
      id: 'odometer',
      label: 'Odometer',
      description: 'Current mileage reading',
    },
  ];

  // fetch bookings for current user (backend should infer user from session or token)
  const fetchBookings = useCallback(async () => {
    setLoadingBookings(true);
    setError(null);
    try {
      const res = await fetch('/api/bookings?status=PENDING');
      if (!res.ok) throw new Error(`Failed to load bookings (${res.status})`);
      const json = await res.json();
      // Expect backend to return { success, data: { bookings: [...], pagination } } or array
      if (json && Array.isArray(json.data?.bookings)) {
        setBookings(json.data.bookings);
      } else if (Array.isArray(json)) {
        setBookings(json);
      } else {
        // fallback to mock if unexpected shape
        setBookings(mockBookings);
      }
    } catch (err) {
      console.warn('fetchBookings error:', err);
      setError('Unable to load bookings. Using offline data.');
      setBookings(mockBookings);
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // fetch latest booking details
  const fetchBookingDetails = async id => {
    try {
      const res = await fetch(`/api/bookings/${id}`);
      if (!res.ok) throw new Error(`Booking ${id} not found`);
      const json = await res.json();
      // Expect json.data.booking or json.booking
      const booking = json.data?.booking ?? json.booking ?? json;
      setSelectedBooking(booking);
    } catch (err) {
      console.warn('fetchBookingDetails:', err);
      // keep currently selected booking if fetch fails
    }
  };

  const handleBookingSelect = booking => {
    // attempt to fetch fresh details from backend
    setSelectedBooking(booking); // optimistic
    fetchBookingDetails(booking.id);
  };

  const handleAgreementChange = (field, value) => {
    setAgreements(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const allAgreementsAccepted = Object.values(agreements).every(
    v => v === true
  );

  // sign contract -> request backend to change booking status to CONFIRMED
  const handleSubmit = async () => {
    if (!selectedBooking) {
      alert('Please select a booking');
      return;
    }
    if (!allAgreementsAccepted) {
      alert('Please agree to all terms before signing the contract');
      return;
    }
    setActionLoading(true);
    try {
      // Use updateBookingStatus endpoint: PATCH /api/bookings/:id/status { status: "CONFIRMED" }
      const res = await fetch(`/api/bookings/${selectedBooking.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONFIRMED' }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        console.error('Failed to confirm booking:', res.status, body);
        alert('Unable to sign the contract — please try again later.');
        return;
      }
      const json = await res.json().catch(() => null);
      const updated = json?.data?.booking ?? json?.booking ?? json;
      // update UI
      setSelectedBooking(updated);
      // refresh bookings list to reflect changed status
      fetchBookings();
      alert('Electronic contract signed successfully!');
    } catch (err) {
      console.error('handleSubmit error:', err);
      alert('An error occurred while signing the contract. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <main className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-slate-900 mb-2'>
            Electric Car Rental Contract
          </h1>
          <p className='text-slate-600'>
            Please complete all steps to sign the electronic contract
          </p>
        </div>

        {/* Step 1: Booking Selection */}
        <Card className='mb-6 border-slate-200 shadow-sm'>
          <CardHeader className='bg-white border-b border-slate-200'>
            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold'>
                1
              </div>
              <div>
                <CardTitle className='text-slate-900'>Select Booking</CardTitle>
                <CardDescription>
                  Choose your rental booking
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='pt-6'>
            <div className='space-y-3'>
              {loadingBookings && (
                <div className='text-sm text-slate-500'>
                  Loading bookings...
                </div>
              )}
              {error && <div className='text-sm text-red-600'>{error}</div>}
              {(bookings ?? mockBookings).map(booking => (
                <Card
                  key={booking.id}
                  className={`p-4 cursor-pointer transition-all border-2 ${
                    selectedBooking?.id === booking.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                  onClick={() => handleBookingSelect(booking)}
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-2'>
                        <h3 className='font-semibold text-slate-900'>
                          {booking.bookingCode}
                        </h3>
                        <span className='text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded'>
                          {booking.duration}
                        </span>
                      </div>
                      <div className='grid grid-cols-2 gap-4 text-sm text-slate-600'>
                        <div>
                          <p className='text-slate-500'>Customer</p>
                          <p className='font-medium text-slate-900'>
                            {booking.renterName}
                          </p>
                        </div>
                        <div>
                          <p className='text-slate-500'>Vehicle</p>
                          <p className='font-medium text-slate-900'>
                            {booking.scooterModel}
                          </p>
                        </div>
                        <div>
                          <p className='text-slate-500'>Rental date</p>
                          <p className='font-medium text-slate-900'>
                            {booking.rentalDate}
                          </p>
                        </div>
                        <div>
                          <p className='text-slate-500'>Price</p>
                          <p className='font-medium text-slate-900'>
                            {booking.price}
                          </p>
                        </div>
                      </div>
                    </div>
                    {selectedBooking?.id === booking.id && (
                      <div className='ml-4 flex-shrink-0'>
                        <div className='flex items-center justify-center w-6 h-6 rounded-full bg-blue-600'>
                          <Check className='w-4 h-4 text-white' />
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedBooking && (
          <>
            {/* Step 2: Staff & Station Info */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
              {/* Staff Info */}
              <Card className='border-slate-200 shadow-sm'>
                <CardHeader className='bg-white border-b border-slate-200'>
                  <div className='flex items-center gap-3'>
                    <div className='flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold'>
                      2
                    </div>
                    <div>
                      <CardTitle className='text-slate-900'>
                        Staff Information
                      </CardTitle>
                      <CardDescription>Assigned staff</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='pt-6'>
                  <div className='space-y-4'>
                    <div className='flex items-start gap-4'>
                      <div className='flex items-center justify-center w-12 h-12 rounded-full bg-blue-100'>
                        <User className='w-6 h-6 text-blue-600' />
                      </div>
                      <div className='flex-1'>
                        <p className='text-sm text-slate-500 mb-1'>
                          Staff name
                        </p>
                        <p className='font-semibold text-slate-900'>
                          {selectedBooking.staff.name}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-start gap-4'>
                      <div className='flex items-center justify-center w-12 h-12 rounded-full bg-green-100'>
                        <Phone className='w-6 h-6 text-green-600' />
                      </div>
                      <div className='flex-1'>
                        <p className='text-sm text-slate-500 mb-1'>
                          Phone number
                        </p>
                        <p className='font-semibold text-slate-900'>
                          {selectedBooking.staff.phone}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-start gap-4'>
                      <div className='flex items-center justify-center w-12 h-12 rounded-full bg-purple-100'>
                        <Mail className='w-6 h-6 text-purple-600' />
                      </div>
                      <div className='flex-1'>
                        <p className='text-sm text-slate-500 mb-1'>Email</p>
                        <p className='font-semibold text-slate-900'>
                          {selectedBooking.staff.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rental Station Info */}
              <Card className='border-slate-200 shadow-sm'>
                <CardHeader className='bg-white border-b border-slate-200'>
                  <div className='flex items-center gap-3'>
                    <div className='flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold'>
                      3
                    </div>
                    <div>
                      <CardTitle className='text-slate-900'>
                        Rental Station
                      </CardTitle>
                      <CardDescription>Selected station</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='pt-6'>
                  <div className='space-y-4'>
                    <div>
                      <p className='text-sm text-slate-500 mb-2'>Station name</p>
                      <p className='font-semibold text-slate-900 text-lg'>
                        {selectedBooking.station.name}
                      </p>
                    </div>

                    <div className='flex items-start gap-3'>
                      <MapPin className='w-5 h-5 text-blue-600 mt-1 flex-shrink-0' />
                      <div>
                        <p className='text-sm text-slate-500 mb-1'>Address</p>
                        <p className='text-slate-900'>
                          {selectedBooking.station.address}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-start gap-3'>
                      <Phone className='w-5 h-5 text-green-600 mt-1 flex-shrink-0' />
                      <div>
                        <p className='text-sm text-slate-500 mb-1'>
                          Phone number
                        </p>
                        <p className='font-semibold text-slate-900'>
                          {selectedBooking.station.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Step 3: Contract Details */}
            <Card className='mb-6 border-slate-200 shadow-sm'>
              <CardHeader className='bg-white border-b border-slate-200'>
                <div className='flex items-center gap-3'>
                  <div className='flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold'>
                    4
                  </div>
                  <div>
                    <CardTitle className='text-slate-900'>
                      Contract Details
                    </CardTitle>
                    <CardDescription>
                      Detailed information about the vehicle and contract
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='pt-6'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <Card className='p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'>
                    <div className='flex items-start gap-3'>
                      <Calendar className='w-6 h-6 text-blue-600 mt-1' />
                      <div>
                        <p className='text-sm text-slate-600 mb-1'>
                          Rental period
                        </p>
                        <p className='font-semibold text-slate-900'>
                          {selectedBooking.rentalDate}
                        </p>
                        <p className='text-sm text-slate-600'>
                          to {selectedBooking.returnDate}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className='p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200'>
                    <div className='flex items-start gap-3'>
                      <Zap className='w-6 h-6 text-green-600 mt-1' />
                      <div>
                        <p className='text-sm text-slate-600 mb-1'>Model</p>
                        <p className='font-semibold text-slate-900'>
                          {selectedBooking.scooterModel}
                        </p>
                        <p className='text-sm text-slate-600'>
                          {selectedBooking.duration}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className='p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'>
                    <div className='flex items-start gap-3'>
                      <DollarSign className='w-6 h-6 text-purple-600 mt-1' />
                      <div>
                        <p className='text-sm text-slate-600 mb-1'>Rental price</p>
                        <p className='font-semibold text-slate-900'>
                          {selectedBooking.price}
                        </p>
                        <p className='text-sm text-slate-600'>Total</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Step 4: Images from Staff (Read-only) */}
            <Card className='mb-6 border-slate-200 shadow-sm'>
              <CardHeader className='bg-white border-b border-slate-200'>
                <div className='flex items-center gap-3'>
                  <div className='flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold'>
                    5
                  </div>
                  <div>
                    <CardTitle className='text-slate-900'>
                      Inspection Images From Staff
                    </CardTitle>
                    <CardDescription>
                      Vehicle condition images provided by staff (view only)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='pt-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {imageCategories.map(category => (
                    <Card
                      key={category.id}
                      className='overflow-hidden border-slate-200 hover:border-slate-300 transition-all'
                    >
                      <div className='aspect-square flex flex-col items-center justify-center p-4 relative group bg-slate-50'>
                        {formData.images[category.id] ? (
                          <div className='text-center'>
                            <div className='text-green-600 mb-2'>
                              <Check className='w-6 h-6' />
                            </div>
                            <p className='text-sm font-medium text-slate-900'>
                              Uploaded
                            </p>
                            <p className='text-xs text-slate-500 mt-1'>
                              Image from staff
                            </p>
                          </div>
                        ) : (
                          <div className='text-center'>
                            <div className='text-slate-400 mb-2'>-</div>
                            <p className='text-sm font-medium text-slate-500'>
                              No image
                            </p>
                          </div>
                        )}
                      </div>
                      <div className='p-3 bg-white'>
                        <h3 className='font-semibold text-slate-900 text-sm'>
                          {category.label}
                        </h3>
                        <p className='text-xs text-slate-500 mt-1'>
                          {category.description}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step 5: Notes from Staff (Read-only) */}
            <Card className='mb-6 border-slate-200 shadow-sm'>
              <CardHeader className='bg-white border-b border-slate-200'>
                <div className='flex items-center gap-3'>
                  <div className='flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold'>
                    6
                  </div>
                  <div>
                    <CardTitle className='text-slate-900'>
                      Notes & Damages From Staff
                    </CardTitle>
                    <CardDescription>
                      Staff notes (view only)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='pt-6'>
                <div className='space-y-6'>
                  <div>
                    <label className='block text-sm font-semibold text-slate-900 mb-2'>
                      Damage Notes
                    </label>
                    <div className='w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 min-h-24'>
                      {formData.notes || 'No notes'}
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-slate-900 mb-2'>
                      Additional Notes
                    </label>
                    <div className='w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 min-h-24'>
                      {formData.clauses || 'No additional notes'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 6: Contract Agreement */}
            <Card className='mb-6 border-slate-200 shadow-sm'>
              <CardHeader className='bg-white border-b border-slate-200'>
                <div className='flex items-center gap-3'>
                  <div className='flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold'>
                    7
                  </div>
                  <div>
                    <CardTitle className='text-slate-900'>
                      Electronic Contract Confirmation
                    </CardTitle>
                    <CardDescription>
                      Please agree to all terms to sign the contract
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='pt-6'>
                <div className='space-y-6'>
                  {/* Contract Terms */}
                  <Card className='border-slate-200'>
                    <CardHeader className='bg-slate-50 border-b border-slate-200'>
                      <CardTitle className='text-slate-900'>
                        Contract Terms & Conditions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='pt-6'>
                      <div className='space-y-4 mb-6 text-sm text-slate-700 max-h-48 overflow-y-auto'>
                        <div>
                          <h4 className='font-semibold text-slate-900 mb-2'>
                            1. Rental Period
                          </h4>
                          <p>
                            The rental period starts from the time of pickup at the station and ends when the vehicle is returned to the station. Any usage beyond the agreed period will be charged according to the applicable rate.
                          </p>
                        </div>
                        <div>
                          <h4 className='font-semibold text-slate-900 mb-2'>
                            2. Vehicle Care Responsibility
                          </h4>
                          <p>
                            The renter is responsible for maintaining the vehicle during the rental period. Any damage, loss, or harm occurring during the rental period will be the renter’s responsibility.
                          </p>
                        </div>
                        <div>
                          <h4 className='font-semibold text-slate-900 mb-2'>
                            3. Usage Conditions
                          </h4>
                          <p>
                            The vehicle may only be used for personal purposes. Subleasing and use for commercial or illegal activities are prohibited.
                          </p>
                        </div>
                        <div>
                          <h4 className='font-semibold text-slate-900 mb-2'>
                            4. Insurance & Protection
                          </h4>
                          <p>
                            The vehicle is covered by basic insurance. The renter may purchase additional coverage to increase protection. Any insurance claim must be reported within 24 hours.
                          </p>
                        </div>
                        <div>
                          <h4 className='font-semibold text-slate-900 mb-2'>
                            5. Fees & Payment
                          </h4>
                          <p>
                            Rental fees must be paid in full before pickup. Additional fees (overtime, damage, etc.) will be calculated and settled upon return.
                          </p>
                        </div>
                      </div>

                      <div
                        className='flex items-start gap-4 p-5 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-400 cursor-pointer hover:from-green-100 hover:to-green-200 transition-all duration-200'
                        onClick={() =>
                          handleAgreementChange(
                            'termsAccepted',
                            !agreements.termsAccepted
                          )
                        }
                      >
                        <Checkbox
                          id='terms'
                          checked={agreements.termsAccepted}
                          onCheckedChange={checked =>
                            handleAgreementChange(
                              'termsAccepted',
                              Boolean(checked)
                            )
                          }
                          className='w-6 h-6 mt-1 flex-shrink-0 cursor-pointer'
                        />
                        <label
                          htmlFor='terms'
                          className='text-base text-slate-800 cursor-pointer flex-1'
                        >
                          <span className='font-bold text-green-900'>
                            I agree to the terms & conditions
                          </span>
                          <span className='text-slate-700'>
                            {' '}
                            of this electric car rental contract
                          </span>
                        </label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Damage Responsibility */}
                  <Card className='border-slate-200'>
                    <CardHeader className='bg-slate-50 border-b border-slate-200'>
                      <CardTitle className='text-slate-900'>
                        Damage Responsibility
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='pt-6'>
                      <div className='space-y-3 mb-6 text-sm text-slate-700'>
                        <p>
                          <span className='font-semibold text-slate-900'>
                            The renter confirms that:
                          </span>
                        </p>
                        <ul className='list-disc list-inside space-y-2 ml-2'>
                          <li>Has carefully inspected the vehicle condition before pickup</li>
                          <li>Has recorded all existing damages with photos</li>
                          <li>Will be responsible for any new damages during the rental period</li>
                          <li>Will immediately report any accidents or incidents</li>
                        </ul>
                      </div>

                      <div
                        className='flex items-start gap-4 p-5 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-400 cursor-pointer hover:from-green-100 hover:to-green-200 transition-all duration-200'
                        onClick={() =>
                          handleAgreementChange(
                            'damageResponsibility',
                            !agreements.damageResponsibility
                          )
                        }
                      >
                        <Checkbox
                          id='damage'
                          checked={agreements.damageResponsibility}
                          onCheckedChange={checked =>
                            handleAgreementChange(
                              'damageResponsibility',
                              Boolean(checked)
                            )
                          }
                          className='w-6 h-6 mt-1 flex-shrink-0 cursor-pointer'
                        />
                        <label
                          htmlFor='damage'
                          className='text-base text-slate-800 cursor-pointer flex-1'
                        >
                          <span className='font-bold text-green-900'>
                            I understand and accept responsibility
                          </span>
                          <span className='text-slate-700'>
                            {' '}
                            for any damages occurring during the rental period
                          </span>
                        </label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Data Privacy */}
                  <Card className='border-slate-200'>
                    <CardHeader className='bg-slate-50 border-b border-slate-200'>
                      <CardTitle className='text-slate-900'>
                        Personal Data Protection
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='pt-6'>
                      <div className='space-y-3 mb-6 text-sm text-slate-700'>
                        <p>
                          Your personal data is processed in accordance with our data protection policy. We are committed to safeguarding your information and using it only for purposes related to the rental contract.
                        </p>
                      </div>

                      <div
                        className='flex items-start gap-4 p-5 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-400 cursor-pointer hover:from-green-100 hover:to-green-200 transition-all duration-200'
                        onClick={() =>
                          handleAgreementChange(
                            'dataPrivacy',
                            !agreements.dataPrivacy
                          )
                        }
                      >
                        <Checkbox
                          id='privacy'
                          checked={agreements.dataPrivacy}
                          onCheckedChange={checked =>
                            handleAgreementChange(
                              'dataPrivacy',
                              Boolean(checked)
                            )
                          }
                          className='w-6 h-6 mt-1 flex-shrink-0 cursor-pointer'
                        />
                        <label
                          htmlFor='privacy'
                          className='text-base text-slate-800 cursor-pointer flex-1'
                        >
                          <span className='font-bold text-green-900'>
                            I agree to the personal data protection policy
                          </span>
                          <span className='text-slate-700'>
                            {' '}
                            and allow processing of my data
                          </span>
                        </label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Conditions */}
                  <Card className='border-slate-200'>
                    <CardHeader className='bg-slate-50 border-b border-slate-200'>
                      <CardTitle className='text-slate-900'>
                        Additional Conditions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='pt-6'>
                      <div className='space-y-3 mb-6 text-sm text-slate-700'>
                        <p>
                          <span className='font-semibold text-slate-900'>
                            Additional conditions:
                          </span>
                        </p>
                        <ul className='list-disc list-inside space-y-2 ml-2'>
                          <li>The vehicle must be returned at the agreed time and location</li>
                          <li>The vehicle must be returned in clean condition</li>
                          <li>The battery must be fully charged before return</li>
                          <li>All additional fees must be paid before returning the vehicle</li>
                        </ul>
                      </div>

                      <div
                        className='flex items-start gap-4 p-5 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-400 cursor-pointer hover:from-green-100 hover:to-green-200 transition-all duration-200'
                        onClick={() =>
                          handleAgreementChange(
                            'conditionsAccepted',
                            !agreements.conditionsAccepted
                          )
                        }
                      >
                        <Checkbox
                          id='conditions'
                          checked={agreements.conditionsAccepted}
                          onCheckedChange={checked =>
                            handleAgreementChange(
                              'conditionsAccepted',
                              Boolean(checked)
                            )
                          }
                          className='w-6 h-6 mt-1 flex-shrink-0 cursor-pointer'
                        />
                        <label
                          htmlFor='conditions'
                          className='text-base text-slate-800 cursor-pointer flex-1'
                        >
                          <span className='font-bold text-green-900'>
                            I agree to all additional conditions
                          </span>
                          <span className='text-slate-700'>
                            {' '}
                            listed above
                          </span>
                        </label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Warning */}
                  <div className='flex gap-3 p-4 bg-red-50 rounded-lg border border-red-200'>
                    <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' />
                    <div className='text-sm text-red-800'>
                      <p className='font-semibold mb-1'>Important notice:</p>
                      <p>
                        By signing this contract, you confirm that you have read,
                        understood, and agreed to all terms and conditions. This contract
                        is legally binding and you are legally responsible for any violations.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agreement Status */}
            {allAgreementsAccepted && (
              <Card className='mb-6 border-green-200 bg-green-50'>
                <CardContent className='pt-6'>
                  <div className='flex items-center gap-3'>
                    <CheckCircle2 className='w-6 h-6 text-green-600 flex-shrink-0' />
                    <div>
                      <p className='font-semibold text-green-900'>
                        All terms accepted
                      </p>
                      <p className='text-sm text-green-700'>
                        You are ready to sign the electronic contract
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!allAgreementsAccepted && (
              <Card className='mb-6 border-amber-200 bg-amber-50'>
                <CardContent className='pt-6'>
                  <div className='flex items-center gap-3'>
                    <AlertCircle className='w-6 h-6 text-amber-600 flex-shrink-0' />
                    <div>
                      <p className='font-semibold text-amber-900'>
                        Not all terms completed
                      </p>
                      <p className='text-sm text-amber-700'>
                        Please agree to all terms before signing the contract
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <div className='flex gap-4 justify-end'>
              <Button
                variant='outline'
                size='lg'
                className='border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent'
              >
                Cancel
              </Button>
              <Button
                size='lg'
                onClick={handleSubmit}
                disabled={!allAgreementsAccepted || actionLoading}
                className={`text-white ${
                  allAgreementsAccepted
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-slate-400 cursor-not-allowed'
                }`}
              >
                {actionLoading ? 'Processing...' : 'Sign Electronic Contract'}
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
