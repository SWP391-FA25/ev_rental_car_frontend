import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/card'
import { Button } from '../../../shared/components/ui/button'
import { CheckCircle, Car, User, MapPin, Clock, Battery } from 'lucide-react'
import { Badge } from '../../../shared/components/ui/badge'

export function InspectionSuccessPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const [inspectionData, setInspectionData] = useState(null)

    useEffect(() => {
        if (location.state) {
            setInspectionData(location.state)
            console.log("=== RECEIVED DATA ON SUCCESS PAGE ===")
            console.log(location.state)
        } else {
            // Redirect back if no data
            navigate('/staff/check-in')
        }
    }, [location.state, navigate])

    if (!inspectionData) {
        return <div className="p-8">Đang tải...</div>
    }

    const {
        inspectionId,
        vehicleInfo,
        staff,
        station,
        booking,
        formData,
        imageCount,
        categoriesCovered,
        totalCategories
    } = inspectionData

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Kiểm Tra Xe Thành Công!
                    </h1>
                    <p className="text-gray-600">
                        ID Kiểm Tra: <span className="font-mono font-semibold">{inspectionId}</span>
                    </p>
                </div>

                {/* Inspection Summary */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Vehicle Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Car className="h-5 w-5" />
                                Thông Tin Xe
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <span className="text-sm text-muted-foreground">Biển số:</span>
                                <p className="font-semibold">{vehicleInfo?.licensePlate}</p>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground">Xe:</span>
                                <p className="font-semibold">
                                    {vehicleInfo?.brand} {vehicleInfo?.model}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Battery className="h-4 w-4" />
                                <span className="text-sm">Pin: {formData.batteryLevel}%</span>
                            </div>
                            {formData.mileage && (
                                <div>
                                    <span className="text-sm text-muted-foreground">Số km:</span>
                                    <p className="font-semibold">{formData.mileage} km</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Staff & Station Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Thông Tin Xử Lý
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <span className="text-sm text-muted-foreground">Nhân viên:</span>
                                <p className="font-semibold">{staff?.name}</p>
                                <p className="text-sm text-muted-foreground">{staff?.role}</p>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground">Trạm:</span>
                                <p className="font-semibold">{station?.name}</p>
                                <p className="text-sm text-muted-foreground">{station?.address}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm">
                                    {new Date().toLocaleString('vi-VN')}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông Tin Khách Hàng</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <span className="text-sm text-muted-foreground">Tên:</span>
                                <p className="font-semibold">{booking?.renterName}</p>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground">Booking ID:</span>
                                <p className="font-mono text-sm">{formData.bookingId}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Inspection Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Chi Tiết Kiểm Tra</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Ngoại thất:</span>
                                    <Badge variant={formData.exteriorCondition === 'GOOD' ? 'default' : 'destructive'}>
                                        {formData.exteriorCondition}
                                    </Badge>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Nội thất:</span>
                                    <Badge variant={formData.interiorCondition === 'GOOD' ? 'default' : 'destructive'}>
                                        {formData.interiorCondition}
                                    </Badge>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Lốp xe:</span>
                                    <Badge variant={formData.tireCondition === 'GOOD' ? 'default' : 'destructive'}>
                                        {formData.tireCondition}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <span className="text-sm text-muted-foreground">Hình ảnh:</span>
                                <p className="font-semibold">{imageCount} ảnh ({categoriesCovered}/{totalCategories} danh mục)</p>
                            </div>

                            <div>
                                <span className="text-sm text-muted-foreground">Tài liệu:</span>
                                <Badge variant={formData.documentVerified ? 'default' : 'destructive'}>
                                    {formData.documentVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Notes Section */}
                {(formData.damageNotes || formData.notes) && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Ghi Chú</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {formData.damageNotes && (
                                <div>
                                    <span className="text-sm font-medium text-red-600">Hư hỏng:</span>
                                    <p className="text-sm mt-1 p-3 bg-red-50 rounded border border-red-200">
                                        {formData.damageNotes}
                                    </p>
                                </div>
                            )}
                            {formData.notes && (
                                <div>
                                    <span className="text-sm font-medium text-blue-600">Ghi chú khác:</span>
                                    <p className="text-sm mt-1 p-3 bg-blue-50 rounded border border-blue-200">
                                        {formData.notes}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 mt-8">
                    <Button
                        onClick={() => navigate('/staff/check-in')}
                        className="flex-1"
                    >
                        Tạo Kiểm Tra Mới
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => navigate('/staff/inspections')}
                        className="flex-1"
                    >
                        Xem Danh Sách
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default InspectionSuccessPage
