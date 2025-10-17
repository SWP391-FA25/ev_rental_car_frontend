"use client"
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { Textarea } from '../../../shared/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/components/ui/select'
import { Badge } from '../../../shared/components/ui/badge'
import { CheckCircle, Loader } from 'lucide-react'
import { useState } from 'react'
import { apiClient } from '../../../shared/lib/apiClient'
import { endpoints } from '../../../shared/lib/endpoints'

export function CheckInForm({
    carId,
    setCarId,
    renterId,
    setRenterId,
    notes,
    setNotes,
    bookings = [],
    isLoadingBookings = false,
    carName = '',
    renterName = '',
    userColor = '',
    setUserColor = () => { },
    carColor = '',
    setCarColor = () => { },
    setCarName = () => { },
    setRenterName = () => { },
    licensePlate = '',
    setLicensePlate = () => { },
}) {
    const [loadingDetail, setLoadingDetail] = useState(false)
    const [renterEmail, setRenterEmail] = useState('')


    const handleBookingSelect = async (bookingId) => {
        if (!bookingId || bookingId === 'no-booking') return

        const booking = bookings.find((b) => b.id === bookingId)

        if (booking) {
            setLoadingDetail(true)
            setCarId("")
            setCarName("")
            setLicensePlate("")
            setRenterId("")
            setRenterName("")
            setUserColor("")
            setRenterEmail("")

            try {
                console.log('Selected booking:', booking)

                // use enriched booking data (parent should have populated vehicle.licensePlate and renter fields)
                const vehicleData = booking.vehicle ?? {}
                const renterData = booking.renter ?? booking.user ?? {}

                const vName = vehicleData?.brand ? `${vehicleData.brand}${vehicleData.model ? ' ' + vehicleData.model : ''}` : vehicleData?.name || ""
                const vColor = vehicleData?.color || ""
                const vLicensePlate = vehicleData?.licensePlate || ""

                const rName = renterData?.name || renterData?.fullName || ""
                const extractedUserColor = renterData?.color || renterData?.profile?.color || renterData?.preferences?.color || ''
                const rEmail = renterData?.email || renterData?.contact?.email || ''


                setCarColor(vColor)
                setCarName(vName)
                setLicensePlate(vLicensePlate)

                setRenterName(rName)
                setUserColor(extractedUserColor)
                setRenterEmail(rEmail)


                console.log('Selected booking with full details:', {
                    vColor,
                    vName,
                    vLicensePlate,
                    rName,
                    rEmail,
                    vehicleData,
                    renterData
                })
            } catch (error) {
                console.error('Error fetching booking details:', error)

                const vName = booking.vehicle?.brand
                    ? `${booking.vehicle.brand}${booking.vehicle.model ? ' ' + booking.vehicle.model : ''}`
                    : booking.vehicle?.name || ""

                const vColor = booking.vehicle?.color || ""
                const vLicensePlate = booking.vehicle?.licensePlate || ""
                const rName = booking.renter?.name || booking.user?.name || booking.renter?.fullName || ""
                const rEmail = booking.user?.email || booking.renter?.email || ""

                setCarColor(vColor)
                setCarName(vName)
                setLicensePlate(vLicensePlate)
                setRenterName(rName)
                const fbColor = booking.user?.color || booking.renter?.color || ''
                setUserColor(fbColor)
                setRenterEmail(rEmail)

            } finally {
                setLoadingDetail(false)
            }
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Thông Tin Check-in</CardTitle>
                <CardDescription>Chọn đơn đặt xe để tự động điền thông tin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Booking Selection */}
                <div className="space-y-2">
                    <Label htmlFor="booking">Chọn Đơn Đặt Xe *</Label>
                    <Select onValueChange={handleBookingSelect} disabled={isLoadingBookings || loadingDetail}>
                        <SelectTrigger id="booking" className="relative">
                            <SelectValue
                                placeholder={isLoadingBookings ? "Đang tải..." : loadingDetail ? "Đang lấy thông tin..." : "Chọn đơn đặt xe"}
                            />
                            {loadingDetail && <Loader className="h-4 w-4 animate-spin absolute right-3" />}
                        </SelectTrigger>
                        <SelectContent>
                            {bookings.length === 0 ? (
                                <SelectItem value="no-booking" disabled>
                                    Không có đơn đặt xe ở trạng thái CONFIRMED
                                </SelectItem>
                            ) : (
                                bookings.map((booking) => (
                                    <SelectItem key={booking.id} value={booking.id}>
                                        <div className="flex items-center gap-2 w-full">
                                            <div className="flex flex-col text-sm">
                                                <span className="font-medium">
                                                    {booking.user?.name ||
                                                        booking.user?.fullName ||
                                                        booking.user?.displayName ||
                                                        'Người thuê'}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {booking.vehicle?.brand || booking.vehicle?.name || 'Xe thuê'}
                                                </span>
                                            </div>
                                            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1 px-2 py-0.5 ml-auto">
                                                <CheckCircle className="h-3 w-3" />
                                                <span className="text-xs">Confirmed</span>
                                            </Badge>
                                        </div>
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {/* Vehicle Information */}
                <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold text-base">Thông Tin Xe</h3>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="carName">Tên Xe</Label>
                            <Input
                                id="carName"
                                placeholder="VD: Toyota Camry"
                                value={carName}
                                readOnly
                                aria-readonly="true"
                                className="bg-gray-50"
                                disabled={loadingDetail}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="carColor">Màu Xe *</Label>
                            <Input
                                id="carColor"
                                placeholder="VD: Đen"
                                value={carColor}
                                readOnly
                                aria-readonly="true"
                                className="bg-gray-50"
                                onChange={(e) => setCarColor(e.target.value)}
                                disabled={loadingDetail}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="licensePlate">Biển Số Xe *</Label>
                            <Input
                                id="licensePlate"
                                placeholder="VD: 51A-12345"
                                value={licensePlate}
                                readOnly
                                aria-readonly="true"
                                className="bg-gray-50"
                                onChange={(e) => setLicensePlate(e.target.value)}
                                disabled={loadingDetail}
                            />
                        </div>
                    </div>
                </div>

                {/* Renter Information */}
                <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold text-base">Thông Tin Người Dùng</h3>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="renterName">Tên Người Dùng *</Label>
                            <Input
                                id="renterName"
                                placeholder="VD: Nguyễn Văn A"
                                value={renterName}
                                onChange={(e) => setRenterName(e.target.value)}
                                disabled={loadingDetail}

                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="renterEmail">Email</Label>
                            <Input
                                id="renterEmail"
                                type="email"
                                placeholder="VD: user@example.com"
                                value={renterEmail}
                                onChange={(e) => setRenterEmail(e.target.value)}

                                disabled={loadingDetail}
                            />
                        </div>

                    </div>




                </div>

                {/* Notes */}
                <div className="space-y-2 pt-4 border-t">
                    <Label htmlFor="notes">Ghi Chú Thêm</Label>
                    <Textarea
                        id="notes"
                        placeholder="Thêm bất kỳ nhận xét hoặc ghi chú nào về tình trạng xe..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                    />
                </div>
            </CardContent>
        </Card>
    )
}