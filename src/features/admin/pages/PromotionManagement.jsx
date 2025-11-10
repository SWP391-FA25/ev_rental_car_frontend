import {
  FilterIcon,
  LoaderIcon,
  MoreVerticalIcon,
  PlusIcon,
  SearchIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '../../shared/lib/toast';

import { Badge } from '../../shared/components/ui/badge';
import { Button } from '../../shared/components/ui/button';
import { ConfirmDialog } from '../../shared/components/ui/confirm-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../shared/components/ui/dropdown-menu';
import { Input } from '../../shared/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../shared/components/ui/table';
import { PromotionDetails } from '../components/promotion/PromotionDetails';
import { PromotionForm } from '../components/promotion/PromotionForm';
import { usePromotion } from '../hooks/usePromotion';

export default function PromotionManagement() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPromotionForm, setShowPromotionForm] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [showPromotionDetails, setShowPromotionDetails] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState(null);

  const {
    promotions,
    loading,
    error,
    createPromotion,
    updatePromotion,
    deletePromotion,
  } = usePromotion();

  const filteredPromotions = promotions.filter(promotion => {
    const matchesSearch =
      promotion.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (promotion.description &&
        promotion.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const now = new Date();
    const validFrom = new Date(promotion.validFrom);
    const validUntil = new Date(promotion.validUntil);

    let matchesStatus = true;
    if (filterStatus === 'active') {
      matchesStatus = now >= validFrom && now <= validUntil;
    } else if (filterStatus === 'upcoming') {
      matchesStatus = now < validFrom;
    } else if (filterStatus === 'expired') {
      matchesStatus = now > validUntil;
    }

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = promotion => {
    const now = new Date();
    const validFrom = new Date(promotion.validFrom);
    const validUntil = new Date(promotion.validUntil);

    if (now < validFrom) {
      return (
        <Badge variant='outline' className='text-blue-600'>
          {t('promotion.badge.upcoming')}
        </Badge>
      );
    } else if (now > validUntil) {
      return (
        <Badge variant='destructive'>{t('promotion.badge.expired')}</Badge>
      );
    } else {
      return (
        <Badge variant='default' className='bg-green-600'>
          {t('promotion.badge.active')}
        </Badge>
      );
    }
  };

  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCreatePromotion = async promotionData => {
    try {
      await createPromotion(promotionData);
      toast.success(t('promotion.toast.createSuccess'));
    } catch {
      toast.error(t('promotion.toast.createError'));
    }
  };

  const handleUpdatePromotion = async (id, promotionData) => {
    try {
      const updatedPromotion = await updatePromotion(id, promotionData);
      if (selectedPromotion && selectedPromotion.id === id) {
        setSelectedPromotion(updatedPromotion);
      }
      toast.success(t('promotion.toast.updateSuccess'));
    } catch {
      toast.error(t('promotion.toast.updateError'));
    }
  };

  const handleDeletePromotion = async id => {
    try {
      await deletePromotion(id);
      toast.success(t('promotion.toast.deleteSuccess'));
    } catch {
      toast.error(t('promotion.toast.deleteError'));
    }
  };

  const handleDeleteFromTable = async promotion => {
    if (promotion.promotionBookings?.length > 0) {
      toast.error(t('promotion.toast.deleteBlocked'));
      return;
    }
    setPromotionToDelete(promotion);
    setDeleteDialogOpen(true);
  };

  const stats = {
    total: promotions.length,
    active: promotions.filter(p => {
      const now = new Date();
      return now >= new Date(p.validFrom) && now <= new Date(p.validUntil);
    }).length,
    upcoming: promotions.filter(p => new Date() < new Date(p.validFrom)).length,
    expired: promotions.filter(p => new Date() > new Date(p.validUntil)).length,
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            {t('promotion.title')}
          </h1>
          <p className='text-muted-foreground'>{t('promotion.subtitle')}</p>
        </div>
        <Button onClick={() => setShowPromotionForm(true)} disabled={loading}>
          <PlusIcon className='mr-2 h-4 w-4' />
          {t('promotion.add')}
        </Button>
      </div>

      {/* Filters */}
      <div className='flex items-center space-x-4'>
        <div className='relative flex-1 max-w-sm'>
          <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder={t('promotion.searchPlaceholder')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline'>
              <FilterIcon className='mr-2 h-4 w-4' />
              {t('promotion.status.' + filterStatus)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterStatus('all')}>
              {t('promotion.status.all')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('active')}>
              {t('promotion.status.active')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('upcoming')}>
              {t('promotion.status.upcoming')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('expired')}>
              {t('promotion.status.expired')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Summary Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>{stats.total}</div>
          <div className='text-sm text-muted-foreground'>
            {t('promotion.stats.total')}
          </div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold text-green-600'>
            {stats.active}
          </div>
          <div className='text-sm text-muted-foreground'>
            {t('promotion.stats.active')}
          </div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold text-blue-600'>
            {stats.upcoming}
          </div>
          <div className='text-sm text-muted-foreground'>
            {t('promotion.stats.upcoming')}
          </div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold text-red-600'>{stats.expired}</div>
          <div className='text-sm text-muted-foreground'>
            {t('promotion.stats.expired')}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('promotion.table.code')}</TableHead>
              <TableHead>{t('promotion.table.description')}</TableHead>
              <TableHead>{t('promotion.table.discount')}</TableHead>
              <TableHead>{t('promotion.table.validFrom')}</TableHead>
              <TableHead>{t('promotion.table.validUntil')}</TableHead>
              <TableHead>{t('promotion.table.status')}</TableHead>
              <TableHead>{t('promotion.table.uses')}</TableHead>
              <TableHead>{t('promotion.table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className='text-center py-8'>
                  <LoaderIcon className='h-4 w-4 animate-spin inline mr-2' />
                  {t('promotion.table.loading')}
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className='text-center py-8 text-red-500'
                >
                  {t('promotion.table.error')}: {error}
                </TableCell>
              </TableRow>
            ) : filteredPromotions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className='text-center py-8 text-muted-foreground'
                >
                  {t('promotion.table.empty')}
                </TableCell>
              </TableRow>
            ) : (
              filteredPromotions.map(promotion => (
                <TableRow key={promotion.id}>
                  <TableCell className='font-mono font-semibold'>
                    {promotion.code}
                  </TableCell>
                  <TableCell>
                    {promotion.description || (
                      <span className='italic text-muted-foreground'>
                        {t('promotion.table.noDescription')}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className='font-semibold text-green-600'>
                    {promotion.discount}%
                  </TableCell>
                  <TableCell>{formatDate(promotion.validFrom)}</TableCell>
                  <TableCell>{formatDate(promotion.validUntil)}</TableCell>
                  <TableCell>{getStatusBadge(promotion)}</TableCell>
                  <TableCell>
                    {promotion.promotionBookings?.length || 0}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                          <MoreVerticalIcon className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          onClick={() =>
                            setSelectedPromotion(promotion) ||
                            setShowPromotionDetails(true)
                          }
                        >
                          {t('promotion.actions.viewDetails')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteFromTable(promotion)}
                          disabled={promotion.promotionBookings?.length > 0}
                          className='text-red-600'
                        >
                          {t('promotion.actions.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form & Details */}
      <PromotionForm
        open={showPromotionForm}
        onOpenChange={setShowPromotionForm}
        onSubmit={handleCreatePromotion}
        loading={loading}
      />
      <PromotionDetails
        open={showPromotionDetails}
        onOpenChange={setShowPromotionDetails}
        promotion={selectedPromotion}
        onUpdate={handleUpdatePromotion}
        onDelete={handleDeletePromotion}
        loading={loading}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t('promotion.dialog.deleteTitle')}
        description={t('promotion.dialog.deleteDesc', {
          code: promotionToDelete?.code,
        })}
        onConfirm={() =>
          promotionToDelete && handleDeletePromotion(promotionToDelete.id)
        }
        confirmText={t('promotion.dialog.deleteConfirm')}
        cancelText={t('promotion.dialog.deleteCancel')}
        confirmVariant='destructive'
      />
    </div>
  );
}
