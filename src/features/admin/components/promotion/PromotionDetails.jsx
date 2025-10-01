import { format } from 'date-fns';
import { CalendarIcon, LoaderIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../shared/components/ui/dialog';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Textarea } from '../../../shared/components/ui/textarea';

export function PromotionDetails({
  open,
  onOpenChange,
  promotion,
  onUpdate,
  onDelete,
  loading = false,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount: '',
    validFrom: '',
    validUntil: '',
  });

  // Update formData when promotion prop changes
  useEffect(() => {
    if (promotion) {
      setFormData({
        code: promotion.code || '',
        description: promotion.description || '',
        discount: promotion.discount?.toString() || '',
        validFrom: promotion.validFrom
          ? format(new Date(promotion.validFrom), 'yyyy-MM-dd')
          : '',
        validUntil: promotion.validUntil
          ? format(new Date(promotion.validUntil), 'yyyy-MM-dd')
          : '',
      });
    }
  }, [promotion]);

  // Reset editing state when dialog closes
  useEffect(() => {
    if (!open) {
      setIsEditing(false);
    }
  }, [open]);

  if (!promotion) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const updateData = {
        code: formData.code.trim(),
        description: formData.description.trim() || null,
        discount: parseFloat(formData.discount),
        validFrom: new Date(formData.validFrom).toISOString(),
        validUntil: new Date(formData.validUntil).toISOString(),
      };
      await onUpdate(promotion.id, updateData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating promotion:', error);
    }
  };

  const handleCancel = () => {
    if (promotion) {
      setFormData({
        code: promotion.code || '',
        description: promotion.description || '',
        discount: promotion.discount?.toString() || '',
        validFrom: promotion.validFrom
          ? format(new Date(promotion.validFrom), 'yyyy-MM-dd')
          : '',
        validUntil: promotion.validUntil
          ? format(new Date(promotion.validUntil), 'yyyy-MM-dd')
          : '',
      });
    }
    setIsEditing(false);
  };

  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isCurrentlyValid = () => {
    const now = new Date();
    const validFrom = new Date(promotion.validFrom);
    const validUntil = new Date(promotion.validUntil);
    return now >= validFrom && now <= validUntil;
  };

  const getStatusBadge = () => {
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

  const handleDelete = async () => {
    try {
      await onDelete(promotion.id);
      setShowDeleteConfirm(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting promotion:', error);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={loading ? undefined : onOpenChange}>
        <DialogContent className='w-[95vw] max-w-[800px] max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center justify-between'>
              <span>Promotion Details</span>
              {getStatusBadge()}
            </DialogTitle>
            <DialogDescription>
              View and manage promotion information
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-6'>
            {/* Basic Information */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>Basic Information</h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='code'>Promotion Code</Label>
                  {isEditing ? (
                    <Input
                      id='code'
                      value={formData.code}
                      onChange={e =>
                        handleInputChange('code', e.target.value.toUpperCase())
                      }
                      className='w-full font-mono'
                      disabled={loading}
                    />
                  ) : (
                    <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                      <span className='font-mono font-semibold'>
                        {promotion.code}
                      </span>
                    </div>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='discount'>Discount</Label>
                  {isEditing ? (
                    <div className='flex items-center space-x-2'>
                      <Input
                        id='discount'
                        type='number'
                        step='0.01'
                        min='0'
                        value={formData.discount}
                        onChange={e =>
                          handleInputChange('discount', e.target.value)
                        }
                        className='w-full'
                        disabled={loading}
                      />
                      <span className='text-sm text-muted-foreground'>%</span>
                    </div>
                  ) : (
                    <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                      <span className='font-semibold text-green-600'>
                        {promotion.discount}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='description'>Description</Label>
                {isEditing ? (
                  <Textarea
                    id='description'
                    value={formData.description}
                    onChange={e =>
                      handleInputChange('description', e.target.value)
                    }
                    placeholder='Optional description for the promotion'
                    rows={3}
                    className='w-full resize-none'
                    disabled={loading}
                  />
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[80px] flex items-start'>
                    {promotion.description || 'No description'}
                  </div>
                )}
              </div>
            </div>

            {/* Validity Period */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>Validity Period</h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='validFrom'>Valid From</Label>
                  {isEditing ? (
                    <Input
                      id='validFrom'
                      type='date'
                      value={formData.validFrom}
                      onChange={e =>
                        handleInputChange('validFrom', e.target.value)
                      }
                      className='w-full'
                      disabled={loading}
                    />
                  ) : (
                    <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center gap-2'>
                      <CalendarIcon className='h-4 w-4 text-muted-foreground' />
                      <span className='text-sm'>
                        {formatDate(promotion.validFrom)}
                      </span>
                    </div>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='validUntil'>Valid Until</Label>
                  {isEditing ? (
                    <Input
                      id='validUntil'
                      type='date'
                      value={formData.validUntil}
                      onChange={e =>
                        handleInputChange('validUntil', e.target.value)
                      }
                      className='w-full'
                      disabled={loading}
                    />
                  ) : (
                    <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center gap-2'>
                      <CalendarIcon className='h-4 w-4 text-muted-foreground' />
                      <span className='text-sm'>
                        {formatDate(promotion.validUntil)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            {promotion.promotionBookings &&
              promotion.promotionBookings.length > 0 && (
                <div className='space-y-4'>
                  <h3 className='text-lg font-semibold'>Recent Bookings</h3>
                  <div className='space-y-2 max-h-32 overflow-y-auto'>
                    {promotion.promotionBookings
                      .slice(0, 5)
                      .map((booking, index) => (
                        <div
                          key={index}
                          className='flex items-center justify-between p-2 bg-muted rounded'
                        >
                          <div>
                            <p className='text-sm font-medium'>
                              Booking #{booking.booking?.id || 'N/A'}
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              {booking.booking?.createdAt
                                ? formatDate(booking.booking.createdAt)
                                : 'N/A'}
                            </p>
                          </div>
                          <Badge variant='outline' className='text-xs'>
                            {booking.booking?.status || 'Unknown'}
                          </Badge>
                        </div>
                      ))}
                    {promotion.promotionBookings.length > 5 && (
                      <p className='text-xs text-muted-foreground text-center'>
                        ... and {promotion.promotionBookings.length - 5} more
                      </p>
                    )}
                  </div>
                </div>
              )}

            {/* Timestamps */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>Promotion Timeline</h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>Created At</Label>
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    {formatDate(promotion.createdAt)}
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label>Last Updated</Label>
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    {formatDate(promotion.updatedAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row justify-between gap-2 pt-4'>
            <div className='flex gap-2'></div>
            <div className='flex gap-2'>
              {isEditing ? (
                <>
                  <Button
                    variant='outline'
                    onClick={handleCancel}
                    disabled={loading}
                    className='w-full sm:w-auto'
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    className='w-full sm:w-auto'
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant='outline'
                    onClick={() => onOpenChange(false)}
                    className='w-full sm:w-auto'
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className='w-full sm:w-auto'
                  >
                    Edit Promotion
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Promotion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the promotion "{promotion.code}"?
              {promotion.promotionBookings?.length > 0 && (
                <span className='block mt-2 text-red-600 font-medium'>
                  This promotion has {promotion.promotionBookings.length}{' '}
                  associated bookings and cannot be deleted.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className='flex justify-end gap-2'>
            <Button
              variant='outline'
              onClick={() => setShowDeleteConfirm(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleDelete}
              disabled={loading || promotion.promotionBookings?.length > 0}
            >
              {loading && <LoaderIcon className='mr-2 h-4 w-4 animate-spin' />}
              Delete Promotion
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
