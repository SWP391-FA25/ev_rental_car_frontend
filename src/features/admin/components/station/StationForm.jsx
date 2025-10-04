import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  { value: 'ACTIVE', label: 'station.form.status.active' },
  { value: 'INACTIVE', label: 'station.form.status.inactive' },
  { value: 'MAINTENANCE', label: 'station.form.status.maintenance' },
];

export function StationForm({ station, onSubmit, onCancel, loading = false }) {
  const { t } = useTranslation();

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
      newErrors.name = t('station.form.errors.nameRequired');
    }

    if (
      !formData.location ||
      (typeof formData.location === 'string' && !formData.location.trim()) ||
      (typeof formData.location === 'object' && !formData.location.coordinates)
    ) {
      newErrors.location = t('station.form.errors.locationRequired');
    }

    if (!formData.address.trim()) {
      newErrors.address = t('station.form.errors.addressRequired');
    }

    if (!formData.capacity || formData.capacity <= 0) {
      newErrors.capacity = t('station.form.errors.capacityInvalid');
    }

    if (!formData.status) {
      newErrors.status = t('station.form.errors.statusRequired');
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
      console.error('Form submission error:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

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
          <Label htmlFor='name'>{t('station.form.name')} *</Label>
          <Input
            id='name'
            value={formData.name}
            onChange={e => handleInputChange('name', e.target.value)}
            placeholder={t('station.form.placeholders.name')}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className='text-sm text-red-500'>{errors.name}</p>}
        </div>

        {/* Status */}
        <div className='space-y-2'>
          <Label htmlFor='status'>{t('station.form.status.label')} *</Label>
          <Select
            value={formData.status}
            onValueChange={value => handleInputChange('status', value)}
          >
            <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
              <SelectValue placeholder={t('station.form.placeholders.status')} />
            </SelectTrigger>
            <SelectContent>
              {STATION_STATUS.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {t(status.label)}
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
            label={t('station.form.location') + ' *'}
          />
          {errors.location && (
            <p className='text-sm text-red-500'>{errors.location}</p>
          )}
        </div>

        {/* Capacity */}
        <div className='space-y-2'>
          <Label htmlFor='capacity'>{t('station.form.capacity')} *</Label>
          <Input
            id='capacity'
            type='number'
            min='1'
            value={formData.capacity}
            onChange={e => handleInputChange('capacity', e.target.value)}
            placeholder={t('station.form.placeholders.capacity')}
            className={errors.capacity ? 'border-red-500' : ''}
          />
          {errors.capacity && (
            <p className='text-sm text-red-500'>{errors.capacity}</p>
          )}
        </div>

        {/* Contact */}
        <div className='space-y-2 md:col-span-2'>
          <Label htmlFor='contact'>{t('station.form.contact')}</Label>
          <Input
            id='contact'
            value={formData.contact}
            onChange={e => handleInputChange('contact', e.target.value)}
            placeholder={t('station.form.placeholders.contact')}
          />
        </div>

        {/* Address */}
        <div className='space-y-2 md:col-span-2'>
          <Label htmlFor='address'>{t('station.form.address')} *</Label>
          <Textarea
            id='address'
            value={formData.address}
            onChange={e => handleInputChange('address', e.target.value)}
            placeholder={t('station.form.placeholders.address')}
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
          {t('station.form.cancel')}
        </Button>
        <Button type='submit' disabled={loading}>
          {loading
            ? t('station.form.saving')
            : station
              ? t('station.form.update')
              : t('station.form.create')}
        </Button>
      </div>
    </form>
  );
}
