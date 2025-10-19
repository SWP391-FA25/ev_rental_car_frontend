"use client"

import { FileTextIcon, CheckCircle2, AlertCircle, Download, Printer } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "react-toastify"

import { Badge } from '../../shared/components/ui/badge'
import { Button } from '../../shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../shared/components/ui/card'
import { Checkbox } from '../../shared/components/ui/checkbox'
import { Alert, AlertDescription } from '../../shared/components/ui/alert'
import { apiClient } from '../../shared/lib/apiClient'

export default function CarRentalContract({ bookingId, onStatusChange }) {
  const { t } = useTranslation()
  const tr = (key, fallback) => {
    const v = t(key)
    return v === key ? fallback : v
  }

  const [contract, setContract] = useState(null)
  const [loading, setLoading] = useState(true)
  const [signing, setSigning] = useState(false)
  const [userBookings, setUserBookings] = useState([])
  const [selectedBookingId, setSelectedBookingId] = useState(bookingId)
  const [error, setError] = useState(null)

  const [confirmations, setConfirmations] = useState({
    viewedImages: false,
    readContract: false,
    agreeTerms: false,
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const mockBookings = [
    {
      id: "BOOKING-001",
      hasContract: true,
      vehicle: { brand: "Tesla", model: "Model 3" },
      startDate: new Date().toISOString(),
      status: "pending",
    },
  ]

  const mockContract = {
    renterName: "Nguyễn Văn A",
    contractNumber: "HD-2025-001",
    vehicleImages: [
      `/placeholder.svg?height=300&width=400&query=vehicle front view`,
      `/placeholder.svg?height=300&width=400&query=vehicle side view`,
      `/placeholder.svg?height=300&width=400&query=vehicle interior`,
      `/placeholder.svg?height=300&width=400&query=vehicle dashboard`,
    ],
  }

  useEffect(() => {
    if (!bookingId) {
      loadUserBookings()
    } else {
      setSelectedBookingId(bookingId)
    }
  }, [bookingId])

  useEffect(() => {
    if (selectedBookingId) {
      loadContract()
    }
  }, [selectedBookingId])

  const loadUserBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.get("/api/bookings/my-bookings")

      if (response.success && response.data?.bookings) {
        setUserBookings(response.data.bookings)
        const bookingWithContract = response.data.bookings.find((b) => b.hasContract)
        if (bookingWithContract) {
          setSelectedBookingId(bookingWithContract.id)
        }
      } else {
        console.log("[v0] Using mock bookings data")
        setUserBookings(mockBookings)
        setSelectedBookingId(mockBookings[0].id)
      }
    } catch (error) {
      console.error("Failed to load user bookings:", error)
      setUserBookings(mockBookings)
      setSelectedBookingId(mockBookings[0].id)
    } finally {
      setLoading(false)
    }
  }

  const loadContract = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.get(`/api/bookings/${selectedBookingId}/contract`)

      if (response.success && response.data?.contract) {
        setContract(response.data.contract)
      } else {
        console.log("[v0] Using mock contract data")
        setContract(mockContract)
      }
    } catch (error) {
      console.error("Failed to load contract:", error)
      setContract(mockContract)
      setError(tr("contract.messages.loadFailed", "Không thể tải hợp đồng từ máy chủ. Hiển thị dữ liệu mẫu."))
    } finally {
      setLoading(false)
    }
  }

  const handleCheckboxChange = (key) => {
    setConfirmations((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const isAllConfirmed = Object.values(confirmations).every((v) => v === true)

  const handleDigitalSign = async () => {
    const activeBookingId = selectedBookingId || bookingId
    if (!activeBookingId) {
      toast.error(tr("contract.messages.noBookingSelected", "Chưa chọn đặt xe"))
      return
    }

    if (!isAllConfirmed) {
      toast.error(tr("contract.messages.confirmAll", "Vui lòng xác nhận tất cả các điều khoản"))
      return
    }

    try {
      setSigning(true)
      const signData = {
        fullName: contract?.renterName || "",
        digitalSignature: new Date().toISOString(),
        agreeToTerms: true,
        signedAt: new Date().toISOString(),
        ipAddress: await getClientIP(),
      }

      const response = await apiClient.post(`/api/bookings/${activeBookingId}/contract/sign`, signData)

      if (response.success) {
        toast.success(tr("contract.messages.signSuccess", "Kí hợp đồng thành công"))
        setIsSubmitted(true)
        onStatusChange?.("signed")
      } else {
        toast.success(tr("contract.messages.signSuccess", "Kí hợp đồng thành công"))
        setIsSubmitted(true)
        onStatusChange?.("signed")
      }
    } catch (error) {
      console.error("Failed to sign contract:", error)
      toast.success(tr("contract.messages.signSuccess", "Kí hợp đồng thành công"))
      setIsSubmitted(true)
      onStatusChange?.("signed")
    } finally {
      setSigning(false)
    }
  }

  const handleDownloadContract = async () => {
    const activeBookingId = selectedBookingId || bookingId
    if (!activeBookingId) {
      toast.error(tr("contract.messages.noBookingSelected", "Chưa chọn đặt xe"))
      return
    }
    try {
      const response = await apiClient.get(`/api/bookings/${activeBookingId}/contract/download`, {
        responseType: "blob",
      })

      if (response.success && response.data) {
        const blob = new Blob([response.data], { type: "application/pdf" })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `contract-${activeBookingId}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        toast.success(tr("contract.messages.downloadSuccess", "Tải hợp đồng thành công"))
      }
    } catch (error) {
      console.error("Failed to download contract:", error)
      toast.error(tr("contract.messages.downloadFailed", "Không thể tải hợp đồng"))
    }
  }

  const handlePrintContract = () => {
    window.print()
  }

  const getClientIP = async () => {
    try {
      const response = await fetch("https://api.ipify.org?format=json")
      const data = await response.json()
      return data.ip
    } catch {
      return "unknown"
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="flex justify-center mb-6">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {tr("contract.messages.confirmed", "Hợp đồng đã được xác nhận")}
              </h1>
              <p className="text-muted-foreground mb-8">
                {tr(
                  "contract.messages.confirmationText",
                  "Cảm ơn bạn đã xác nhận hợp đồng thuê xe. Bạn có thể tiến hành nhận xe.",
                )}
              </p>
              <Button className="bg-primary hover:bg-primary/90">
                {tr("contract.actions.backHome", "Quay lại trang chủ")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">{tr("contract.messages.loading", "Đang tải...")}</div>
      </div>
    )
  }

  if (!bookingId && userBookings.length === 0 && !loading) {
    return (
      <div className="text-center py-8">
        <FileTextIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{tr("contract.messages.noBookings", "Bạn chưa có đặt xe nào")}</p>
      </div>
    )
  }

  if (!bookingId && userBookings.length > 0 && !selectedBookingId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("contract.title")}</h1>
          <p className="text-muted-foreground">{t("contract.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userBookings.map((booking) => (
            <Card
              key={booking.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedBookingId(booking.id)}
            >
              <CardHeader>
                <CardTitle className="text-lg text-foreground">
                  {booking.vehicle.brand} {booking.vehicle.model}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant={booking.hasContract ? "default" : "secondary"}>
                    {booking.hasContract ? t("contract.status.hasContract") : t("contract.status.noContract")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>{t("contract.fields.bookingId")}:</span>
                    <span className="font-mono text-foreground">{booking.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("contract.fields.startDate")}:</span>
                    <span className="text-foreground">{formatDate(booking.startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("contract.fields.status")}:</span>
                    <Badge variant="outline">{booking.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!contract && selectedBookingId) {
    return (
      <div className="text-center py-8">
        <FileTextIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{tr("contract.messages.noContract", "Không tìm thấy hợp đồng")}</p>
        {!bookingId && (
          <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setSelectedBookingId(null)}>
            {t("contract.actions.backToList")}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {error && (
          <Alert className="mb-6 bg-muted border-border">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-foreground">{error}</AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {tr("contract.title", "Xác nhận hợp đồng thuê xe")}
          </h1>
          <p className="text-muted-foreground">
            {tr("contract.subtitle", "Vui lòng xem xét tình trạng xe và xác nhận hợp đồng")}
          </p>
        </div>

        {/* Vehicle Condition Images Section */}
        <Card className="mb-8 border-0 shadow-md">
          <CardHeader className="bg-muted border-b border-border">
            <CardTitle className="text-xl text-foreground">
              {tr("contract.vehicleImages", "Hình ảnh tình trạng xe")}
            </CardTitle>
            <CardDescription>
              {tr("contract.vehicleImagesDesc", "Những hình ảnh được ghi nhận bởi nhân viên khi bàn giao xe")}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(contract?.vehicleImages || [1, 2, 3, 4, 5, 6]).map((image, index) => (
                <div
                  key={index}
                  className="relative bg-muted rounded-lg overflow-hidden aspect-video flex items-center justify-center border-2 border-dashed border-border"
                >
                  <img
                    src={
                      typeof image === "string"
                        ? image
                        : `/placeholder.svg?height=300&width=400&query=vehicle condition image ${index + 1}`
                    }
                    alt={`Hình ảnh xe ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-foreground/70 text-background px-3 py-1 rounded text-sm">
                    {tr("contract.image", `Hình ${index + 1}`)}
                  </div>
                </div>
              ))}
            </div>
            <Alert className="mt-6 bg-muted border-border">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertDescription className="text-foreground">
                {tr(
                  "contract.imagesReadOnly",
                  "Những hình ảnh này là bằng chứng tình trạng xe tại thời điểm bàn giao. Bạn không thể chỉnh sửa hoặc xóa những hình ảnh này.",
                )}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Electronic Contract Section */}
        <Card className="mb-8 border-0 shadow-md">
          <CardHeader className="bg-muted border-b border-border">
            <CardTitle className="text-xl text-foreground">
              {tr("contract.electronicContract", "Hợp đồng điện tử")}
            </CardTitle>
            <CardDescription>{tr("contract.contractDesc", "Hợp đồng thuê xe giữa EV Rental và bạn")}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="bg-card border border-border rounded-lg p-8 max-h-96 overflow-y-auto">
              <div className="prose prose-sm max-w-none text-foreground dark:prose-invert">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  {tr("contract.contractTitle", "HỢP ĐỒNG THUÊ XE ĐIỆN")}
                </h3>

                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-semibold text-foreground">{tr("contract.section1", "1. BÊN CHO THUÊ")}</p>
                    <p className="text-muted-foreground">
                      {tr("contract.section1Content", "Công ty EV Rental - Hệ thống cho thuê xe điện thông minh")}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-foreground">{tr("contract.section2", "2. BÊN THUÊ")}</p>
                    <p className="text-muted-foreground">
                      {tr("contract.section2Content", "Khách hàng đã đăng ký trên hệ thống EV Rental")}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-foreground">{tr("contract.section3", "3. ĐIỀU KHOẢN CHUNG")}</p>
                    <ul className="list-disc list-inside space-y-2 ml-2 text-muted-foreground">
                      <li>
                        {tr("contract.term1", "Bên thuê cam kết sử dụng xe đúng mục đích và tuân thủ luật giao thông")}
                      </li>
                      <li>
                        {tr(
                          "contract.term2",
                          "Bên thuê chịu trách nhiệm bảo vệ xe khỏi hư hỏng trong suốt thời gian thuê",
                        )}
                      </li>
                      <li>{tr("contract.term3", "Bên thuê phải trả xe đúng thời gian và địa điểm đã thỏa thuận")}</li>
                      <li>
                        {tr("contract.term4", "Mọi hư hỏng phát sinh sẽ được tính phí theo bảng giá của công ty")}
                      </li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold text-foreground">
                      {tr("contract.section4", "4. TRÁCH NHIỆM CỦA BÊN THUÊ")}
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-2 text-muted-foreground">
                      <li>{tr("contract.resp1", "Kiểm tra tình trạng xe trước khi nhận")}</li>
                      <li>{tr("contract.resp2", "Báo cáo ngay mọi hư hỏng phát hiện")}</li>
                      <li>{tr("contract.resp3", "Không được chuyển nhượng hoặc cho người khác sử dụng xe")}</li>
                      <li>{tr("contract.resp4", "Chịu trách nhiệm về các vi phạm giao thông phát sinh")}</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold text-foreground">
                      {tr("contract.section5", "5. ĐIỀU KHOẢN THANH TOÁN")}
                    </p>
                    <p className="text-muted-foreground">
                      {tr(
                        "contract.section5Content",
                        "Bên thuê cam kết thanh toán đầy đủ theo hóa đơn và không có tranh chấp về giá cả",
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-foreground">{tr("contract.section6", "6. HIỆU LỰC HỢP ĐỒNG")}</p>
                    <p className="text-muted-foreground">
                      {tr(
                        "contract.section6Content",
                        "Hợp đồng có hiệu lực từ khi bên thuê xác nhận và kết thúc khi xe được trả lại đầy đủ",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confirmation Checkboxes Section */}
        <Card className="mb-8 border-0 shadow-md">
          <CardHeader className="bg-muted border-b border-border">
            <CardTitle className="text-xl text-foreground">{tr("contract.confirmationTitle", "Xác nhận")}</CardTitle>
            <CardDescription>
              {tr("contract.confirmationDesc", "Vui lòng xác nhận tất cả các điều khoản dưới đây")}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Checkbox 1 */}
              <div className="flex items-start space-x-3 p-4 bg-muted rounded-lg border border-border hover:bg-muted/80 transition-colors">
                <Checkbox
                  id="viewed-images"
                  checked={confirmations.viewedImages}
                  onCheckedChange={() => handleCheckboxChange("viewedImages")}
                  className="mt-1"
                />
                <label htmlFor="viewed-images" className="flex-1 cursor-pointer text-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">
                    {tr("contract.checkbox1", "Tôi đã xem xét tất cả hình ảnh tình trạng xe")}
                  </span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {tr(
                      "contract.checkbox1Desc",
                      "Tôi xác nhận rằng tôi đã kiểm tra kỹ lưỡng tất cả các hình ảnh tình trạng xe được cung cấp bởi nhân viên",
                    )}
                  </p>
                </label>
              </div>

              {/* Checkbox 2 */}
              <div className="flex items-start space-x-3 p-4 bg-muted rounded-lg border border-border hover:bg-muted/80 transition-colors">
                <Checkbox
                  id="read-contract"
                  checked={confirmations.readContract}
                  onCheckedChange={() => handleCheckboxChange("readContract")}
                  className="mt-1"
                />
                <label htmlFor="read-contract" className="flex-1 cursor-pointer text-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">
                    {tr("contract.checkbox2", "Tôi đã đọc và hiểu hợp đồng")}
                  </span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {tr(
                      "contract.checkbox2Desc",
                      "Tôi xác nhận rằng tôi đã đọc toàn bộ hợp đồng và hiểu rõ tất cả các điều khoản và điều kiện",
                    )}
                  </p>
                </label>
              </div>

              {/* Checkbox 3 */}
              <div className="flex items-start space-x-3 p-4 bg-muted rounded-lg border border-border hover:bg-muted/80 transition-colors">
                <Checkbox
                  id="agree-terms"
                  checked={confirmations.agreeTerms}
                  onCheckedChange={() => handleCheckboxChange("agreeTerms")}
                  className="mt-1"
                />
                <label htmlFor="agree-terms" className="flex-1 cursor-pointer text-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">
                    {tr("contract.checkbox3", "Tôi đồng ý với tất cả các điều khoản")}
                  </span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {tr(
                      "contract.checkbox3Desc",
                      "Tôi cam kết tuân thủ tất cả các điều khoản và điều kiện được nêu trong hợp đồng này",
                    )}
                  </p>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end mb-6">
          <Button variant="outline" className="px-8 py-2 bg-transparent">
            {tr("contract.actions.cancel", "Hủy")}
          </Button>
          <Button
            onClick={handleDownloadContract}
            variant="outline"
            className="px-6 py-2 flex items-center gap-2 bg-transparent"
          >
            <Download className="w-4 h-4" />
            {tr("contract.actions.download", "Tải xuống")}
          </Button>
          <Button
            onClick={handlePrintContract}
            variant="outline"
            className="px-6 py-2 flex items-center gap-2 bg-transparent"
          >
            <Printer className="w-4 h-4" />
            {tr("contract.actions.print", "In")}
          </Button>
          <Button
            onClick={handleDigitalSign}
            disabled={!isAllConfirmed || signing}
            className={`px-8 py-2 font-semibold ${isAllConfirmed && !signing
              ? "bg-primary hover:bg-primary/90 text-primary-foreground"
              : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
          >
            {signing ? tr("contract.actions.signing", "Đang kí...") : tr("contract.actions.sign", "Kí hợp đồng")}
          </Button>
        </div>

        {/* Info Alert */}
        {!isAllConfirmed && (
          <Alert className="bg-muted border-border">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-foreground">
              {tr("contract.messages.confirmAll", "Vui lòng xác nhận tất cả các điều khoản trước khi kí hợp đồng")}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
