"use client"

import { useState, useEffect } from "react"
import { Button } from '../../../shared/components/ui/button'
import { Check, AlertCircle } from "lucide-react"
import { CheckInForm } from "./CheckInForm"
import { ImageUploadSection } from "./ImageUploadSection"
import { ImagePreview } from "./ImagePreview"
import { CheckInSummary } from "./CheckInSummary"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/card'
import { apiClient } from '../../../shared/lib/apiClient'
import { endpoints } from '../../../shared/lib/endpoints'

export function CheckInPage() {
    const [carId, setCarId] = useState("")
    const [carName, setCarName] = useState("")
    const [carColor, setCarColor] = useState("")
    const [licensePlate, setLicensePlate] = useState("")
    const [renterId, setRenterId] = useState("")
    const [renterName, setRenterName] = useState("")
    const [renterEmail, setRenterEmail] = useState("")

    const [userColor, setUserColor] = useState("")
    const [notes, setNotes] = useState("")
    const [images, setImages] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState("idle")
    const [bookings, setBookings] = useState([])
    const [isLoadingBookings, setIsLoadingBookings] = useState(true)

    const categories = ["Ngoại Thất", "Nội Thất", "Hư Hỏng", "Đồng Hồ", "Mức Pin", "Khác"]

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setIsLoadingBookings(true)
                const res = await apiClient.get('/api/bookings?status=CONFIRMED');
                console.debug('Initial bookings response:', res);

                if (res?.success) {
                    const payload = res.data?.bookings ?? res.data ?? []
                    let bookingsList = Array.isArray(payload) ? payload : []

                    const enrichedBookings = await Promise.all(
                        bookingsList.map(async (booking) => {
                            let enrichedBooking = { ...booking };

                            const renterIdValue = booking.renterId?._id || booking.renterId;
                            if ((!booking.renter?.name && !booking.renter?.fullName) && renterIdValue) {
                                try {
                                    const renterRes = await apiClient.get(endpoints.user.getById(renterIdValue));
                                    if (renterRes?.success) {
                                        enrichedBooking.renter = renterRes.data?.renter ?? renterRes.data ?? booking.renter;
                                    }
                                } catch (e) {
                                    console.warn(`Failed to fetch renter ${renterIdValue}:`, e);
                                }
                            }

                            const vehicleIdValue = booking.vehicleId?._id || booking.vehicleId;
                            if ((!booking.vehicle?.licensePlate) && vehicleIdValue) {
                                try {
                                    const vehicleRes = await apiClient.get(endpoints.vehicles.getById(vehicleIdValue));
                                    if (vehicleRes?.success) {
                                        enrichedBooking.vehicle = vehicleRes.data?.vehicle ?? vehicleRes.data ?? booking.vehicle;
                                    }
                                } catch (e) {
                                    console.warn(`Failed to fetch vehicle ${vehicleIdValue}:`, e);
                                }
                            }

                            return enrichedBooking;
                        })
                    );

                    console.debug('Enriched bookings:', enrichedBookings);
                    setBookings(enrichedBookings)
                } else {
                    setBookings([])
                }
            } catch (error) {
                console.error("[v0] Error fetching bookings:", error)
                setBookings([])
            } finally {
                setIsLoadingBookings(false)
            }
        }

        fetchBookings()
    }, [])

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
                setImages((prev) => [
                    ...prev,
                    {
                        id: Math.random().toString(36).substr(2, 9),
                        file,
                        preview,
                        category,
                    },
                ])
            }
            reader.onerror = () => {
                console.error(`Failed to read file ${file.name}`)
            }
            reader.readAsDataURL(file)
        })
    }

    const removeImage = (id) => {
        setImages((prev) => prev.filter((img) => img.id !== id))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!carId.trim() || !renterId.trim() || images.length === 0) {
            setSubmitStatus("error")
            return
        }

        setIsSubmitting(true)
        setSubmitStatus("idle")

        try {
            // If we have a vehicle id, upload images to vehicle images endpoint
            if (carId.trim() && images.length > 0) {
                const formData = new FormData()
                images.forEach((img) => {
                    // img.file is the File object
                    formData.append('images', img.file)
                    // include category if backend supports per-file metadata (optional)
                    if (img.category) {
                        formData.append('categories[]', img.category)
                    }
                })

                try {
                    const upRes = await apiClient.post(endpoints.vehicles.uploadImage(carId), formData)
                    console.debug('Vehicle images upload response:', upRes)
                    // optionally validate upRes.success or upRes.status
                    if (!upRes?.success && upRes?.status && Math.floor(upRes.status / 100) !== 2) {
                        throw new Error('Upload failed')
                    }
                } catch (uploadErr) {
                    console.error('Upload images failed', uploadErr)
                    setSubmitStatus("error")
                    setIsSubmitting(false)
                    return
                }
            }

            // Simulate API call for check-in record (or continue with actual check-in API)
            await new Promise((resolve) => setTimeout(resolve, 500))
            setSubmitStatus("success")

            setCarId("")
            setCarName("")
            setCarColor("")
            setLicensePlate("")
            setRenterId("")
            setRenterName("")
            setRenterEmail("")
            setRenterPhone("")
            setUserColor("")
            setNotes("")
            setImages([])

            setTimeout(() => setSubmitStatus("idle"), 3000)
        } catch (error) {
            console.error("[v0] Submission error:", error)
            setSubmitStatus("error")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        setCarName("")
        setCarColor("")
        setLicensePlate("")
        setRenterId("")
        setRenterName("")
        setRenterEmail("")

        setUserColor("")
        setNotes("")
        setImages([])
        setSubmitStatus("idle")
    }

    const imagesByCategory = categories.reduce((acc, cat) => {
        acc[cat] = images.filter((img) => img.category === cat)
        return acc
    }, {})

    const isFormValid = carId.trim() && renterId.trim() && images.length > 0

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Nhận Xe</h1>
                <p className="text-muted-foreground mt-2">Tải lên hình ảnh tình trạng xe và chi tiết cho người thuê</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <CheckInForm
                    carId={carId}
                    setCarId={setCarId}
                    renterId={renterId}
                    setRenterId={setRenterId}
                    notes={notes}
                    setNotes={setNotes}
                    bookings={bookings}
                    isLoadingBookings={isLoadingBookings}
                    carName={carName}
                    setCarName={setCarName}
                    carColor={carColor}
                    setCarColor={setCarColor}
                    licensePlate={licensePlate}
                    setLicensePlate={setLicensePlate}
                    renterName={renterName}
                    setRenterName={setRenterName}
                    renterEmail={renterEmail}
                    setRenterEmail={setRenterEmail}

                    userColor={userColor}
                    setUserColor={setUserColor}
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Hình Ảnh Tình Trạng Xe</CardTitle>
                        <CardDescription>Tải lên ảnh cho từng danh mục để ghi lại tình trạng xe</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {categories.map((category) => (
                            <div key={category} className="space-y-3">
                                <ImageUploadSection
                                    category={category}
                                    imageCount={imagesByCategory[category].length}
                                    onImageUpload={handleImageUpload}
                                />
                                <ImagePreview images={imagesByCategory[category]} onRemoveImage={removeImage} />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <CheckInSummary
                    totalImages={images.length}
                    categoriesCovered={Object.values(imagesByCategory).filter((arr) => arr.length > 0).length}
                    totalCategories={categories.length}
                />

                {submitStatus === "success" && (
                    <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
                        <Check className="h-5 w-5 flex-shrink-0" />
                        <p className="text-sm font-medium">Nhận xe thành công! Người thuê đã được thông báo.</p>
                    </div>
                )}

                {submitStatus === "error" && (
                    <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <p className="text-sm font-medium">
                            {!isFormValid
                                ? "Vui lòng điền đầy đủ thông tin và tải lên ít nhất một ảnh."
                                : "Không thể gửi nhận xe. Vui lòng thử lại."}
                        </p>
                    </div>
                )}

                <div className="flex gap-3">
                    <Button
                        type="submit"
                        disabled={isSubmitting || !isFormValid}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                    >
                        {isSubmitting ? "Đang Gửi..." : "Submit"}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancel}>
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    )
}