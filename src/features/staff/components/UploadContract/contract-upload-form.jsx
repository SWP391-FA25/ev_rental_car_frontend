"use client"

import { useState } from "react"
import { Upload, CheckCircle, AlertCircle, FileText, X } from "lucide-react"
import { Button } from "../../../shared/components/ui/button"
import { Card } from "../../../shared/components/ui/card"
import { Input } from "../../../shared/components/ui/input"

export function ContractUploadForm() {
  const [formData, setFormData] = useState({
    renterName: "",
    witnessName: "",
    notes: "",
    file: null,
  })

  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState(null)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!formData.renterName.trim()) {
      newErrors.renterName = "Vui lòng nhập tên khách hàng"
    }

    if (!formData.witnessName.trim()) {
      newErrors.witnessName = "Vui lòng nhập tên người chứng kiến"
    }

    if (!formData.file) {
      newErrors.file = "Vui lòng chọn file hợp đồng"
    } else {
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (formData.file.size > maxSize) {
        newErrors.file = "File không được vượt quá 10MB"
      }

      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"]
      if (!allowedTypes.includes(formData.file.type)) {
        newErrors.file = "Chỉ hỗ trợ file PDF, JPG, PNG"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setResponse(null)

    try {
      // Simulate API call - replace with actual API endpoint
      const formDataToSend = new FormData()
      formDataToSend.append("renterName", formData.renterName)
      formDataToSend.append("witnessName", formData.witnessName)
      formDataToSend.append("notes", formData.notes)
      formDataToSend.append("file", formData.file)

      // Mock response - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setResponse({
        success: true,
        message: "Tải lên hợp đồng thành công!",
        contractNumber: `CONTRACT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
      })

      // Reset form
      setFormData({
        renterName: "",
        witnessName: "",
        notes: "",
        file: null,
      })
    } catch (error) {
      setResponse({
        success: false,
        message: "Có lỗi xảy ra khi tải lên. Vui lòng thử lại.",
      })
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Tải lên Hợp đồng</h1>
          <p className="text-slate-600 text-lg">Tải lên hợp đồng ký kết cho khách hàng thuê xe</p>
        </div>

        {/* Success Message */}
        {response?.success && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 mb-1">{response.message}</h3>
                  {response.contractNumber && (
                    <p className="text-sm text-green-700">
                      Số hợp đồng: <span className="font-mono font-semibold">{response.contractNumber}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Error Message */}
        {response?.success === false && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900">{response.message}</h3>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Upload Form */}
        <Card className="bg-white">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-6">
              {/* Renter Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Tên khách hàng <span className="text-red-600">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.renterName}
                  onChange={(e) => handleInputChange("renterName", e.target.value)}
                  placeholder="Nhập tên khách hàng"
                  className={`bg-white border-2 ${errors.renterName ? "border-red-500" : "border-slate-200"
                    } focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
                />
                {errors.renterName && <p className="text-sm text-red-600 mt-1">{errors.renterName}</p>}
              </div>

              {/* Witness Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Tên người chứng kiến <span className="text-red-600">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.witnessName}
                  onChange={(e) => handleInputChange("witnessName", e.target.value)}
                  placeholder="Nhập tên người chứng kiến"
                  className={`bg-white border-2 ${errors.witnessName ? "border-red-500" : "border-slate-200"
                    } focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
                />
                {errors.witnessName && <p className="text-sm text-red-600 mt-1">{errors.witnessName}</p>}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Ghi chú</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Nhập ghi chú (tối đa 500 ký tự)"
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">{formData.notes.length}/500 ký tự</p>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Tải lên file hợp đồng <span className="text-red-600">*</span>
                </label>

                {formData.file ? (
                  <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="font-medium text-slate-900">{formData.file.name}</p>
                        <p className="text-sm text-slate-600">{(formData.file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-1 hover:bg-blue-100 rounded transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>
                ) : (
                  <label className="block">
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
                      <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="font-semibold text-slate-900 mb-1">Chọn file hoặc kéo thả</p>
                      <p className="text-sm text-slate-600">PDF, JPG, PNG (Tối đa 10MB)</p>
                    </div>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" />
                  </label>
                )}
                {errors.file && <p className="text-sm text-red-600 mt-1">{errors.file}</p>}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 mt-8">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
                onClick={() => {
                  setFormData({
                    renterName: "",
                    witnessName: "",
                    notes: "",
                    file: null,
                  })
                  setErrors({})
                  setResponse(null)
                }}
              >
                Xóa
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
                    Tải lên Hợp đồng
                  </>
                )}
              </Button>
            </div>

            {/* Info Box */}
            <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h4 className="font-semibold text-slate-900 mb-2">Yêu cầu tải lên:</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>✓ Định dạng: PDF, JPG, PNG</li>
                <li>✓ Kích thước tối đa: 10MB</li>
                <li>✓ Hợp đồng phải được ký kết đầy đủ</li>
                <li>✓ Hình ảnh phải rõ ràng, dễ đọc</li>
              </ul>
            </div>
          </form>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-600 text-sm">
          <p>Cần hỗ trợ? Liên hệ với bộ phận quản lý hợp đồng</p>
        </div>
      </div>
    </div>
  )
}
