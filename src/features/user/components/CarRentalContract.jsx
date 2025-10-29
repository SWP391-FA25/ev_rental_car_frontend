'use client';

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../shared/components/ui/card"
import { Button } from "../../shared/components/ui/button"
import { Checkbox } from "../../shared/components/ui/checkbox"
import { CheckCircle2, AlertCircle, FileText, Upload, Check } from "lucide-react"
import { endpoints } from "../../shared/lib/endpoints"
import { toast as notify } from '../../shared/lib/toast'
import { apiClient } from '../../shared/lib/apiClient'
import { useAuth } from '../../../app/providers/AuthProvider'
import { Input } from "../../shared/components/ui/input"
import { Label } from "../../shared/components/ui/label"
import { Textarea } from "../../shared/components/ui/textarea"

export default function CarRentalContract({ bookingId, onStatusChange }) {
  const { user } = useAuth()
  // local helper to emulate previous useToast({title,description,variant})
  const showToast = ({ title = '', description = '', variant = '' } = {}) => {
    const message = title && description ? `${title} — ${description}` : title || description || '';
    if (variant === 'destructive') {
      notify.error(message || 'Lỗi', { autoClose: 5000 });
    } else {
      notify.success(message || 'Thành công', { autoClose: 4000 });
    }
  }

  const [selectedBooking, setSelectedBooking] = useState(null)
  const [bookings, setBookings] = useState(null)
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)
  const [contracts, setContracts] = useState([])
  const [loadingContracts, setLoadingContracts] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  const [formData, setFormData] = useState({
    renterName: "",
    witnessName: "",
    notes: "",
  })

  const [agreements, setAgreements] = useState({
    termsAccepted: false,
    conditionsAccepted: false,
    damageResponsibility: false,
    dataPrivacy: false,
  });

  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const fetchAuthUser = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const result = await res.json();
        setAuthUser(result.data?.user);
      } catch (err) {
        console.error('Failed to fetch auth user:', err);
      }
    };

    fetchAuthUser();
  }, []);



  // Fetch contracts for a specific booking
  const fetchContracts = useCallback(async (bookingId) => {
    if (!bookingId) return;

    setLoadingContracts(true);
    setError(null);
    try {
      const res = await apiClient.get(endpoints.contracts.getByBooking(bookingId));
      const json = res?.data;

      // Handle multiple response structures
      if (json.success && Array.isArray(json.data)) {
        setContracts(json.data);
      } else if (json.success && json.data && typeof json.data === 'object') {
        if (Array.isArray(json.data.contracts)) {
          setContracts(json.data.contracts);
        } else {
          setContracts([json.data]);
        }
      } else if (Array.isArray(json)) {
        setContracts(json);
      } else {
        console.log("Unexpected contract data format:", json);
        setContracts([]);
      }
    } catch (err) {
      console.error("fetchContracts error:", err);
      setError("Không thể tải hợp đồng. Vui lòng thử lại sau.");
      setContracts([]);
    } finally {
      setLoadingContracts(false);
    }
  }, []);


  // Fetch booking details if bookingId is provided
  const fetchBookingDetails = useCallback(async (id) => {
    if (!id) return;

    setLoadingBookings(true);
    setError(null);
    try {
      const res = await apiClient.get(`/api/bookings/${id}`);
      const json = res?.data;
      const booking = json?.data?.booking ?? json?.booking ?? json?.data ?? json;
      setSelectedBooking(booking);

      // Fetch contracts after getting booking
      await fetchContracts(id);
    } catch (err) {
      console.error("fetchBookingDetails:", err);
      setError("Không thể tải thông tin booking. Vui lòng thử lại sau.");
    } finally {
      setLoadingBookings(false);
    }
  }, [fetchContracts]);

  // Fetch bookings for current user
  const fetchBookings = useCallback(async () => {
    console.log("fetchBookings called");

    if (bookingId) {
      console.log("bookingId provided, fetching booking details for:", bookingId);
      fetchBookingDetails(bookingId);
      return;
    }

    if (!user?.id) {
      console.warn("User not logged in. Cannot fetch bookings.");
      setError('Vui lòng đăng nhập để xem bookings');
      setBookings([]);
      return;
    }

    console.log("Fetching bookings for user ID:", user.id);
    setLoadingBookings(true);
    setError(null);

    try {
      const res = await apiClient.get(endpoints.bookings.getUserBookings(user.id));
      console.log("API response:", res);
      const json = res?.data;
      console.log("Parsed JSON data:", json);

      // Backend trả về { bookings: [...] } hoặc trực tiếp array
      const list = json?.bookings ?? json?.data?.bookings ?? json?.data ?? json;
      console.log("Extracted bookings list:", list);

      // Lọc chỉ lấy bookings CONFIRMED
      const confirmedBookings = (Array.isArray(list) ? list : []).filter(
        b => (b.status || b.bookingStatus) === 'CONFIRMED'
      );
      console.log("Filtered confirmed bookings:", confirmedBookings);

      setBookings(confirmedBookings);
    } catch (err) {
      console.error("fetchBookings error:", err);
      setError("Không thể tải danh sách booking. Vui lòng thử lại sau.");
      setBookings([]);
    } finally {
      console.log("fetchBookings completed");
      setLoadingBookings(false);
    }
  }, [bookingId, fetchBookingDetails, user?.id]);

  useEffect(() => {
    console.log("useEffect triggered: calling fetchBookings");
    fetchBookings();
  }, [fetchBookings]);


  const handleBookingSelect = (booking) => {
    setSelectedBooking(booking);
    fetchBookingDetails(booking.id);
    fetchContracts(booking.id);
  }

  const handleAgreementChange = (field, value) => {
    setAgreements(prev => ({
      ...prev,
      [field]: value,
    }));
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (error) setError(null);
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        showToast({
          title: "Lỗi",
          description: "File phải là JPEG, PNG hoặc PDF",
          variant: "destructive",
        });
        e.target.value = ''; // Reset input
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        showToast({
          title: "Lỗi",
          description: "Kích thước file không được vượt quá 10MB",
          variant: "destructive",
        });
        e.target.value = ''; // Reset input
        return;
      }

      setSelectedFile(file);
    }
  }

  const allAgreementsAccepted = Object.values(agreements).every((v) => v === true);

  // Validate form data
  const validateFormData = (data) => {
    // Validation for upload (renterName & witnessName required)
    if (!data.renterName || data.renterName.trim().length < 2 || data.renterName.length > 100) {
      throw new Error('Tên người thuê phải từ 2-100 ký tự');
    }
    if (!data.witnessName || data.witnessName.trim().length < 2 || data.witnessName.length > 100) {
      throw new Error('Tên người làm chứng phải từ 2-100 ký tự');
    }

    if (data.notes && data.notes.length > 500) {
      throw new Error('Ghi chú không được vượt quá 500 ký tự');
    }
  }

  // Upload signed contract
  const handleUploadContract = async (contractId) => {
    if (!selectedFile) {
      showToast({
        title: "Lỗi",
        description: "Vui lòng chọn file hợp đồng đã ký",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      validateFormData(formData);

      const formDataObj = new FormData();
      formDataObj.append("file", selectedFile);
      formDataObj.append("renterName", formData.renterName);
      formDataObj.append("witnessName", formData.witnessName);
      if (formData.notes) formDataObj.append("notes", formData.notes);

      const res = await apiClient.post(endpoints.contracts.uploadSignedFile(contractId), formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const successData = res?.data;
      if (!successData) throw new Error('Failed to upload contract (no response)');

      showToast({
        title: "Thành công",
        description: "Hợp đồng đã ký đã được tải lên thành công",
      });

      // Reset form
      setSelectedFile(null);
      setFormData({
        renterName: "",
        witnessName: "",
        notes: "",
      });

      // Refresh contracts list
      await fetchContracts(selectedBooking.id);

      if (onStatusChange) onStatusChange();
    } catch (err) {
      console.error("Upload contract error:", err);
      showToast({
        title: "Lỗi",
        description: err.message || "Không thể tải lên hợp đồng. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
      setActionLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!allAgreementsAccepted) {
      showToast({
        title: "Lỗi",
        description: "Vui lòng đồng ý với tất cả các điều khoản",
        variant: "destructive",
      });
      return;
    }

    // Implementation for final contract submission
    showToast({
      title: "Thành công",
      description: "Hợp đồng đã được ký thành công",
    });
  }

  return (
    <div className="space-y-8">
      {/* Booking Selection Section */}
      {!bookingId && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-white border-b border-slate-200">
            <CardTitle className="text-slate-900">Chọn Booking</CardTitle>
            <CardDescription>Lựa chọn booking thuê xe của bạn</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {loadingBookings && <div className="text-sm text-slate-500">Đang tải bookings...</div>}
              {error && <div className="text-sm text-red-600">{error}</div>}
              {bookings && bookings.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-500">Không có booking nào cần tạo hợp đồng</p>
                </div>
              )}
              {bookings && bookings.length > 0 && bookings.map((booking, index) => (
                <Card
                  key={booking.id}
                  className={`p-4 cursor-pointer transition-all border-2 ${selectedBooking?.id === booking.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  onClick={() => handleBookingSelect(booking)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">{booking.bookingCode || `Hồ sơ số ${index + 1}`}</h3>
                        <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {booking.status}
                        </span>
                      </div>
                      <div className='grid grid-cols-2 gap-4 text-sm text-slate-600'>
                        <div>
                          <p className="text-slate-500">Khách hàng</p>
                          <p className="font-medium text-slate-900">{authUser?.name || booking.staff?.name}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Nhân Viên Phụ Trách</p>
                          <p className="font-medium text-slate-900">{booking.staff?.name}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Địa Điểm</p>
                          <p className="font-medium text-slate-900">{booking.station?.name}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Xe</p>
                          <p className="font-medium text-slate-900">{booking.vehicle?.brand} {booking.vehicle?.model}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Ngày thuê</p>
                          <p className="font-medium text-slate-900">
                            {new Date(booking.createdAt || booking.rentalDate).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Giá</p>
                          <p className="font-medium text-slate-900">
                            {booking.totalAmount?.toLocaleString('vi-VN') || booking.price} VNĐ
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
      )}

      {/* Contract List Section */}
      {selectedBooking && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-white border-b border-slate-200">
            <CardTitle className="text-slate-900">Hợp Đồng</CardTitle>
            <CardDescription>Danh sách hợp đồng cho booking này</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {loadingContracts && <div className="text-sm text-slate-500">Đang tải hợp đồng...</div>}
            {error && <div className="text-sm text-red-600">{error}</div>}

            {!loadingContracts && contracts.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Chưa có hợp đồng nào cho booking này</p>
                <p className="text-sm text-slate-400 mt-1">Hợp đồng sẽ được tạo bởi nhân viên</p>
              </div>
            )}

            {contracts.length > 0 && (
              <div className="space-y-4">
                {contracts.map((contract) => (
                  <Card key={contract.id} className="p-4 border-slate-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-slate-900">{contract.contractNumber}</h3>
                          <span className={`text-sm px-2 py-1 rounded ${contract.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                            }`}>
                            {contract.status === 'COMPLETED' ? 'Đã hoàn thành' : 'Chờ ký'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                          <div>
                            <p className="text-slate-500">Ngày tạo</p>
                            <p className="font-medium text-slate-900">
                              {new Date(contract.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                          {contract.renterName && (
                            <div>
                              <p className="text-slate-500">Người thuê</p>
                              <p className="font-medium text-slate-900">{contract.renterName}</p>
                            </div>
                          )}
                          {contract.status === 'COMPLETED' && contract.signedAt && (
                            <>
                              <div>
                                <p className="text-slate-500">Ngày ký</p>
                                <p className="font-medium text-slate-900">
                                  {new Date(contract.signedAt).toLocaleDateString('vi-VN')}
                                </p>
                              </div>
                              {contract.witnessName && (
                                <div>
                                  <p className="text-slate-500">Người làm chứng</p>
                                  <p className="font-medium text-slate-900">{contract.witnessName}</p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        {contract.notes && (
                          <div className="mt-2 text-sm">
                            <p className="text-slate-500">Ghi chú:</p>
                            <p className="text-slate-700">{contract.notes}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        {contract.status === 'CREATED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const element = document.getElementById(`upload-form-${contract.id}`);
                              if (element) element.scrollIntoView({ behavior: 'smooth' });
                            }}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Tải lên
                          </Button>
                        )}
                        {contract.status === 'COMPLETED' && contract.signedFileUrl && (
                          <a
                            href={contract.signedFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium border border-slate-300 rounded-md hover:bg-slate-50"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Xem hợp đồng
                          </a>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Contract Form */}
      {selectedBooking && contracts.filter(c => c.status === 'CREATED').length > 0 && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-white border-b border-slate-200">
            <CardTitle className="text-slate-900">Tải lên hợp đồng đã ký</CardTitle>
            <CardDescription>Vui lòng điền thông tin và tải lên file hợp đồng đã ký</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {contracts.filter(c => c.status === 'CREATED').map((contract) => (
              <div key={contract.id} id={`upload-form-${contract.id}`} className="space-y-4 mb-8 pb-8 border-b last:border-b-0">
                <h3 className="font-semibold text-lg mb-4">Hợp đồng: {contract.contractNumber}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`renterName-${contract.id}`}>
                      Tên người thuê <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`renterName-${contract.id}`}
                      name="renterName"
                      value={formData.renterName}
                      onChange={handleInputChange}
                      placeholder="Nguyễn Văn A (2-100 ký tự)"
                      required
                      minLength={2}
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`witnessName-${contract.id}`}>
                      Tên người làm chứng <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`witnessName-${contract.id}`}
                      name="witnessName"
                      value={formData.witnessName}
                      onChange={handleInputChange}
                      placeholder="Trần Thị B (2-100 ký tự)"
                      required
                      minLength={2}
                      maxLength={100}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`notes-${contract.id}`}>Ghi chú</Label>
                  <Textarea
                    id={`notes-${contract.id}`}
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Thêm ghi chú về hợp đồng (tối đa 500 ký tự)"
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-slate-500">{formData.notes.length}/500 ký tự</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`file-${contract.id}`}>
                    File hợp đồng đã ký <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id={`file-${contract.id}`}
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      required
                    />
                    <Button
                      onClick={() => handleUploadContract(contract.id)}
                      disabled={actionLoading || !selectedFile}
                    >
                      {actionLoading ? "Đang tải lên..." : "Tải lên"}
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Chấp nhận file PDF, JPG, JPEG, PNG (tối đa 10MB)
                  </p>
                  {selectedFile && (
                    <p className="text-xs text-green-600">
                      Đã chọn: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                <div className="pt-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`terms-${contract.id}`}
                      checked={agreements.termsAccepted}
                      onCheckedChange={(checked) => handleAgreementChange('termsAccepted', checked)}
                    />
                    <Label htmlFor={`terms-${contract.id}`} className="text-sm cursor-pointer">
                      Tôi đã đọc và đồng ý với các điều khoản và điều kiện
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`conditions-${contract.id}`}
                      checked={agreements.conditionsAccepted}
                      onCheckedChange={(checked) => handleAgreementChange('conditionsAccepted', checked)}
                    />
                    <Label htmlFor={`conditions-${contract.id}`} className="text-sm cursor-pointer">
                      Tôi xác nhận thông tin cung cấp là chính xác
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`damage-${contract.id}`}
                      checked={agreements.damageResponsibility}
                      onCheckedChange={(checked) => handleAgreementChange('damageResponsibility', checked)}
                    />
                    <Label htmlFor={`damage-${contract.id}`} className="text-sm cursor-pointer">
                      Tôi chịu trách nhiệm về mọi hư hỏng không được báo cáo
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`privacy-${contract.id}`}
                      checked={agreements.dataPrivacy}
                      onCheckedChange={(checked) => handleAgreementChange('dataPrivacy', checked)}
                    />
                    <Label htmlFor={`privacy-${contract.id}`} className="text-sm cursor-pointer">
                      Tôi đồng ý với chính sách bảo mật dữ liệu
                    </Label>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Agreement Status & Final Submit */}
      {selectedBooking && contracts.some(c => c.status === 'COMPLETED') && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-white border-b border-slate-200">
            <CardTitle className="text-slate-900">Xác Nhận Hợp Đồng Điện Tử</CardTitle>
            <CardDescription>Vui lòng đồng ý với tất cả các điều khoản để hoàn tất</CardDescription>
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
                      id="terms-final"
                      checked={agreements.termsAccepted}
                      onCheckedChange={(checked) => handleAgreementChange("termsAccepted", Boolean(checked))}
                      className="w-6 h-6 mt-1 flex-shrink-0 cursor-pointer"
                    />
                    <label htmlFor="terms-final" className="text-base text-slate-800 cursor-pointer flex-1">
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
                      id="damage-final"
                      checked={agreements.damageResponsibility}
                      onCheckedChange={(checked) => handleAgreementChange("damageResponsibility", Boolean(checked))}
                      className="w-6 h-6 mt-1 flex-shrink-0 cursor-pointer"
                    />
                    <label htmlFor="damage-final" className="text-base text-slate-800 cursor-pointer flex-1">
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
                      id="privacy-final"
                      checked={agreements.dataPrivacy}
                      onCheckedChange={(checked) => handleAgreementChange("dataPrivacy", Boolean(checked))}
                      className="w-6 h-6 mt-1 flex-shrink-0 cursor-pointer"
                    />
                    <label htmlFor="privacy-final" className="text-base text-slate-800 cursor-pointer flex-1">
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
                      id="conditions-final"
                      checked={agreements.conditionsAccepted}
                      onCheckedChange={(checked) => handleAgreementChange("conditionsAccepted", Boolean(checked))}
                      className="w-6 h-6 mt-1 flex-shrink-0 cursor-pointer"
                    />
                    <label htmlFor="conditions-final" className="text-base text-slate-800 cursor-pointer flex-1">
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

            {/* Agreement status box */}
            {allAgreementsAccepted ? (
              <Card className="border-green-200 bg-green-50 mt-4">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div>
                      <p className='font-semibold text-green-900'>
                        Tất cả điều khoản đã được chấp nhận
                      </p>
                      <p className='text-sm text-green-700'>
                        Bạn đã sẵn sàng ký hợp đồng điện tử
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-amber-200 bg-amber-50 mt-4">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-amber-900">Chưa hoàn thành tất cả các điều khoản</p>
                      <p className="text-sm text-amber-700">Vui lòng đồng ý với tất cả các điều khoản trước khi ký hợp đồng</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            {contracts.some(c => c.status === 'COMPLETED') && (
              <div className="flex gap-4 justify-end mt-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
                  onClick={() => {
                    if (window.confirm('Bạn có chắc chắn muốn hủy?')) {
                      window.history.back();
                    }
                  }}
                >
                  Hủy
                </Button>
                <Button
                  size="lg"
                  onClick={handleFinalSubmit}
                  disabled={!allAgreementsAccepted || actionLoading}
                  className={`text-white ${allAgreementsAccepted
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-slate-400 cursor-not-allowed"
                    }`}
                >
                  {actionLoading ? "Đang xử lý..." : "Ký Hợp Đồng Điện Tử"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}