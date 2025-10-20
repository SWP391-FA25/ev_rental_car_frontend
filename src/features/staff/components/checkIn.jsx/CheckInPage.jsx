import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/components/ui/card"
import { Button } from "../../../shared/components/ui/button"
import { Input } from "../../../shared/components/ui/input"
import { Label } from "../../../shared/components/ui/label"
import { Textarea } from "../../../shared/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select"
import { Check, Loader, RefreshCw } from "lucide-react"
import { apiClient } from '../../../shared/lib/apiClient'
import { endpoints } from '../../../shared/lib/endpoints'
import { ImageUploadSection } from "./ImageUploadSection"
import { ImagePreview } from "./ImagePreview"
import { CheckInSummary } from "./CheckInSummary"
import { useNavigate } from 'react-router-dom'

export function CheckInPage() {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        vehicleId: "",
        staffId: "",
        bookingId: null,
        stationId: "",
        inspectionType: "CHECK_IN",
        batteryLevel: 100,
        exteriorCondition: "GOOD",
        interiorCondition: "GOOD",
        mileage: null,
        tireCondition: "GOOD",
        damageNotes: null,
        notes: null,
        documentVerified: false,
    })

    const [bookings, setBookings] = useState([])
    const [isLoadingBookings, setIsLoadingBookings] = useState(true)
    const [loadingDetail, setLoadingDetail] = useState(false)
    const [isConfirmed, setIsConfirmed] = useState(false)
    const [currentStaff, setCurrentStaff] = useState(null)
    const [vehicleInfo, setVehicleInfo] = useState(null)
    const [stations, setStations] = useState([])
    const [isLoadingStations, setIsLoadingStations] = useState(true)
    const [staffStats, setStaffStats] = useState(null)
    const [isLoadingStats, setIsLoadingStats] = useState(false)
    const [pendingInspections, setPendingInspections] = useState([])
    const [completedInspections, setCompletedInspections] = useState([])
    const [isLoadingInspections, setIsLoadingInspections] = useState(false)
    const [uploadedImages, setUploadedImages] = useState({
        exterior: [],
        interior: [],
        engine: [],
        damage: [],
        accessories: [],
        odometer: [],
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Expanded image upload categories for comprehensive vehicle inspection
    const imageCategories = [
        { key: "exterior", label: "Ngoại Thất", description: "Ảnh bên ngoài xe (4 góc, cửa, đèn, gương)" },
        { key: "interior", label: "Nội Thất", description: "Ảnh nội thất (ghế ngồi, bảng điều khiển, vô lăng)" },
        { key: "engine", label: "Động Cơ & Pin", description: "Ảnh khoang máy, pin, cổng sạc" },
        { key: "damage", label: "Hư Hỏng", description: "Ảnh các vết trầy xước, móp méo, hư hỏng" },
        { key: "accessories", label: "Phụ Kiện", description: "Ảnh phụ kiện trong xe (dây sạc, bộ công cụ)" },
        { key: "odometer", label: "Odometer", description: "Ảnh đồng hồ số km hiện tại của xe" },
    ]

    // Fetch current staff info on mount
    React.useEffect(() => {
        let mounted = true
            ; (async () => {
                try {
                    const res = await apiClient.get('/api/auth/me')
                    if (res?.success && res?.data?.user && mounted) {
                        const staff = res.data.user
                        setCurrentStaff(staff)
                        setFormData(prev => ({
                            ...prev,
                            staffId: staff._id || staff.id || "",
                        }))
                    }
                } catch (e) {
                    console.warn('Failed to fetch current staff info:', e)
                }
            })()
        return () => { mounted = false }
    }, [])

    // Fetch stations on mount
    React.useEffect(() => {
        let mounted = true
            ; (async () => {
                try {
                    setIsLoadingStations(true)
                    const res = await apiClient.get(endpoints.stations.getAll())
                    console.debug('Stations response:', res)

                    const payload = res?.data?.stations ?? res?.data ?? []
                    const list = Array.isArray(payload) ? payload : []

                    if (mounted) {
                        setStations(list)
                        console.debug('Loaded stations:', list)
                    }
                } catch (e) {
                    console.error('Failed to load stations', e)
                    if (mounted) setStations([])
                } finally {
                    if (mounted) setIsLoadingStations(false)
                }
            })()

        return () => { mounted = false }
    }, [])

    // Fetch CONFIRMED bookings on mount
    React.useEffect(() => {
        let mounted = true
            ; (async () => {
                try {
                    setIsLoadingBookings(true)
                    const res = await apiClient.get('/api/bookings?status=CONFIRMED')
                    console.debug('Bookings response:', res)

                    const payload = res?.data?.bookings ?? res?.data ?? []
                    const list = Array.isArray(payload) ? payload : []

                    // Enrich bookings with normalized renter/vehicle info
                    const enriched = await Promise.all(
                        list.map(async (b) => {
                            let enrichedBooking = { ...b }

                            // Fetch renter info if missing
                            const renterIdValue = b.renterId?._id || b.renterId
                            if ((!b.renter?.name && !b.renter?.fullName) && renterIdValue) {
                                try {
                                    const renterRes = await apiClient.get(endpoints.renters.getById(renterIdValue))
                                    if (renterRes?.success) {
                                        enrichedBooking.renter = renterRes.data?.renter ?? renterRes.data ?? b.renter
                                    }
                                } catch (e) {
                                    console.warn(`Failed to fetch renter ${renterIdValue}:`, e)
                                }
                            }

                            // Fetch vehicle info if missing
                            const vehicleIdValue = b.vehicleId?._id || b.vehicleId
                            if ((!b.vehicle?.licensePlate && !b.vehicle?.brand) && vehicleIdValue) {
                                try {
                                    const vehicleRes = await apiClient.get(endpoints.vehicles.getById(vehicleIdValue))
                                    if (vehicleRes?.success) {
                                        enrichedBooking.vehicle = vehicleRes.data?.vehicle ?? vehicleRes.data ?? b.vehicle
                                    }
                                } catch (e) {
                                    console.warn(`Failed to fetch vehicle ${vehicleIdValue}:`, e)
                                }
                            }

                            // Normalize display info
                            const renterName = enrichedBooking.renter?.name || enrichedBooking.user?.name || enrichedBooking.renter?.fullName || enrichedBooking.user?.fullName || ''
                            const vehicle = enrichedBooking.vehicle ?? {}
                            const vehicleLabel = vehicle?.brand ? `${vehicle.brand}${vehicle.model ? ' ' + vehicle.model : ''}` : vehicle?.name || vehicle?.licensePlate || ''

                            return { ...enrichedBooking, renterName, vehicleLabel }
                        })
                    )

                    if (mounted) {
                        console.debug('Enriched bookings:', enriched)
                        setBookings(enriched)
                    }
                } catch (e) {
                    console.error('Failed to load confirmed bookings', e)
                    if (mounted) setBookings([])
                } finally {
                    if (mounted) setIsLoadingBookings(false)
                }
            })()

        return () => { mounted = false }
    }, [])





    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: name === "batteryLevel" || name === "mileage" ? Number.parseFloat(value) : value,
        }))
    }

    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleBookingSelect = (bookingId) => {
        if (!bookingId || bookingId === "none") {
            setFormData((prev) => ({
                ...prev,
                bookingId: null,
                vehicleId: "",
            }))
            setIsConfirmed(false)
            setVehicleInfo(null)
            return
        }

        const booking = bookings.find((b) => b.id === bookingId)
        if (booking) {
            setLoadingDetail(true)
                ; (async () => {
                    try {
                        const vehicleId = booking.vehicleId?._id || booking.vehicleId || booking.vehicle?._id || ""

                        // Check if booking already has inspection
                        const existingInspections = await checkExistingInspection(bookingId)
                        if (existingInspections.length > 0) {
                            const hasCheckIn = existingInspections.some(insp => insp.inspectionType === 'CHECK_IN')
                            if (hasCheckIn) {
                                alert("Booking này đã có inspection CHECK_IN rồi!")
                                return
                            }
                        }

                        // Fetch detailed vehicle info if we have vehicle ID
                        let vehicleDetails = booking.vehicle || {}
                        if (vehicleId && (!vehicleDetails.licensePlate || !vehicleDetails.brand)) {
                            try {
                                const vehicleRes = await apiClient.get(endpoints.vehicles.getById(vehicleId))
                                if (vehicleRes?.success) {
                                    vehicleDetails = vehicleRes.data?.vehicle ?? vehicleRes.data ?? vehicleDetails
                                }
                            } catch (e) {
                                console.warn(`Failed to fetch vehicle details for ${vehicleId}:`, e)
                            }
                        }

                        setVehicleInfo(vehicleDetails)
                        setFormData((prev) => ({
                            ...prev,
                            bookingId,
                            vehicleId: vehicleId,
                        }))
                        setIsConfirmed(true)
                    } catch (error) {
                        console.error("Error processing booking selection:", error)
                    } finally {
                        setLoadingDetail(false)
                    }
                })()
        }
    }

    const selectedBooking = bookings.find((b) => b.id === formData.bookingId)

    const handleImageUpload = (e, category) => {
        const files = e.currentTarget.files
        if (!files) return

        Array.from(files).forEach((file) => {
            if (!file.type.startsWith("image/")) {
                console.warn(`File ${file.name} is not an image`)
                return
            }

            const reader = new FileReader()
            reader.onload = (event) => {
                const preview = event.target?.result
                const newImage = {
                    id: Math.random().toString(36).substr(2, 9),
                    file,
                    preview,
                    category,
                }

                setUploadedImages((prev) => ({
                    ...prev,
                    [category]: [...prev[category], newImage],
                }))
            }
            reader.onerror = () => {
                console.error(`Failed to read file ${file.name}`)
            }
            reader.readAsDataURL(file)
        })
    }

    const handleRemoveImage = (category, imageId) => {
        setUploadedImages((prev) => ({
            ...prev,
            [category]: prev[category].filter((img) => img.id !== imageId),
        }))
    }

    // Validate stationId before submit
    const handleSubmit = (e) => {
        e.preventDefault()
        setIsSubmitting(true)

            ; (async () => {
                try {
                    // Validate required fields
                    if (!formData.vehicleId || !formData.staffId || !formData.stationId) {
                        alert("Vui lòng điền đầy đủ thông tin xe, nhân viên và nơi nhận xe")
                        return
                    }

                    if (!formData.bookingId) {
                        alert("Vui lòng chọn booking trước khi submit")
                        return
                    }

                    // Prepare inspection data
                    const inspectionData = {
                        vehicleId: formData.vehicleId,
                        staffId: formData.staffId,
                        bookingId: formData.bookingId,
                        stationId: formData.stationId,
                        inspectionType: formData.inspectionType,
                        batteryLevel: formData.batteryLevel,
                        exteriorCondition: formData.exteriorCondition,
                        interiorCondition: formData.interiorCondition,
                        mileage: formData.mileage,
                        tireCondition: formData.tireCondition,
                        accessories: [], // Will be populated based on images
                        damageNotes: formData.damageNotes, // ✅ Notes được lưu
                        notes: formData.notes, // ✅ Notes khác được lưu
                        documentVerified: formData.documentVerified,
                        isCompleted: true,
                    }

                    console.log("=== INSPECTION DATA TO BE SENT ===")
                    console.log("vehicleId:", formData.vehicleId)
                    console.log("staffId:", formData.staffId)
                    console.log("bookingId:", formData.bookingId)
                    console.log("stationId:", formData.stationId)
                    console.log("batteryLevel:", formData.batteryLevel)
                    console.log("mileage:", formData.mileage)
                    console.log("damageNotes:", formData.damageNotes)
                    console.log("notes:", formData.notes)
                    console.log("documentVerified:", formData.documentVerified)
                    console.log("conditions:", {
                        exterior: formData.exteriorCondition,
                        interior: formData.interiorCondition,
                        tire: formData.tireCondition
                    })
                    console.log("Full payload:", inspectionData)

                    console.log("Creating inspection:", inspectionData)

                    // Step 1: Create inspection record
                    const inspectionRes = await apiClient.post(endpoints.bookings.checkIn(inspectionData.bookingId), inspectionData)

                    if (!inspectionRes?.success || !inspectionRes?.data?.inspection?.id) {
                        throw new Error('Failed to create inspection record')
                    }

                    const inspectionId = inspectionRes.data.inspection.id
                    const createdInspection = inspectionRes.data.inspection
                    console.log("Created inspection with ID:", inspectionId)
                    console.log("Created inspection details:", createdInspection)

                    // Step 2: Upload images if any
                    const allImages = Object.values(uploadedImages).flat()
                    if (allImages.length > 0) {
                        const imageFormData = new FormData()
                        allImages.forEach((img, index) => {
                            imageFormData.append('images', img.file)
                            imageFormData.append(`categories[${index}]`, img.category)
                        })

                        console.log("Uploading", allImages.length, "images for inspection", inspectionId)

                        const uploadRes = await apiClient.post(
                            endpoints.inspections.uploadImages(inspectionId),
                            imageFormData,
                            {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                },
                            }
                        )

                        if (!uploadRes?.success) {
                            console.warn('Image upload failed:', uploadRes)
                        } else {
                            console.log("Images uploaded successfully")
                            console.log("Image upload response:", uploadRes.data)
                        }
                    }

                    // Auto-refresh data after successful submission
                    alert("Kiểm tra xe đã được lưu thành công!")

                    // Step 3: Check-in the booking (start rental)
                    try {
                        const checkInData = {
                            actualStartTime: new Date().toISOString(),
                            actualPickupLocation: formData.stationId,
                            pickupOdometer: formData.mileage || 0,
                            batteryLevel: formData.batteryLevel,
                        }
                        console.log("Checking in booking:", checkInData)
                        const checkInRes = await apiClient.post(endpoints.bookings.checkIn(inspectionData.bookingId), checkInData)
                        if (checkInRes?.success) {
                            console.log("Booking checked in successfully")
                            // Update local vehicle status to RENTED
                            setVehicleInfo(prev => prev ? { ...prev, status: 'RENTED' } : prev)

                            // Also persist vehicle status change on the server and notify other UI parts
                            try {
                                const vehicleIdToUpdate = inspectionData.vehicleId
                                if (vehicleIdToUpdate) {
                                    const vehicleUpdatePayload = {
                                        status: 'RENTED',
                                        ...(typeof formData.batteryLevel !== 'undefined' ? { batteryLevel: formData.batteryLevel } : {}),
                                    }
                                    const updateRes = await apiClient.patch(
                                        endpoints.vehicles.update(vehicleIdToUpdate),
                                        vehicleUpdatePayload
                                    )
                                    if (updateRes?.success) {
                                        const updatedVehicle = updateRes.data?.vehicle ?? updateRes.data ?? null
                                        if (updatedVehicle) {
                                            setVehicleInfo(updatedVehicle)
                                        }
                                        // Dispatch event so other components (vehicle list) can refresh if they listen
                                        try {
                                            window.dispatchEvent(new CustomEvent('vehicleStatusChanged', {
                                                detail: { vehicleId: vehicleIdToUpdate, status: 'RENTED' }
                                            }))
                                        } catch (e) {
                                            // ignore event errors
                                        }
                                    } else {
                                        console.warn('Vehicle update API returned failure:', updateRes)
                                    }
                                }
                            } catch (vehErr) {
                                console.warn('Failed to persist vehicle status to server:', vehErr)
                            }
                        } else {
                            console.warn("Check-in failed:", checkInRes)
                        }
                    } catch (checkInError) {
                        console.warn("Error during check-in:", checkInError)
                        // Non-blocking: don't fail the whole process
                    }

                    // Refresh pending inspections count
                    try {
                        const pendingRes = await apiClient.get(endpoints.inspections.getPending())
                        const pendingData = pendingRes?.data?.inspections ?? pendingRes?.data ?? []
                        setPendingInspections(Array.isArray(pendingData) ? pendingData : [])
                    } catch (e) {
                        console.warn('Failed to refresh pending inspections:', e)
                    }

                    // Reset form after successful submission
                    setFormData({
                        vehicleId: "",
                        staffId: currentStaff?._id || currentStaff?.id || "",
                        bookingId: null,
                        stationId: "",
                        inspectionType: "CHECK_IN",
                        batteryLevel: 100,
                        exteriorCondition: "GOOD",
                        interiorCondition: "GOOD",
                        mileage: null,
                        tireCondition: "GOOD",
                        damageNotes: null,
                        notes: null,
                        documentVerified: false,
                    })
                    setUploadedImages({ exterior: [], interior: [], engine: [], damage: [], accessories: [], odometer: [] })
                    setIsConfirmed(false)
                    setVehicleInfo(null)

                } catch (error) {
                    console.error("Error submitting inspection:", error)
                    alert("Có lỗi xảy ra khi lưu kiểm tra xe. Vui lòng thử lại.")
                } finally {
                    setIsSubmitting(false)
                }
            })()
    }

    const totalImages = Object.values(uploadedImages).reduce((total, categoryImages) => total + categoryImages.length, 0)
    const categoriesCovered = imageCategories.filter(cat => uploadedImages[cat.key].length > 0).length

    const handleRefresh = () => {
        // Reload the entire page to reset all states and data
        window.location.reload()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Kiểm Tra Xe</h1>
                    <p className="text-gray-600">Hoàn thành biểu mẫu kiểm tra chi tiết cho xe của bạn</p>

                    {/* Staff Stats Summary */}
                    {staffStats && !isLoadingStats && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-lg shadow border">
                                <div className="text-sm text-muted-foreground">Tổng số kiểm tra</div>
                                <div className="text-2xl font-bold text-blue-600">{staffStats.totalInspections || 0}</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow border">
                                <div className="text-sm text-muted-foreground">Hoàn thành hôm nay</div>
                                <div className="text-2xl font-bold text-green-600">{staffStats.todayCompleted || 0}</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow border">
                                <div className="text-sm text-muted-foreground">Đang chờ xử lý</div>
                                <div className="text-2xl font-bold text-orange-600">{pendingInspections.length}</div>
                            </div>
                        </div>
                    )}

                    {/* Quick Actions - Recent Inspections */}
                    {completedInspections.length > 0 && (
                        <div className="mt-4 bg-white p-4 rounded-lg shadow border">
                            <h3 className="font-semibold text-gray-900 mb-3">Kiểm tra gần đây</h3>
                            <div className="space-y-2">
                                {completedInspections.slice(0, 3).map((inspection) => (
                                    <div key={inspection._id || inspection.id} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">
                                            {inspection.vehicle?.licensePlate || 'N/A'} - {inspection.inspectionType}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(inspection.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div onSubmit={handleSubmit} className="space-y-6">
                    {/* Booking Selection - Prominent */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="bg-white border-b border-border rounded-t-lg">
                            <CardTitle>1. Chọn đơn đặt cần xử lý</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div>
                                <Label className="text-gray-700 font-semibold mb-2 block">Select booking</Label>
                                <Select
                                    value={formData.bookingId || "none"}
                                    onValueChange={handleBookingSelect}
                                    disabled={isLoadingBookings || loadingDetail}
                                >
                                    <SelectTrigger className="h-12">
                                        <SelectValue
                                            placeholder={
                                                isLoadingBookings
                                                    ? "Đang tải..."
                                                    : loadingDetail
                                                        ? "Đang lấy thông tin..."
                                                        : "Chọn đơn đặt xe"
                                            }
                                        />
                                        {loadingDetail && <Loader className="h-4 w-4 animate-spin ml-2" />}
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Không chọn</SelectItem>
                                        {bookings.map((b) => (
                                            <SelectItem key={b.id} value={b.id}>
                                                <div className="flex items-center gap-3">
                                                    <div>
                                                        <div className="font-medium">{b.renterName || "Người thuê"}</div>
                                                        <div className="text-xs text-gray-500">{b.vehicleLabel || "Xe thuê"}</div>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedBooking && (
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500">Khách hàng</p>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-lg">{selectedBooking.renterName}</p>
                                            {isConfirmed && <Check className="h-5 w-5 text-green-600" />}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500">Xe</p>
                                        <p className="font-semibold text-lg">{selectedBooking.vehicleLabel}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Vehicle & Staff Information */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="bg-white border-b border-border rounded-t-lg">
                            <CardTitle>2. Thông Tin Xe & Nhân Viên</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Nhập ID xe, nhân viên và loại kiểm tra
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <Label htmlFor="vehicleLicensePlate" className="text-gray-700 font-semibold">
                                        Biển Số Xe <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="vehicleLicensePlate"
                                        value={vehicleInfo?.licensePlate || "Chưa chọn xe"}
                                        placeholder="Biển số xe"
                                        className="mt-2"
                                        readOnly
                                        disabled={!vehicleInfo?.licensePlate}
                                    />
                                    {vehicleInfo?.brand && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            <span className="font-medium">{vehicleInfo.brand}{vehicleInfo.model ? ' ' + vehicleInfo.model : ''}</span>
                                        </p>
                                    )}
                                    {/* Hidden input to keep vehicleId for form submission */}
                                    <input type="hidden" name="vehicleId" value={formData.vehicleId} />
                                </div>
                                <div>
                                    <Label htmlFor="staffName" className="text-gray-700 font-semibold">
                                        Nhân Viên Xử Lý <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="staffName"
                                        value={currentStaff?.name || "Đang tải..."}
                                        placeholder="Tên nhân viên"
                                        className="mt-2"
                                        readOnly
                                        disabled={!currentStaff?.name}
                                    />
                                    {currentStaff?.role && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Chức vụ: <span className="font-medium">{currentStaff.role}</span>
                                        </p>
                                    )}
                                    {/* Hidden input to keep staffId for form submission */}
                                    <input type="hidden" name="staffId" value={formData.staffId} />
                                </div>
                                <div>
                                    <Label htmlFor="stationId" className="text-gray-700 font-semibold">
                                        Nơi Nhận Xe <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={formData.stationId} onValueChange={(value) => handleSelectChange("stationId", value)} disabled={isLoadingStations}>
                                        <SelectTrigger className="mt-2">
                                            <SelectValue placeholder={isLoadingStations ? "Đang tải trạm..." : "Chọn nơi nhận xe"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {stations.length === 0 ? (
                                                <SelectItem value="no-stations" disabled>
                                                    Không có trạm nào khả dụng
                                                </SelectItem>
                                            ) : (
                                                stations.map((station) => (
                                                    <SelectItem key={station._id || station.id} value={station._id || station.id}>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{station.name}</span>
                                                            <span className="text-xs text-muted-foreground">{station.address}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="inspectionType" className="text-gray-700 font-semibold">
                                        Loại Kiểm Tra <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={formData.inspectionType} onValueChange={(value) => handleSelectChange("inspectionType", value)}>
                                        <SelectTrigger className="mt-2">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CHECK_IN">Kiểm Tra Nhận Xe</SelectItem>
                                            <SelectItem value="CHECK_OUT">Kiểm Tra Trả Xe</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="mileage" className="text-gray-700 font-semibold">
                                        Số Km (Tùy Chọn)
                                    </Label>
                                    <Input
                                        id="mileage"
                                        name="mileage"
                                        type="number"
                                        value={formData.mileage || ""}
                                        onChange={handleInputChange}
                                        placeholder="Nhập số km"
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="batteryLevel" className="text-gray-700 font-semibold">
                                        Mức Pin (%) <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Input
                                            id="batteryLevel"
                                            name="batteryLevel"
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={formData.batteryLevel}
                                            onChange={handleInputChange}
                                            className="flex-1"
                                        />
                                        <span className="text-sm font-semibold text-gray-600 w-12">{formData.batteryLevel}%</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Vehicle Condition */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="bg-white border-b border-border rounded-t-lg">
                            <CardTitle>3. Tình Trạng Xe</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Đánh giá tình trạng ngoài, trong và lốp xe
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { field: "exteriorCondition", label: "Tình Trạng Ngoài" },
                                    { field: "interiorCondition", label: "Tình Trạng Trong" },
                                    { field: "tireCondition", label: "Tình Trạng Lốp" },
                                ].map(({ field, label }) => (
                                    <div key={field}>
                                        <Label htmlFor={field} className="text-gray-700 font-semibold">
                                            {label}
                                        </Label>
                                        <Select value={formData[field]} onValueChange={(value) => handleSelectChange(field, value)}>
                                            <SelectTrigger className="mt-2">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="GOOD">Tốt</SelectItem>
                                                <SelectItem value="FAIR">Trung Bình</SelectItem>
                                                <SelectItem value="POOR">Kém</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Damage & Notes */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="bg-white border-b border-border rounded-t-lg">
                            <CardTitle>4. Hư Hỏng & Ghi Chú</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div>
                                <Label htmlFor="damageNotes" className="text-gray-700 font-semibold">
                                    Ghi Chú Hư Hỏng
                                </Label>
                                <Textarea
                                    id="damageNotes"
                                    name="damageNotes"
                                    value={formData.damageNotes || ""}
                                    onChange={handleInputChange}
                                    placeholder="Mô tả chi tiết các hư hỏng..."
                                    className="mt-2 min-h-24"
                                />
                            </div>
                            <div>
                                <Label htmlFor="notes" className="text-gray-700 font-semibold">
                                    Ghi Chú Khác
                                </Label>
                                <Textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes || ""}
                                    onChange={handleInputChange}
                                    placeholder="Ghi chú bổ sung..."
                                    className="mt-2 min-h-24"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Image Upload Section */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="bg-white border-b border-border rounded-t-lg">
                            <CardTitle>5. Tải Lên Hình Ảnh Kiểm Tra</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Tải lên ảnh cho 6 danh mục để ghi lại tình trạng xe chi tiết
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {imageCategories.map((category) => (
                                    <div key={category.key} className="space-y-4 p-4 border border-border rounded-lg">
                                        <div className="flex flex-col gap-1">
                                            <h3 className="font-semibold text-base text-center">{category.label}</h3>
                                            <p className="text-xs text-muted-foreground text-center">{category.description}</p>
                                        </div>
                                        <ImageUploadSection
                                            category={category.label}
                                            imageCount={uploadedImages[category.key].length}
                                            onImageUpload={(e) => handleImageUpload(e, category.key)}
                                        />
                                        <ImagePreview
                                            images={uploadedImages[category.key]}
                                            onRemoveImage={(imageId) => handleRemoveImage(category.key, imageId)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Summary */}
                    <CheckInSummary
                        totalImages={totalImages}
                        categoriesCovered={categoriesCovered}
                        totalCategories={imageCategories.length}
                    />

                    {/* Document Verification */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="bg-white border-b border-border rounded-t-lg">
                            <CardTitle>6. Xác Minh Tài Liệu</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <input
                                    type="checkbox"
                                    id="documentVerified"
                                    checked={formData.documentVerified}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            documentVerified: e.target.checked,
                                        }))
                                    }
                                    className="w-5 h-5 rounded border-gray-300"
                                />
                                <Label htmlFor="documentVerified" className="text-gray-700 font-semibold cursor-pointer">
                                    Tôi xác nhận rằng tất cả tài liệu khách hàng đã được xác minh
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex gap-4">
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                                    Đang Lưu...
                                </>
                            ) : (
                                <>
                                    <Check className="w-5 w-5 mr-2" />
                                    Hoàn Thành Kiểm Tra
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 py-3 rounded-lg"
                            onClick={handleRefresh}
                            disabled={isSubmitting}
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Làm Mới
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CheckInPage