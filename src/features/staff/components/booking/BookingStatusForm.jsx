import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../shared/components/ui/button';
import { Label } from '../../../shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/components/ui/select';
import { Textarea } from '../../../shared/components/ui/textarea';

// Booking status options
const BOOKING_STATUS = [
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export function BookingStatusForm({
  booking,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    status: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

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
      await onSubmit(formData);
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
      <div className='space-y-4'>
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
              {BOOKING_STATUS.map(status => (
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

        {/* Notes */}
        <div className='space-y-2'>
          <Label htmlFor='notes'>Notes (Optional)</Label>
          <Textarea
            id='notes'
            value={formData.notes}
            onChange={e => handleInputChange('notes', e.target.value)}
            placeholder='Add any notes about this status change...'
            rows={3}
          />
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
          {loading ? 'Updating...' : 'Update Status'}
        </Button>
      </div>
    </form>
  );
}
