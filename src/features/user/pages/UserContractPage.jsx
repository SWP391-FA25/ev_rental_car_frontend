import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../shared/components/homepage/Navbar';
import Footer from '../../shared/components/homepage/Footer';
import CarRentalContract from '../components/CarRentalContract';
import { Button } from '../../shared/components/ui/button';
import { FileText, ArrowLeft } from 'lucide-react';
import { useToast } from '../../shared/components/ui/use-toast';
import endpoints from '../../shared/lib/endpoints';

export default function UserContractPage() {
    // bookingId is optional: route can be /user/contract or /user/contract/:bookingId
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [bookingDetails, setBookingDetails] = useState(null);
    const [loading, setLoading] = useState(!!bookingId);

    useEffect(() => {
        // Nếu có bookingId, fetch thông tin booking để hiển thị
        if (bookingId) {
            const fetchBookingDetails = async () => {
                try {
                    const response = await fetch(endpoints.bookings.getById(bookingId));
                    if (!response.ok) {
                        throw new Error('Không thể tải thông tin booking');
                    }
                    const data = await response.json();
                    setBookingDetails(data.data || data);
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
