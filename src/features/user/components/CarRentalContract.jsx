"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../shared/components/ui/card"
import { Button } from "../../shared/components/ui/button"
import { Checkbox } from "../../shared/components/ui/checkbox"
import { CheckCircle2, AlertCircle, User, Phone, Mail, MapPin, Calendar, Zap, DollarSign, Check } from "lucide-react"

export default function RentalContractPage() {
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [bookings, setBookings] = useState(null)
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    notes: "Xe có vết xước nhỏ ở cánh trái, pin còn 85%",
    clauses: "Yêu cầu trả xe trước 18:00 hôm nay",
    images: {
      exterior: "image_exterior.jpg",
      interior: "image_interior.jpg",
      engine: "image_engine.jpg",
      damage: "image_damage.jpg",
      accessories: "image_accessories.jpg",
      odometer: "image_odometer.jpg",
    },
  })

  const [agreements, setAgreements] = useState({
    termsAccepted: false,
    conditionsAccepted: false,
    damageResponsibility: false,
    dataPrivacy: false,
  })

  // Mock booking data (fallback)
  const mockBookings = [
    {
      id: 1,
      bookingCode: "BK001",
      renterName: "Nguyễn Văn A",
      renterPhone: "0912345678",
      scooterModel: "Xiaomi Mi 3",
      rentalDate: "2024-10-20",
      returnDate: "2024-10-22",
      duration: "2 ngày",
      price: "200.000 VNĐ",
      staff: {
        id: 1,
        name: "Trần Thị B",
        phone: "0987654321",
        email: "tranb@company.com",
      },
      station: {
        id: 1,
        name: "Trạm Hà Nội - Hoàn Kiếm",
        address: "123 Đường Tràng Tiền, Hoàn Kiếm, Hà Nội",
        phone: "024-1234-5678",
      },
    },
    {
      id: 2,
      bookingCode: "BK002",
      renterName: "Phạm Thị C",
      renterPhone: "0923456789",
      scooterModel: "Xiaomi Mi 4 Pro",
      rentalDate: "2024-10-21",
      returnDate: "2024-10-23",
      duration: "2 ngày",
      price: "250.000 VNĐ",
      staff: {
        id: 2,
        name: "Lê Văn D",
        phone: "0976543210",
        email: "levand@company.com",
      },
      station: {
        id: 2,
        name: "Trạm Hà Nội - Ba Đình",
        address: "456 Đường Đinh Tiên Hoàng, Ba Đình, Hà Nội",
        phone: "024-8765-4321",
      },
    },
    {
      id: 3,
      bookingCode: "BK003",
      renterName: "Vũ Minh E",
      renterPhone: "0934567890",
      scooterModel: "Xiaomi Mi 3",
      rentalDate: "2024-10-22",
      returnDate: "2024-10-24",
      duration: "2 ngày",
      price: "200.000 VNĐ",
      staff: {
        id: 3,
        name: "Hoàng Anh F",
        phone: "0965432109",
        email: "hoangf@company.com",
      },
      station: {
        id: 1,
        name: "Trạm Hà Nội - Hoàn Kiếm",
        address: "123 Đường Tràng Tiền, Hoàn Kiếm, Hà Nội",
        phone: "024-1234-5678",
      },
    },
  ]

  const imageCategories = [
    {
      id: "exterior",
      label: "Ngoài Thất",
      description: "Ảnh bên ngoài và lá góc, cửa, đen guơng",
    },
    {
      id: "interior",
      label: "Nội Thất",
      description: "Ảnh nội thất bên trong, bảng điều khiển, vô lăng",
    },
    {
      id: "engine",
      label: "Động Cơ & Pin",
      description: "Ảnh khoang máy, pin, công sắc",
    },
    {
      id: "damage",
      label: "Hư Hỏng",
      description: "Ảnh các vết trầy xước, móp máo, hư hỏng",
    },
    {
      id: "accessories",
      label: "Phụ Kiện",
      description: "Ảnh phụ kiện trong xe (tấy sạc, công cụ)",
    },
    {
      id: "odometer",
      label: "Odometer",
      description: "Ảnh đồng hồ số km hiện tại của xe",
    },
  ]

  // fetch bookings for current user (backend should infer user from session or token)
  const fetchBookings = useCallback(async () => {
    setLoadingBookings(true)
    setError(null)
    try {
      const res = await fetch("/api/bookings?status=PENDING")
      if (!res.ok) throw new Error(`Failed to load bookings (${res.status})`)
      const json = await res.json()
      // Expect backend to return { success, data: { bookings: [...], pagination } } or array
      if (json && Array.isArray(json.data?.bookings)) {
        setBookings(json.data.bookings)
      } else if (Array.isArray(json)) {
        setBookings(json)
      } else {
        // fallback to mock if unexpected shape
        setBookings(mockBookings)
      }
    } catch (err) {
      console.warn("fetchBookings error:", err)
      setError("Không thể tải các booking. Đang dùng dữ liệu offline.")
      setBookings(mockBookings)
    } finally {
      setLoadingBookings(false)
    }
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  // fetch latest booking details
  const fetchBookingDetails = async (id) => {
    try {
      const res = await fetch(`/api/bookings/${id}`)
      if (!res.ok) throw new Error(`Booking ${id} not found`)
      const json = await res.json()
      // Expect json.data.booking or json.booking
      const booking = json.data?.booking ?? json.booking ?? json
      setSelectedBooking(booking)
    } catch (err) {
      console.warn("fetchBookingDetails:", err)
      // keep currently selected booking if fetch fails
    }
  }

  const handleBookingSelect = (booking) => {
    // attempt to fetch fresh details from backend
    setSelectedBooking(booking) // optimistic
    fetchBookingDetails(booking.id)
  }

  const handleAgreementChange = (field, value) => {
    setAgreements((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const allAgreementsAccepted = Object.values(agreements).every((v) => v === true)

  // sign contract -> request backend to change booking status to CONFIRMED
  const handleSubmit = async () => {
    if (!selectedBooking) {
      alert("Vui lòng chọn một booking")
      return
    }
    if (!allAgreementsAccepted) {
      alert("Vui lòng đồng ý với tất cả các điều khoản trước khi ký hợp đồng")
      return
    }
    setActionLoading(true)
    try {
      // Use updateBookingStatus endpoint: PATCH /api/bookings/:id/status { status: "CONFIRMED" }
      const res = await fetch(`/api/bookings/${selectedBooking.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CONFIRMED" }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        console.error("Failed to confirm booking:", res.status, body)
        alert("Không thể ký hợp đồng — xin thử lại sau.")
        return
      }
      const json = await res.json().catch(() => null)
      const updated = json?.data?.booking ?? json?.booking ?? json
      // update UI
      setSelectedBooking(updated)
      // refresh bookings list to reflect changed status
      fetchBookings()
      alert("Hợp đồng điện tử đã được ký thành công!")
    } catch (err) {
      console.error("handleSubmit error:", err)
      alert("Có lỗi xảy ra khi ký hợp đồng. Vui lòng thử lại.")
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Hợp Đồng Thuê Xe Điện</h1>
          <p className="text-slate-600">Vui lòng hoàn thành tất cả các bước để ký hợp đồng điện tử</p>
        </div>

        {/* Step 1: Booking Selection */}
        <Card className="mb-6 border-slate-200 shadow-sm">
          <CardHeader className="bg-white border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold">
                1
              </div>
              <div>
                <CardTitle className="text-slate-900">Chọn Booking</CardTitle>
                <CardDescription>Lựa chọn booking thuê xe của bạn</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {loadingBookings && <div className="text-sm text-slate-500">Đang tải bookings...</div>}
              {error && <div className="text-sm text-red-600">{error}</div>}
              {(bookings ?? mockBookings).map((booking) => (
                <Card
                  key={booking.id}
                  className={`p-4 cursor-pointer transition-all border-2 ${selectedBooking?.id === booking.id
                    ? "border-blue-600 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  onClick={() => handleBookingSelect(booking)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">{booking.bookingCode}</h3>
                        <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">{booking.duration}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                        <div>
                          <p className="text-slate-500">Khách hàng</p>
                          <p className="font-medium text-slate-900">{booking.renterName}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Xe</p>
                          <p className="font-medium text-slate-900">{booking.scooterModel}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Ngày thuê</p>
                          <p className="font-medium text-slate-900">{booking.rentalDate}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Giá</p>
                          <p className="font-medium text-slate-900">{booking.price}</p>
                        </div>
                      </div>
                    </div>
                    {selectedBooking?.id === booking.id && (
                      <div className="ml-4 flex-shrink-0">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600">
                          <Check className="w-4 h-4 text-white" />
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Staff Info */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-white border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold">
                      2
                    </div>
                    <div>
                      <CardTitle className="text-slate-900">Thông Tin Nhân Viên</CardTitle>
                      <CardDescription>Nhân viên đảm nhiệm</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-500 mb-1">Tên nhân viên</p>
                        <p className="font-semibold text-slate-900">{selectedBooking.staff.name}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
                        <Phone className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-500 mb-1">Số điện thoại</p>
                        <p className="font-semibold text-slate-900">{selectedBooking.staff.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100">
                        <Mail className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-500 mb-1">Email</p>
                        <p className="font-semibold text-slate-900">{selectedBooking.staff.email}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rental Station Info */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-white border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold">
                      3
                    </div>
                    <div>
                      <CardTitle className="text-slate-900">Trạm Thuê</CardTitle>
                      <CardDescription>Trạm được chọn</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-500 mb-2">Tên trạm</p>
                      <p className="font-semibold text-slate-900 text-lg">{selectedBooking.station.name}</p>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Địa chỉ</p>
                        <p className="text-slate-900">{selectedBooking.station.address}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Số điện thoại</p>
                        <p className="font-semibold text-slate-900">{selectedBooking.station.phone}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Step 3: Contract Details */}
            <Card className="mb-6 border-slate-200 shadow-sm">
              <CardHeader className="bg-white border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold">
                    4
                  </div>
                  <div>
                    <CardTitle className="text-slate-900">Chi Tiết Hợp Đồng</CardTitle>
                    <CardDescription>Thông tin chi tiết về xe và hợp đồng</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-6 h-6 text-blue-600 mt-1" />
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Thời gian thuê</p>
                        <p className="font-semibold text-slate-900">{selectedBooking.rentalDate}</p>
                        <p className="text-sm text-slate-600">đến {selectedBooking.returnDate}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <div className="flex items-start gap-3">
                      <Zap className="w-6 h-6 text-green-600 mt-1" />
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Mẫu xe</p>
                        <p className="font-semibold text-slate-900">{selectedBooking.scooterModel}</p>
                        <p className="text-sm text-slate-600">{selectedBooking.duration}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-6 h-6 text-purple-600 mt-1" />
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Giá thuê</p>
                        <p className="font-semibold text-slate-900">{selectedBooking.price}</p>
                        <p className="text-sm text-slate-600">Tổng cộng</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Step 4: Images from Staff (Read-only) */}
            <Card className="mb-6 border-slate-200 shadow-sm">
              <CardHeader className="bg-white border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold">
                    5
                  </div>
                  <div>
                    <CardTitle className="text-slate-900">Hình Ảnh Kiểm Tra Từ Nhân Viên</CardTitle>
                    <CardDescription>Ảnh tình trạng xe được gửi bởi nhân viên (chỉ xem)</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {imageCategories.map((category) => (
                    <Card
                      key={category.id}
                      className="overflow-hidden border-slate-200 hover:border-slate-300 transition-all"
                    >
                      <div className="aspect-square flex flex-col items-center justify-center p-4 relative group bg-slate-50">
                        {formData.images[category.id] ? (
                          <div className="text-center">
                            <div className="text-green-600 mb-2">
                              <Check className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-medium text-slate-900">Đã tải lên</p>
                            <p className="text-xs text-slate-500 mt-1">Ảnh từ nhân viên</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="text-slate-400 mb-2">-</div>
                            <p className="text-sm font-medium text-slate-500">Chưa có ảnh</p>
                          </div>
                        )}
                      </div>
                      <div className="p-3 bg-white">
                        <h3 className="font-semibold text-slate-900 text-sm">{category.label}</h3>
                        <p className="text-xs text-slate-500 mt-1">{category.description}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step 5: Notes from Staff (Read-only) */}
            <Card className="mb-6 border-slate-200 shadow-sm">
              <CardHeader className="bg-white border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold">
                    6
                  </div>
                  <div>
                    <CardTitle className="text-slate-900">Ghi Chú & Hu Hỏng Từ Nhân Viên</CardTitle>
                    <CardDescription>Ghi chú từ nhân viên (chỉ xem)</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Ghi Chú Hu Hỏng</label>
                    <div className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 min-h-24">
                      {formData.notes || "Không có ghi chú"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Ghi Chú Khác</label>
                    <div className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 min-h-24">
                      {formData.clauses || "Không có ghi chú bổ sung"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 6: Contract Agreement */}
            <Card className="mb-6 border-slate-200 shadow-sm">
              <CardHeader className="bg-white border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold">
                    7
                  </div>
                  <div>
                    <CardTitle className="text-slate-900">Xác Nhận Hợp Đồng Điện Tử</CardTitle>
                    <CardDescription>Vui lòng đồng ý với tất cả các điều khoản để ký hợp đồng</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Contract Terms */}
                  <Card className="border-slate-200">
                    <CardHeader className="bg-slate-50 border-b border-slate-200">
                      <CardTitle className="text-slate-900">Điều Khoản & Điều Kiện Hợp Đồng</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4 mb-6 text-sm text-slate-700 max-h-48 overflow-y-auto">
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2">1. Thời Hạn Thuê</h4>
                          <p>
                            Thời hạn thuê xe bắt đầu từ lúc nhận xe tại trạm và kết thúc khi trả xe tại trạm. Bất kỳ
                            thời gian sử dụng vượt quá thời hạn sẽ bị tính phí theo giá quy định.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2">2. Trách Nhiệm Bảo Quản Xe</h4>
                          <p>
                            Người thuê chịu trách nhiệm bảo quản xe trong suốt thời gian thuê. Mọi hư hỏng, mất mát hoặc
                            thiệt hại xảy ra trong thời gian thuê sẽ do người thuê chịu trách nhiệm.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2">3. Điều Kiện Sử Dụng</h4>
                          <p>
                            Xe chỉ được sử dụng cho mục đích cá nhân, không được cho thuê lại, không được sử dụng cho
                            hoạt động thương mại hoặc bất hợp pháp.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2">4. Bảo Hiểm & Bảo Vệ</h4>
                          <p>
                            Xe được bảo hiểm cơ bản. Người thuê có thể mua bảo hiểm bổ sung để tăng mức bảo vệ. Mọi yêu
                            cầu bảo hiểm phải được báo cáo trong vòng 24 giờ.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2">5. Phí & Thanh Toán</h4>
                          <p>
                            Phí thuê phải được thanh toán đầy đủ trước khi nhận xe. Các phí bổ sung (quá giờ, hư hỏng,
                            v.v.) sẽ được tính toán và thanh toán khi trả xe.
                          </p>
                        </div>
                      </div>

                      <div
                        className="flex items-start gap-4 p-5 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-400 cursor-pointer hover:from-green-100 hover:to-green-200 transition-all duration-200"
                        onClick={() => handleAgreementChange("termsAccepted", !agreements.termsAccepted)}
                      >
                        <Checkbox
                          id="terms"
                          checked={agreements.termsAccepted}
                          onCheckedChange={(checked) => handleAgreementChange("termsAccepted", Boolean(checked))}
                          className="w-6 h-6 mt-1 flex-shrink-0 cursor-pointer"
                        />
                        <label htmlFor="terms" className="text-base text-slate-800 cursor-pointer flex-1">
                          <span className="font-bold text-green-900">Tôi đồng ý với các điều khoản & điều kiện</span>
                          <span className="text-slate-700"> của hợp đồng thuê xe điện này</span>
                        </label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Damage Responsibility */}
                  <Card className="border-slate-200">
                    <CardHeader className="bg-slate-50 border-b border-slate-200">
                      <CardTitle className="text-slate-900">Trách Nhiệm Về Hư Hỏng</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-3 mb-6 text-sm text-slate-700">
                        <p>
                          <span className="font-semibold text-slate-900">Người thuê xác nhận rằng:</span>
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                          <li>Đã kiểm tra kỹ tình trạng xe trước khi nhận</li>
                          <li>Đã ghi lại tất cả các hư hỏng hiện có bằng ảnh</li>
                          <li>Sẽ chịu trách nhiệm cho mọi hư hỏng mới xảy ra trong thời gian thuê</li>
                          <li>Sẽ báo cáo ngay mọi tai nạn hoặc sự cố xảy ra</li>
                        </ul>
                      </div>

                      <div
                        className="flex items-start gap-4 p-5 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-400 cursor-pointer hover:from-green-100 hover:to-green-200 transition-all duration-200"
                        onClick={() => handleAgreementChange("damageResponsibility", !agreements.damageResponsibility)}
                      >
                        <Checkbox
                          id="damage"
                          checked={agreements.damageResponsibility}
                          onCheckedChange={(checked) => handleAgreementChange("damageResponsibility", Boolean(checked))}
                          className="w-6 h-6 mt-1 flex-shrink-0 cursor-pointer"
                        />
                        <label htmlFor="damage" className="text-base text-slate-800 cursor-pointer flex-1">
                          <span className="font-bold text-green-900">Tôi hiểu và chấp nhận trách nhiệm</span>
                          <span className="text-slate-700"> về mọi hư hỏng xảy ra trong thời gian thuê</span>
                        </label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Data Privacy */}
                  <Card className="border-slate-200">
                    <CardHeader className="bg-slate-50 border-b border-slate-200">
                      <CardTitle className="text-slate-900">Bảo Vệ Dữ Liệu Cá Nhân</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-3 mb-6 text-sm text-slate-700">
                        <p>
                          Dữ liệu cá nhân của bạn sẽ được xử lý theo chính sách bảo vệ dữ liệu của chúng tôi. Chúng tôi
                          cam kết bảo vệ thông tin của bạn và chỉ sử dụng nó cho mục đích liên quan đến hợp đồng thuê
                          xe.
                        </p>
                      </div>

                      <div
                        className="flex items-start gap-4 p-5 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-400 cursor-pointer hover:from-green-100 hover:to-green-200 transition-all duration-200"
                        onClick={() => handleAgreementChange("dataPrivacy", !agreements.dataPrivacy)}
                      >
                        <Checkbox
                          id="privacy"
                          checked={agreements.dataPrivacy}
                          onCheckedChange={(checked) => handleAgreementChange("dataPrivacy", Boolean(checked))}
                          className="w-6 h-6 mt-1 flex-shrink-0 cursor-pointer"
                        />
                        <label htmlFor="privacy" className="text-base text-slate-800 cursor-pointer flex-1">
                          <span className="font-bold text-green-900">
                            Tôi đồng ý với chính sách bảo vệ dữ liệu cá nhân
                          </span>
                          <span className="text-slate-700"> và cho phép xử lý dữ liệu của tôi</span>
                        </label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Conditions */}
                  <Card className="border-slate-200">
                    <CardHeader className="bg-slate-50 border-b border-slate-200">
                      <CardTitle className="text-slate-900">Điều Kiện Khác</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-3 mb-6 text-sm text-slate-700">
                        <p>
                          <span className="font-semibold text-slate-900">Các điều kiện bổ sung:</span>
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                          <li>Xe phải được trả lại đúng thời gian và địa điểm quy định</li>
                          <li>Xe phải được trả lại trong tình trạng sạch sẽ</li>
                          <li>Bình pin phải được sạc đầy trước khi trả xe</li>
                          <li>Mọi phí phát sinh phải được thanh toán trước khi trả xe</li>
                        </ul>
                      </div>

                      <div
                        className="flex items-start gap-4 p-5 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-400 cursor-pointer hover:from-green-100 hover:to-green-200 transition-all duration-200"
                        onClick={() => handleAgreementChange("conditionsAccepted", !agreements.conditionsAccepted)}
                      >
                        <Checkbox
                          id="conditions"
                          checked={agreements.conditionsAccepted}
                          onCheckedChange={(checked) => handleAgreementChange("conditionsAccepted", Boolean(checked))}
                          className="w-6 h-6 mt-1 flex-shrink-0 cursor-pointer"
                        />
                        <label htmlFor="conditions" className="text-base text-slate-800 cursor-pointer flex-1">
                          <span className="font-bold text-green-900">Tôi đồng ý với tất cả các điều kiện bổ sung</span>
                          <span className="text-slate-700"> được liệt kê ở trên</span>
                        </label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Warning */}
                  <div className="flex gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-800">
                      <p className="font-semibold mb-1">Lưu ý quan trọng:</p>
                      <p>
                        Bằng cách ký hợp đồng này, bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý với tất cả các điều
                        khoản và điều kiện. Hợp đồng này có giá trị pháp lý và bạn chịu trách nhiệm pháp lý về các vi
                        phạm.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agreement Status */}
            {allAgreementsAccepted && (
              <Card className="mb-6 border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-900">Tất cả điều khoản đã được chấp nhận</p>
                      <p className="text-sm text-green-700">Bạn đã sẵn sàng ký hợp đồng điện tử</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!allAgreementsAccepted && (
              <Card className="mb-6 border-amber-200 bg-amber-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-amber-900">Chưa hoàn thành tất cả các điều khoản</p>
                      <p className="text-sm text-amber-700">
                        Vui lòng đồng ý với tất cả các điều khoản trước khi ký hợp đồng
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <div className="flex gap-4 justify-end">
              <Button
                variant="outline"
                size="lg"
                className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
              >
                Hủy
              </Button>
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={!allAgreementsAccepted || actionLoading}
                className={`text-white ${allAgreementsAccepted ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-400 cursor-not-allowed"
                  }`}
              >
                {actionLoading ? "Đang xử lý..." : "Ký Hợp Đồng Điện Tử"}
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
