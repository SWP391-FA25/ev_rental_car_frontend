import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../shared/components/homepage/Navbar';
import Footer from '../../shared/components/homepage/Footer';
import CarRentalContract from '../components/CarRentalContract';
import { Button } from '../../shared/components/ui/button';
import { FileText, ArrowLeft } from 'lucide-react';
import { useToast } from '../../shared/components/ui/use-toast';
import { endpoints } from '../../shared/lib/endpoints';
import { apiClient } from '../../shared/lib/apiClient';
import { useAuth } from '../../app/providers/AuthProvider';
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/components/ui/card';

export default function UserContractPage() {
    // bookingId is optional: route can be /user/contract or /user/contract/:bookingId
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [bookingDetails, setBookingDetails] = useState(null);
    const [loading, setLoading] = useState(!!bookingId);
    const [inspection, setInspection] = useState(null);
    const [inspectionImages, setInspectionImages] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        // Nếu có bookingId, fetch thông tin booking & inspection (renter only)
        if (bookingId) {
            const fetchBookingDetails = async () => {
                try {
                    const response = await fetch(endpoints.bookings.getById(bookingId));
                    if (!response.ok) {
                        throw new Error('Không thể tải thông tin booking');
                    }
                    const data = await response.json();
                    setBookingDetails(data.data || data);

                    // Renter xem inspection: dùng endpoint dành cho renter
                    try {
                        const inspRes = await apiClient.get(
                            endpoints.inspections.getByBookingRenter(bookingId)
                        );
                        const payload = inspRes?.data;
                        const list = Array.isArray(payload?.data?.inspections)
                            ? payload.data.inspections
                            : Array.isArray(payload?.inspections)
                                ? payload.inspections
                                : Array.isArray(payload)
                                    ? payload
                                    : [];
                        const checkIn = [...list]
                            .filter(i => i?.inspectionType === 'CHECK_IN')
                            .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))[0] || null;

                        setInspection(checkIn);

                        if (checkIn) {
                            let imgs = [];
                            if (Array.isArray(checkIn.images) && checkIn.images.length) {
                                imgs = checkIn.images.map(img => ({
                                    url: img?.url || img,
                                    thumb: img?.thumbnailUrl || img?.url || img,
                                }));
                            } else if (checkIn.imageUrl) {
                                imgs = [{ url: checkIn.imageUrl, thumb: checkIn.thumbnailUrl || checkIn.imageUrl }];
                            }
                            setInspectionImages(imgs);
                        } else {
                            setInspectionImages([]);
                        }
                    } catch (e) {
                        // Không có inspection hoặc lỗi quyền → để trống theo yêu cầu
                        setInspection(null);
                        setInspectionImages([]);
                    }
                } catch (error) {
                    console.error('Error fetching booking details:', error);
                    toast({
                        title: 'Lỗi',
                        description: 'Không thể tải thông tin booking. Vui lòng thử lại sau.',
                        variant: 'destructive',
                    });
                } finally {
                    setLoading(false);
                }
            };

            fetchBookingDetails();
        }
    }, [bookingId, toast]);

    const handleStatusChange = () => {
        // Refresh lại trang khi trạng thái hợp đồng thay đổi
        if (bookingId) {
            navigate(0); // Refresh trang
        } else {
            navigate('/user/contracts'); // Chuyển về trang danh sách hợp đồng
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 py-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => navigate(-1)}
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <h1 className="text-3xl font-bold text-slate-900">
                                {bookingId ? 'Chi tiết hợp đồng' : 'Quản lý hợp đồng thuê xe'}
                            </h1>
                        </div>
                        <p className="text-slate-600 ml-10">
                            {bookingId
                                ? loading
                                    ? 'Đang tải thông tin...'
                                    : bookingDetails
                                        ? `Booking #${bookingDetails.id} - ${bookingDetails.vehicle?.name || 'Xe điện'}`
                                        : 'Thông tin hợp đồng cho booking này'
                                : 'Xem và quản lý các hợp đồng thuê xe của bạn'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/user/bookings')}
                            className="gap-2"
                        >
                            <FileText className="h-4 w-4" />
                            Xem bookings
                        </Button>
                    </div>
                </div>

                {/* Inspection cho renter (chỉ hiển thị cho chủ booking khi đã có inspection) */}
                {bookingId && inspection && (!user || bookingDetails?.user?.id === user?.id) && (
                    <Card className="mb-8">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Tình trạng xe khi nhận (Check-In)</CardTitle>
                            {inspection?.createdAt && (
                                <span className="text-xs text-slate-500">{new Date(inspection.createdAt).toLocaleString()}</span>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <p className="text-xs text-slate-500">Mức pin</p>
                                    <p className="font-medium">{inspection?.batteryLevel ?? '-'}%</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Số km</p>
                                    <p className="font-medium">{inspection?.mileage?.toLocaleString?.() || inspection?.mileage || '-'} km</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Phụ kiện</p>
                                    <p className="font-medium">{Array.isArray(inspection?.accessories) ? inspection.accessories.join(', ') : (inspection?.accessories || '-')}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Ngoại thất</p>
                                    <p className="font-medium">{inspection?.exteriorCondition || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Nội thất</p>
                                    <p className="font-medium">{inspection?.interiorCondition || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Lốp</p>
                                    <p className="font-medium">{inspection?.tireCondition || '-'}</p>
                                </div>
                                <div className="md:col-span-3">
                                    <p className="text-xs text-slate-500 mb-2">Ghi chú hư hại</p>
                                    <p className="text-sm">{inspection?.damageNotes || '-'}</p>
                                </div>
                                <div className="md:col-span-3">
                                    <p className="text-xs text-slate-500 mb-2">Hình ảnh tình trạng xe</p>
                                    {inspectionImages.length ? (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {inspectionImages.map((img, idx) => (
                                                <button key={idx} onClick={() => window.open(img.url, '_blank')} className="border rounded overflow-hidden bg-slate-50 hover:shadow">
                                                    <img src={img.thumb} alt={`inspection-${idx}`} className="w-full h-28 object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-slate-500">Chưa có hình ảnh</div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* CarRentalContract nhận prop bookingId (nếu có) */}
                <CarRentalContract
                    bookingId={bookingId}
                    onStatusChange={handleStatusChange}
                />
            </div>

            <Footer />
        </div>
    );
}
