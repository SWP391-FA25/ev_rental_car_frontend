import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { apiClient } from '../../shared/lib/apiClient';
import { endpoints } from '../../shared/lib/endpoints';
import { Button } from '../../shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Badge } from '../../shared/components/ui/badge';
import { Separator } from '../../shared/components/ui/separator';
import {
  CalendarIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  UserIcon,
} from 'lucide-react';

export default function UserDetails({
  isOpen,
  onClose,
  userId,
  onUserUpdated,
}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    accountStatus: 'ACTIVE',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails();
    }
  }, [isOpen, userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(endpoints.renters.getById(userId));
      if (response?.success && response?.data?.renter) {
        const userData = response.data.renter;
        setUser(userData);
        setFormData({
          name: userData.name || '',
          phone: userData.phone || '',
          address: userData.address || '',
          accountStatus: userData.accountStatus || 'ACTIVE',
        });
      } else {
        console.error('Invalid response format:', response);
        toast.error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);

      // More detailed error handling
      if (
        error.code === 'ECONNREFUSED' ||
        error.message?.includes('Network Error')
      ) {
        toast.error(
          'Cannot connect to server. Please check if backend is running.'
        );
      } else if (error.status === 401) {
        toast.error('Authentication required. Please login again.');
      } else if (error.status === 404) {
        toast.error('User not found');
      } else if (error.status === 403) {
        toast.error(
          'Access denied. You do not have permission to view this user.'
        );
      } else {
        toast.error(error?.message || 'Failed to fetch user details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.phone && !/^0\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must start with 0 and have exactly 10 digits';
    }

    if (!['ACTIVE', 'SUSPENDED', 'BANNED'].includes(formData.accountStatus)) {
      newErrors.accountStatus = 'Invalid account status';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const response = await apiClient.put(
        endpoints.renters.update(userId),
        formData
      );

      if (response?.success && response?.data?.renter) {
        setUser(response.data.renter);
        setIsEditing(false);
        toast.success('User updated successfully');
        onUserUpdated?.(response.data.renter);
      }
    } catch (error) {
      console.error('Error updating user:', error);

      // Handle validation errors from backend
      if (error?.errors && Array.isArray(error.errors)) {
        const backendErrors = {};
        error.errors.forEach(err => {
          if (err.includes('Name')) backendErrors.name = err;
          else if (err.includes('Phone')) backendErrors.phone = err;
          else if (err.includes('accountStatus'))
            backendErrors.accountStatus = err;
        });
        setErrors(backendErrors);
        toast.error('Please fix the validation errors');
      } else {
        toast.error(error?.message || 'Failed to update user');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        accountStatus: user.accountStatus || 'ACTIVE',
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  const getStatusBadgeVariant = status => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'SUSPENDED':
        return 'secondary';
      case 'BANNED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <UserIcon className='h-5 w-5' />
            User Details
          </DialogTitle>
          <DialogDescription>
            View and manage user information
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className='flex items-center justify-center py-8'>
            <div className='text-muted-foreground'>Loading user details...</div>
          </div>
        ) : user ? (
          <div className='space-y-6'>
            {/* User Info Header */}
            <div className='flex items-start justify-between'>
              <div>
                <h3 className='text-xl font-semibold'>{user.name}</h3>
                <p className='text-muted-foreground'>{user.email}</p>
                <div className='flex items-center gap-2 mt-2'>
                  <Badge variant={getStatusBadgeVariant(user.accountStatus)}>
                    {user.accountStatus}
                  </Badge>
                  <Badge variant='outline'>{user.role}</Badge>
                </div>
              </div>
              <Button
                variant={isEditing ? 'outline' : 'default'}
                onClick={() => setIsEditing(!isEditing)}
                disabled={saving}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </div>

            <Separator />

            {/* Form Fields */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Name */}
              <div className='space-y-2'>
                <Label htmlFor='name'>Name *</Label>
                {isEditing ? (
                  <Input
                    id='name'
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                ) : (
                  <div className='flex items-center gap-2 p-2 border rounded-md bg-muted/50'>
                    <UserIcon className='h-4 w-4 text-muted-foreground' />
                    <span>{user.name || 'N/A'}</span>
                  </div>
                )}
                {errors.name && (
                  <p className='text-sm text-red-500'>{errors.name}</p>
                )}
              </div>

              {/* Email (Read-only) */}
              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <div className='flex items-center gap-2 p-2 border rounded-md bg-muted/50'>
                  <MailIcon className='h-4 w-4 text-muted-foreground' />
                  <span>{user.email}</span>
                </div>
                <p className='text-xs text-muted-foreground'>
                  Email cannot be changed
                </p>
              </div>

              {/* Phone */}
              <div className='space-y-2'>
                <Label htmlFor='phone'>Phone</Label>
                {isEditing ? (
                  <Input
                    id='phone'
                    value={formData.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    placeholder='0xxxxxxxxx'
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                ) : (
                  <div className='flex items-center gap-2 p-2 border rounded-md bg-muted/50'>
                    <PhoneIcon className='h-4 w-4 text-muted-foreground' />
                    <span>{user.phone || 'N/A'}</span>
                  </div>
                )}
                {errors.phone && (
                  <p className='text-sm text-red-500'>{errors.phone}</p>
                )}
              </div>

              {/* Account Status */}
              <div className='space-y-2'>
                <Label htmlFor='accountStatus'>Account Status</Label>
                {isEditing ? (
                  <Select
                    value={formData.accountStatus}
                    onValueChange={value =>
                      handleInputChange('accountStatus', value)
                    }
                  >
                    <SelectTrigger
                      className={errors.accountStatus ? 'border-red-500' : ''}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='ACTIVE'>Active</SelectItem>
                      <SelectItem value='SUSPENDED'>Suspended</SelectItem>
                      <SelectItem value='BANNED'>Banned</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className='flex items-center gap-2 p-2 border rounded-md bg-muted/50'>
                    <Badge variant={getStatusBadgeVariant(user.accountStatus)}>
                      {user.accountStatus}
                    </Badge>
                  </div>
                )}
                {errors.accountStatus && (
                  <p className='text-sm text-red-500'>{errors.accountStatus}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className='space-y-2'>
              <Label htmlFor='address'>Address</Label>
              {isEditing ? (
                <Textarea
                  id='address'
                  value={formData.address}
                  onChange={e => handleInputChange('address', e.target.value)}
                  placeholder='Enter user address'
                  rows={3}
                />
              ) : (
                <div className='flex items-start gap-2 p-2 border rounded-md bg-muted/50 min-h-[60px]'>
                  <MapPinIcon className='h-4 w-4 text-muted-foreground mt-1' />
                  <span>{user.address || 'N/A'}</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Additional Info */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Created At</Label>
                <div className='flex items-center gap-2 p-2 border rounded-md bg-muted/50'>
                  <CalendarIcon className='h-4 w-4 text-muted-foreground' />
                  <span>{formatDate(user.createdAt)}</span>
                </div>
              </div>
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Last Updated</Label>
                <div className='flex items-center gap-2 p-2 border rounded-md bg-muted/50'>
                  <CalendarIcon className='h-4 w-4 text-muted-foreground' />
                  <span>{formatDate(user.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className='flex items-center justify-center py-8'>
            <div className='text-muted-foreground'>User not found</div>
          </div>
        )}

        <DialogFooter>
          {isEditing ? (
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          ) : (
            <Button variant='outline' onClick={onClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
