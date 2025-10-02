import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../shared/components/ui/dialog';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/components/ui/select';
import { Textarea } from '../../../shared/components/ui/textarea';
import { Button } from './../../../shared/components/ui/button';

export function StaffForm({ open, onOpenChange, onSubmit, loading = false }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    accountStatus: 'ACTIVE',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        accountStatus: 'ACTIVE',
      });
      setErrors({});
    }
  }, [open]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.phone && !/^0\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be 10 digits starting with 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      // Error already handled by parent component
      console.error('Error submitting staff form:', error.message);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Add New Staff</DialogTitle>
          <DialogDescription>
            Create a new staff account. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='name' className='text-right'>
                Name *
              </Label>
              <Input
                id='name'
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                className={`col-span-3 ${errors.name ? 'border-red-500' : ''}`}
                placeholder='Enter full name'
              />
              {errors.name && (
                <p className='col-start-2 col-span-3 text-sm text-red-500'>
                  {errors.name}
                </p>
              )}
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='email' className='text-right'>
                Email *
              </Label>
              <Input
                id='email'
                type='email'
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                className={`col-span-3 ${errors.email ? 'border-red-500' : ''}`}
                placeholder='Enter email address'
              />
              {errors.email && (
                <p className='col-start-2 col-span-3 text-sm text-red-500'>
                  {errors.email}
                </p>
              )}
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='password' className='text-right'>
                Password *
              </Label>
              <Input
                id='password'
                type='password'
                value={formData.password}
                onChange={e => handleInputChange('password', e.target.value)}
                className={`col-span-3 ${errors.password ? 'border-red-500' : ''}`}
                placeholder='Enter password'
              />
              {errors.password && (
                <p className='col-start-2 col-span-3 text-sm text-red-500'>
                  {errors.password}
                </p>
              )}
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='phone' className='text-right'>
                Phone
              </Label>
              <Input
                id='phone'
                value={formData.phone}
                onChange={e => handleInputChange('phone', e.target.value)}
                className={`col-span-3 ${errors.phone ? 'border-red-500' : ''}`}
                placeholder='Enter phone number (0xxxxxxxxx)'
              />
              {errors.phone && (
                <p className='col-start-2 col-span-3 text-sm text-red-500'>
                  {errors.phone}
                </p>
              )}
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='address' className='text-right'>
                Address
              </Label>
              <Textarea
                id='address'
                value={formData.address}
                onChange={e => handleInputChange('address', e.target.value)}
                className='col-span-3'
                placeholder='Enter address'
                rows={3}
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='status' className='text-right'>
                Status
              </Label>
              <Select
                value={formData.accountStatus}
                onValueChange={value =>
                  handleInputChange('accountStatus', value)
                }
              >
                <SelectTrigger className='col-span-3'>
                  <SelectValue placeholder='Select status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ACTIVE'>Active</SelectItem>
                  <SelectItem value='SUSPENDED'>Suspended</SelectItem>
                  <SelectItem value='BANNED'>Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? 'Creating...' : 'Create Staff'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
