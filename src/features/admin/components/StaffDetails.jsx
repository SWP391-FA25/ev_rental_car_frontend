import { useEffect, useState } from 'react';

import { Badge } from '../../shared/components/ui/badge';
import { Button } from '../../shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../shared/components/ui/dialog';
import { Input } from '../../shared/components/ui/input';
import { Label } from '../../shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../shared/components/ui/select';
import { Textarea } from '../../shared/components/ui/textarea';

export function StaffDetails({
  open,
  onOpenChange,
  staff,
  onUpdate,
  loading = false,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    role: 'STAFF',
    accountStatus: 'ACTIVE',
  });

  // Update formData when staff prop changes
  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name || '',
        phone: staff.phone || '',
        address: staff.address || '',
        role: staff.role || 'STAFF',
        accountStatus: staff.accountStatus || 'ACTIVE',
      });
    }
  }, [staff]);

  // Reset editing state when dialog closes
  useEffect(() => {
    if (!open) {
      setIsEditing(false);
    }
  }, [open]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await onUpdate(staff.id, formData);
      setIsEditing(false);
      // Don't show success toast here as it's already handled in parent component
    } catch (err) {
      // Error handling is done in parent component
      console.error('Error updating staff:', err);
    }
  };

  const handleCancel = () => {
    if (staff) {
      setFormData({
        name: staff.name || '',
        phone: staff.phone || '',
        address: staff.address || '',
        role: staff.role || 'STAFF',
        accountStatus: staff.accountStatus || 'ACTIVE',
      });
    }
    setIsEditing(false);
  };

  const getStatusBadgeVariant = status => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'SUSPENDED':
        return 'destructive';
      case 'BANNED':
        return 'destructive';
      default:
        return 'outline';
    }
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

  if (!staff) return null;

  return (
    <Dialog open={open} onOpenChange={loading ? undefined : onOpenChange}>
      <DialogContent className='w-[95vw] max-w-[800px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Staff Details</DialogTitle>
          <DialogDescription>
            View and manage staff account information
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Basic Information */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Basic Information</h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Name</Label>
                {isEditing ? (
                  <Input
                    id='name'
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    className='w-full'
                    disabled={loading}
                  />
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    {staff.name}
                  </div>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {staff.email}
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='phone'>Phone</Label>
                {isEditing ? (
                  <Input
                    id='phone'
                    value={formData.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    placeholder='Enter phone number'
                    className='w-full'
                    disabled={loading}
                  />
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    {staff.phone || 'N/A'}
                  </div>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='role'>Role</Label>
                {isEditing ? (
                  <Select
                    value={formData.role}
                    onValueChange={value => handleInputChange('role', value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='STAFF'>Staff</SelectItem>
                      <SelectItem value='ADMIN'>Admin</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    <Badge variant='default'>{staff.role}</Badge>
                  </div>
                )}
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='address'>Address</Label>
              {isEditing ? (
                <Textarea
                  id='address'
                  value={formData.address}
                  onChange={e => handleInputChange('address', e.target.value)}
                  placeholder='Enter address'
                  rows={3}
                  className='w-full resize-none'
                  disabled={loading}
                />
              ) : (
                <div className='p-2 border rounded-md bg-muted/50 min-h-[80px] flex items-start'>
                  {staff.address || 'N/A'}
                </div>
              )}
            </div>
          </div>

          {/* Account Status */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Account Status</h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='status'>Status</Label>
                {isEditing ? (
                  <Select
                    value={formData.accountStatus}
                    onValueChange={value =>
                      handleInputChange('accountStatus', value)
                    }
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='ACTIVE'>Active</SelectItem>
                      <SelectItem value='SUSPENDED'>Suspended</SelectItem>
                      <SelectItem value='BANNED'>Banned</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    <Badge variant={getStatusBadgeVariant(staff.accountStatus)}>
                      {staff.accountStatus}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Account Timeline</h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>Created At</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {formatDate(staff.createdAt)}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Last Updated</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {formatDate(staff.updatedAt)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row justify-end gap-2 pt-4'>
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
                Edit Staff
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
