import { useEffect, useState } from 'react';
import { LocationPicker } from '../../../shared/components/LocationPicker';
import { Button } from '../../../shared/components/ui/button';
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

// Station status options
const STATION_STATUS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
];

export function StationForm({ station, onSubmit, onCancel, loading = false }) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    status: 'ACTIVE',
    capacity: '',
    contact: '',
  });

  const [errors, setErrors] = useState({});

  // Initialize form data when station prop changes
  useEffect(() => {
    if (station) {
      setFormData({
        name: station.name || '',
        location: station.location || '',
        address: station.address || '',
        status: station.status || 'ACTIVE',
        capacity: station.capacity || '',
        contact: station.contact || '',
      });
    }
  }, [station]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Station name is required';
    }

    if (
      !formData.location ||
      (typeof formData.location === 'string' && !formData.location.trim()) ||
      (typeof formData.location === 'object' && !formData.location.coordinates)
    ) {
      newErrors.location = 'Location is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.capacity || formData.capacity <= 0) {
      newErrors.capacity = 'Capacity must be a positive number';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
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
      const submitData = {
        ...formData,
        capacity: parseInt(formData.capacity),
      };

      await onSubmit(submitData);
    } catch (error) {
      // Error already handled by parent component
      console.error('Form submission error:', error.message);
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
        [field]: '',
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Station Name */}
        <div className='space-y-2'>
          <Label htmlFor='name'>Station Name *</Label>
          <Input
            id='name'
            value={formData.name}
            onChange={e => handleInputChange('name', e.target.value)}
            placeholder='e.g., Central Station'
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className='text-sm text-red-500'>{errors.name}</p>}
        </div>

        {/* Status */}
        <div className='space-y-2'>
          <Label htmlFor='status'>Status *</Label>
          <Select
            value={formData.status}
            onValueChange={value => handleInputChange('status', value)}
          >
            <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
              <SelectValue placeholder='Select status' />
            </SelectTrigger>
            <SelectContent>
              {STATION_STATUS.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.status && (
            <p className='text-sm text-red-500'>{errors.status}</p>
          )}
        </div>

        {/* Location */}
        <div className='space-y-2'>
          <LocationPicker
            value={formData.location}
            onChange={location => handleInputChange('location', location)}
            label='Location *'
          />
          {errors.location && (
            <p className='text-sm text-red-500'>{errors.location}</p>
          )}
        </div>

        {/* Capacity */}
        <div className='space-y-2'>
          <Label htmlFor='capacity'>Capacity *</Label>
          <Input
            id='capacity'
            type='number'
            min='1'
            value={formData.capacity}
            onChange={e => handleInputChange('capacity', e.target.value)}
            placeholder='e.g., 10'
            className={errors.capacity ? 'border-red-500' : ''}
          />
          {errors.capacity && (
            <p className='text-sm text-red-500'>{errors.capacity}</p>
          )}
        </div>

        {/* Contact */}
        <div className='space-y-2 md:col-span-2'>
          <Label htmlFor='contact'>Contact Information</Label>
          <Input
            id='contact'
            value={formData.contact}
            onChange={e => handleInputChange('contact', e.target.value)}
            placeholder='e.g., +84 123 456 789 or email@example.com'
          />
        </div>

        {/* Address */}
        <div className='space-y-2 md:col-span-2'>
          <Label htmlFor='address'>Full Address *</Label>
          <Textarea
            id='address'
            value={formData.address}
            onChange={e => handleInputChange('address', e.target.value)}
            placeholder='Enter the complete address of the station'
            rows={3}
            className={errors.address ? 'border-red-500' : ''}
          />
          {errors.address && (
            <p className='text-sm text-red-500'>{errors.address}</p>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className='flex justify-end space-x-2 pt-4'>
        <Button
          type='button'
          variant='outline'
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type='submit' disabled={loading}>
          {loading
            ? 'Saving...'
            : station
            ? 'Update Station'
            : 'Create Station'}
        </Button>
      </div>
    </form>
  );
}
