import { FilterIcon, LoaderIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { MoreVerticalIcon } from 'lucide-react';
import { Badge } from '../../shared/components/ui/badge';
import { Button } from '../../shared/components/ui/button';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPromotionForm, setShowPromotionForm] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [showPromotionDetails, setShowPromotionDetails] = useState(false);

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
          Upcoming
        </Badge>
      );
    } else if (now > validUntil) {
      return <Badge variant='destructive'>Expired</Badge>;
    } else {
      return (
        <Badge variant='default' className='bg-green-600'>
          Active
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
      toast.success('Promotion created successfully');
    } catch (err) {
      toast.error('Failed to create promotion');
      throw err;
    }
  };

  const handleViewDetails = promotion => {
    setSelectedPromotion(promotion);
    setShowPromotionDetails(true);
  };

  const handleUpdatePromotion = async (id, promotionData) => {
    try {
      const updatedPromotion = await updatePromotion(id, promotionData);
      // Update the selected promotion with the latest data
      if (selectedPromotion && selectedPromotion.id === id) {
        setSelectedPromotion(updatedPromotion);
      }
      toast.success('Promotion updated successfully');
    } catch (err) {
      toast.error('Failed to update promotion');
      throw err;
    }
  };

  const handleDeletePromotion = async id => {
    try {
      await deletePromotion(id);
      toast.success('Promotion deleted successfully');
    } catch (err) {
      toast.error('Failed to delete promotion');
      throw err;
    }
  };

  const handleDeleteFromTable = async promotion => {
    // Check if promotion has active bookings
    if (promotion.promotionBookings?.length > 0) {
      toast.error('Cannot delete promotion with active bookings');
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete the promotion "${promotion.code}"?`
      )
    ) {
      try {
        await handleDeletePromotion(promotion.id);
      } catch (err) {
        console.error('Error deleting promotion:', err);
      }
    }
  };

  const getStats = () => {
    const now = new Date();
    const active = promotions.filter(p => {
      const validFrom = new Date(p.validFrom);
      const validUntil = new Date(p.validUntil);
      return now >= validFrom && now <= validUntil;
    }).length;

    const upcoming = promotions.filter(p => {
      const validFrom = new Date(p.validFrom);
      return now < validFrom;
    }).length;

    const expired = promotions.filter(p => {
      const validUntil = new Date(p.validUntil);
      return now > validUntil;
    }).length;

    return { active, upcoming, expired, total: promotions.length };
  };

  const stats = getStats();

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Promotion Management
          </h1>
          <p className='text-muted-foreground'>
            Manage promotional codes and discounts
          </p>
        </div>
        <Button onClick={() => setShowPromotionForm(true)} disabled={loading}>
          <PlusIcon className='mr-2 h-4 w-4' />
          Add Promotion
        </Button>
      </div>

      {/* Filters */}
      <div className='flex items-center space-x-4'>
        <div className='relative flex-1 max-w-sm'>
          <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Search promotions...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline'>
              <FilterIcon className='mr-2 h-4 w-4' />
              Status: {filterStatus === 'all' ? 'All' : filterStatus}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterStatus('all')}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('active')}>
              Active
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('upcoming')}>
              Upcoming
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('expired')}>
              Expired
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Promotions Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Valid From</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uses</TableHead>
              <TableHead className='w-[70px]'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className='text-center py-8'>
                  <div className='flex items-center justify-center gap-2'>
                    <LoaderIcon className='h-4 w-4 animate-spin' />
                    Loading promotions...
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className='text-center py-8 text-red-500'
                >
                  Error: {error}
                </TableCell>
              </TableRow>
            ) : filteredPromotions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className='text-center py-8 text-muted-foreground'
                >
                  No promotions found
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
                      <span className='text-muted-foreground italic'>
                        No description
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
                          onClick={() => handleViewDetails(promotion)}
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteFromTable(promotion)}
                          disabled={promotion.promotionBookings?.length > 0}
                          className='text-red-600 focus:text-red-600'
                        >
                          Delete
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

      {/* Summary Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>{stats.total}</div>
          <div className='text-sm text-muted-foreground'>Total Promotions</div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold text-green-600'>
            {stats.active}
          </div>
          <div className='text-sm text-muted-foreground'>Active</div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold text-blue-600'>
            {stats.upcoming}
          </div>
          <div className='text-sm text-muted-foreground'>Upcoming</div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold text-red-600'>{stats.expired}</div>
          <div className='text-sm text-muted-foreground'>Expired</div>
        </div>
      </div>

      {/* Promotion Form Dialog */}
      <PromotionForm
        open={showPromotionForm}
        onOpenChange={setShowPromotionForm}
        onSubmit={handleCreatePromotion}
        loading={loading}
      />

      {/* Promotion Details Dialog */}
      <PromotionDetails
        open={showPromotionDetails}
        onOpenChange={setShowPromotionDetails}
        promotion={selectedPromotion}
        onUpdate={handleUpdatePromotion}
        onDelete={handleDeletePromotion}
        loading={loading}
      />
    </div>
  );
}
