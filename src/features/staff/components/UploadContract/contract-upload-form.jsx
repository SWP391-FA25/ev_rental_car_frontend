"use client"

import { useState, useEffect } from "react"
import { Upload, CheckCircle, AlertCircle, FileText, X, AlertTriangle } from "lucide-react"
import { Button } from "../../../shared/components/ui/button"
import { Card } from "../../../shared/components/ui/card"
import { Input } from "../../../shared/components/ui/input"
import { endpoints } from "../../../shared/lib/endpoints"
import { toast } from "sonner"
import { useAuth } from "../../../../app/providers/AuthProvider"

export function ContractUploadForm({ bookingId, contractId, onSuccess, onCancel, customerName }) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    renterName: customerName || "",
    witnessName: user?.name || "",
    notes: "",
    file: null,
  })

  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [currentContractId, setCurrentContractId] = useState(contractId)

  // Auto-fill customer name and witness name when available
  useEffect(() => {
    if (customerName && !formData.renterName) {
      setFormData(prev => ({ ...prev, renterName: customerName }))
    }
    if (user?.name && !formData.witnessName) {
      setFormData(prev => ({ ...prev, witnessName: user.name }))
    }
  }, [customerName, user])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.renterName.trim()) {
      newErrors.renterName = "Vui lòng nhập tên khách hàng"
    } else if (formData.renterName.length < 2 || formData.renterName.length > 100) {
      newErrors.renterName = "Tên khách hàng phải từ 2-100 ký tự"
    }

    if (!formData.witnessName.trim()) {
      newErrors.witnessName = "Vui lòng nhập tên người chứng kiến"
    } else if (formData.witnessName.length < 2 || formData.witnessName.length > 100) {
      newErrors.witnessName = "Tên người chứng kiến phải từ 2-100 ký tự"
    }

    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = "Ghi chú không được vượt quá 500 ký tự"
    }

    if (!formData.file) {
      newErrors.file = "Vui lòng chọn file hợp đồng"
    } else {
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (formData.file.size > maxSize) {
        newErrors.file = "File không được vượt quá 10MB"
      }

      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
      if (!allowedTypes.includes(formData.file.type)) {
        newErrors.file = "Chỉ hỗ trợ file PDF, JPG, PNG"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Authorization check
    if (!user || (user.role !== 'STAFF' && user.role !== 'ADMIN')) {
      toast.error("Bạn không có quyền truy cập chức năng này")
      return
    }

    if (!validateForm()) {
      return
    }

    if (!bookingId) {
      toast.error("Không tìm thấy Booking ID")
      return
    }

    // Show confirmation dialog before uploading
    setShowConfirmDialog(true)
  }

  const handleConfirmUpload = async () => {
    setShowConfirmDialog(false)
    setLoading(true)

    try {
      let contractIdToUse = currentContractId

      // Step 1: Create contract if it doesn't exist (without renterName, witnessName, notes)
      if (!contractIdToUse) {
        console.log('📝 Creating new contract for booking:', bookingId)

        const createResponse = await fetch(endpoints.contracts.create(), {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingId: bookingId,
            // Don't send renterName, witnessName, notes here - they'll be sent with the file upload
          }),
        })

        const createData = await createResponse.json()

        if (!createResponse.ok || !createData.success) {
          // Handle specific errors
          if (createResponse.status === 400) {
            throw new Error(createData.message || 'Booking không hợp lệ hoặc đã có hợp đồng')
          } else if (createResponse.status === 403) {
            throw new Error('Bạn không có quyền tạo hợp đồng')
          } else if (createResponse.status === 404) {
            throw new Error('Không tìm thấy booking')
          } else {
            throw new Error(createData.message || 'Không thể tạo hợp đồng')
          }
        }

        contractIdToUse = createData.data.id
        setCurrentContractId(contractIdToUse)
        console.log('✅ Contract created with ID:', contractIdToUse)
      }

      // Step 2: Upload signed contract file with renterName, witnessName, notes
      console.log('📤 Uploading signed contract file for contract:', contractIdToUse)

      const formDataToSend = new FormData()
      formDataToSend.append("renterName", formData.renterName.trim())
      formDataToSend.append("witnessName", formData.witnessName.trim())
      if (formData.notes.trim()) {
        formDataToSend.append("notes", formData.notes.trim())
      }
      formDataToSend.append("file", formData.file)

      const uploadResponse = await fetch(endpoints.contracts.uploadSignedFile(contractIdToUse), {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend,
      })

      const uploadData = await uploadResponse.json()

      if (!uploadResponse.ok || !uploadData.success) {
        // Handle specific errors
        if (uploadResponse.status === 400) {
          throw new Error(uploadData.message || 'Dữ liệu không hợp lệ hoặc file không đúng định dạng')
        } else if (uploadResponse.status === 403) {
          throw new Error('Bạn không có quyền tải lên hợp đồng')
        } else if (uploadResponse.status === 404) {
          throw new Error('Không tìm thấy hợp đồng')
        } else if (uploadResponse.status === 409) {
          throw new Error('Hợp đồng đã được tải lên trước đó')
        } else {
          throw new Error(uploadData.message || 'Không thể tải lên file hợp đồng')
        }
      }

      console.log('✅ Contract uploaded and completed successfully')
      toast.success("Tải lên hợp đồng thành công!")

      // Reset form
      setFormData({
        renterName: "",
        witnessName: "",
        notes: "",
        file: null,
      })
      setErrors({})

      // Notify parent component
      if (onSuccess) {
        onSuccess(uploadData.data)
      }
    } catch (error) {
      console.error('❌ Upload error:', error)
      toast.error(error.message || "Có lỗi xảy ra. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    setFormData({ ...formData, file })
    if (errors.file) {
      setErrors({ ...errors, file: "" })
    }
  }

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  const removeFile = () => {
    setFormData({ ...formData, file: null })
  }

  const handleCancel = () => {
    setFormData({
      renterName: "",
      witnessName: "",
      notes: "",
      file: null,
    })
    setErrors({})
    if (onCancel) {
      onCancel()
    }
  }

  return (
    <div className="bg-white">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Renter Name - Read Only */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1.5">
              Tên khách hàng <span className="text-red-600">*</span>
            </label>
            <Input
              type="text"
              value={formData.renterName}
              readOnly
              className="bg-slate-100 border-2 border-slate-200 text-slate-700 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">Tự động lấy từ thông tin booking</p>
          </div>

          {/* Witness Name - Read Only */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1.5">
              Tên người chứng kiến <span className="text-red-600">*</span>
            </label>
            <Input
              type="text"
              value={formData.witnessName}
              readOnly
              className="bg-slate-100 border-2 border-slate-200 text-slate-700 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">Tự động lấy từ thông tin nhân viên</p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1.5">Ghi chú</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Nhập ghi chú (tối đa 500 ký tự)"
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">{formData.notes.length}/500 ký tự</p>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1.5">
              Tải lên file hợp đồng <span className="text-red-600">*</span>
            </label>

            {formData.file ? (
              <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{formData.file.name}</p>
                    <p className="text-xs text-slate-600">{(formData.file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1 hover:bg-blue-100 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            ) : (
              <label className="block">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
                  <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="font-semibold text-slate-900 text-sm mb-1">Chọn file hoặc kéo thả</p>
                  <p className="text-xs text-slate-600">PDF, JPG, PNG (Tối đa 10MB)</p>
                </div>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" />
              </label>
            )}
            {errors.file && <p className="text-sm text-red-600 mt-1">{errors.file}</p>}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
            onClick={handleCancel}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Đang tải lên...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Tải lên
              </>
            )}
          </Button>
        </div>

        {/* Info Box - Compact */}
        <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-600">
            <span className="font-semibold">Yêu cầu:</span> PDF/JPG/PNG, tối đa 10MB, hợp đồng đã ký đầy đủ, hình ảnh rõ ràng
          </p>
        </div>
      </form>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-amber-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Xác nhận tải lên hợp đồng</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Vui lòng kiểm tra kỹ các thông tin trước khi tải lên:
                </p>
                <ul className="space-y-2 text-sm text-slate-700 mb-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Hợp đồng đã được ký đầy đủ bởi khách hàng</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Thông tin khách hàng và người chứng kiến chính xác</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>File hợp đồng rõ ràng, không bị mờ hoặc thiếu trang</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Tất cả các điều khoản đã được giải thích cho khách hàng</span>
                  </li>
                </ul>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-800">
                    <span className="font-semibold">Lưu ý:</span> Sau khi tải lên, hợp đồng sẽ được lưu vào hệ thống và không thể chỉnh sửa.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
                onClick={() => setShowConfirmDialog(false)}
              >
                Hủy bỏ
              </Button>
              <Button
                type="button"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleConfirmUpload}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Xác nhận tải lên
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
