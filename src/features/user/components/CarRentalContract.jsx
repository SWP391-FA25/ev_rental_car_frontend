import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
    FileTextIcon,
    DownloadIcon,
    CheckCircleIcon,
    AlertCircleIcon,
    CalendarIcon,
    CarIcon,
    UserIcon,
    MapPinIcon,
    ClockIcon,
    DollarSignIcon,
    PrinterIcon,
    CopyIcon,
} from 'lucide-react';

import { Button } from '../../shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/components/ui/card';
import { Badge } from '../../shared/components/ui/badge';
import { Separator } from '../../shared/components/ui/separator';
import { Input } from '../../shared/components/ui/input';
import { Label } from '../../shared/components/ui/label';
import { Textarea } from '../../shared/components/ui/textarea';
import { Checkbox } from '../../shared/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../../shared/components/ui/dialog';
import { apiClient } from '../../shared/lib/apiClient';
import { endpoints } from '../../shared/lib/endpoints';
import { formatCurrency } from '../../shared/lib/utils';

export default function CarRentalContract({ bookingId, onStatusChange }) {
    const { t } = useTranslation();
    // helper: nếu key không được dịch (trả về chính key) thì hiển thị fallback
    const tr = (key, fallback) => {
        const v = t(key);
        return v === key ? fallback : v;
    };
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [signing, setSigning] = useState(false);
    const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
    const [signatureData, setSignatureData] = useState({
        fullName: '',
        digitalSignature: '',
        agreeToTerms: false,
        signedAt: null,
    });
    const [userBookings, setUserBookings] = useState([]);
    const [selectedBookingId, setSelectedBookingId] = useState(bookingId);

    useEffect(() => {
        if (!bookingId) {
            loadUserBookings();
        } else {
            // if a bookingId prop is provided, ensure selectedBookingId is set so contract loads
            setSelectedBookingId(bookingId);
        }
    }, [bookingId]);

    useEffect(() => {
        if (selectedBookingId) {
            loadContract();
        }
    }, [selectedBookingId]);

    const loadUserBookings = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/api/bookings/my-bookings');
            if (response.success) {
                setUserBookings(response.data.bookings || []);
                // Auto-select first booking with contract if available
                const bookingWithContract = response.data.bookings?.find(b => b.hasContract);
                if (bookingWithContract) {
                    setSelectedBookingId(bookingWithContract.id);
                }
            }
        } catch (error) {
            console.error('Failed to load user bookings:', error);
        } finally {
            setLoading(false);
        }

    };

    const loadContract = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/api/bookings/${selectedBookingId}/contract`);
            if (response.success) {
                setContract(response.data.contract);
                if (response.data.contract.signature) {
                    setSignatureData(response.data.contract.signature);
                }
            }
        } catch (error) {
            console.error('Failed to load contract:', error);
            toast.error(t('contract.messages.loadFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleDigitalSign = async () => {
        const activeBookingId = selectedBookingId || bookingId;
        if (!activeBookingId) {
            toast.error(tr('contract.messages.noBookingSelected', 'Chưa chọn đặt xe'));
            return;
        }
        if (!signatureData.fullName || !signatureData.digitalSignature || !signatureData.agreeToTerms) {
            toast.error(t('contract.messages.fillAllFields'));
            return;
        }

        try {
            setSigning(true);
            const signData = {
                ...signatureData,
                signedAt: new Date().toISOString(),
                ipAddress: await getClientIP(),
            };

            const response = await apiClient.post(
                `/api/bookings/${activeBookingId}/contract/sign`,
                signData
            );

            if (response.success) {
                toast.success(t('contract.messages.signSuccess'));
                setSignatureDialogOpen(false);
                loadContract();
                onStatusChange?.('signed');
            }
        } catch (error) {
            console.error('Failed to sign contract:', error);
            toast.error(t('contract.messages.signFailed'));
        } finally {
            setSigning(false);
        }
    };

    const handleDownloadContract = async () => {
        const activeBookingId = selectedBookingId || bookingId;
        if (!activeBookingId) {
            toast.error(tr('contract.messages.noBookingSelected', 'Chưa chọn đặt xe'));
            return;
        }
        try {
            const response = await apiClient.get(
                `/api/bookings/${activeBookingId}/contract/download`,
                { responseType: 'blob' }
            );

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `contract-${activeBookingId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success(t('contract.messages.downloadSuccess'));
        } catch (error) {
            console.error('Failed to download contract:', error);
            toast.error(t('contract.messages.downloadFailed'));
        }
    };

    const handlePrintContract = () => {
        window.print();
    };

    const copyContractNumber = () => {
        navigator.clipboard.writeText(contract?.contractNumber);
        toast.success(t('contract.messages.copied'));
    };

    const getClientIP = async () => {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch {
            return 'unknown';
        }
    };

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'draft':
                return 'secondary';
            case 'pending_signature':
                return 'warning';
            case 'signed':
                return 'default';
            case 'completed':
                return 'success';
            case 'cancelled':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (!bookingId && userBookings.length === 0 && !loading) {
        return (
            <div className="text-center py-8">
                <FileTextIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{tr('contract.messages.noBookings', 'Bạn chưa có đặt xe nào')}</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">{tr('contract.messages.loading', 'Đang tải...')}</div>
            </div>
        );
    }

    if (!bookingId && userBookings.length > 0) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {t('contract.title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('contract.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userBookings.map(booking => (
                        <Card key={booking.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedBookingId(booking.id)}>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    {booking.vehicle.brand} {booking.vehicle.model}
                                </CardTitle>
                                <div className="flex items-center space-x-2">
                                    <Badge variant={booking.hasContract ? 'default' : 'secondary'}>
                                        {booking.hasContract ? t('contract.status.hasContract') : t('contract.status.noContract')}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>{t('contract.fields.bookingId')}:</span>
                                        <span className="font-mono">{booking.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>{t('contract.fields.startDate')}:</span>
                                        <span>{formatDate(booking.startDate)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>{t('contract.fields.status')}:</span>
                                        <Badge variant="outline">{booking.status}</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (!contract && selectedBookingId) {
        return (
            <div className="text-center py-8">
                <FileTextIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{tr('contract.messages.noContract', 'Không tìm thấy hợp đồng')}</p>
                {!bookingId && (
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setSelectedBookingId(null)}
                    >
                        {t('contract.actions.backToList')}
                    </Button>
                )}
            </div>
        );
    }

    // Temporary test content
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Hợp đồng thuê xe
                </h1>
                <p className="text-muted-foreground">
                    Quản lý và xem các hợp đồng thuê xe của bạn
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <FileTextIcon className="mr-2 h-5 w-5" />
                        Thông tin hợp đồng
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <FileTextIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                            Component hợp đồng thuê xe đã được tạo thành công!
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Tính năng sẽ được phát triển thêm để hiển thị chi tiết hợp đồng.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
