import { useState } from 'react';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Textarea } from '../../../shared/components/ui/textarea';

export function BookingCompleteForm({ onSubmit, onCancel, loading = false }) {
  const [formData, setFormData] = useState({
    actualEndTime: '',
    actualReturnLocation: '',
    returnOdometer: '',
    notes: '',
    damageReport: '',
    batteryLevel: '',
    rating: '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.actualEndTime) {
      newErrors.actualEndTime = 'Actual end time is required';
    }

    if (formData.rating && (formData.rating < 1 || formData.rating > 5)) {
      newErrors.rating = 'Rating must be between 1 and 5';
    }

    if (
      formData.batteryLevel &&
      (formData.batteryLevel < 0 || formData.batteryLevel > 100)
    ) {
      newErrors.batteryLevel = 'Battery level must be between 0 and 100';
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
        returnOdometer: formData.returnOdometer
          ? parseFloat(formData.returnOdometer)
          : undefined,
        batteryLevel: formData.batteryLevel
          ? parseFloat(formData.batteryLevel)
          : undefined,
        rating: formData.rating ? parseFloat(formData.rating) : undefined,
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
        {/* Actual End Time */}
        <div className='space-y-2'>
          <Label htmlFor='actualEndTime'>Actual End Time *</Label>
          <Input
            id='actualEndTime'
            type='datetime-local'
            value={formData.actualEndTime}
            onChange={e => handleInputChange('actualEndTime', e.target.value)}
            className={errors.actualEndTime ? 'border-red-500' : ''}
          />
          {errors.actualEndTime && (
            <p className='text-sm text-red-500'>{errors.actualEndTime}</p>
          )}
        </div>

        {/* Return Location */}
        <div className='space-y-2'>
          <Label htmlFor='actualReturnLocation'>Return Location</Label>
          <Input
            id='actualReturnLocation'
            value={formData.actualReturnLocation}
            onChange={e =>
              handleInputChange('actualReturnLocation', e.target.value)
            }
            placeholder='Where was the vehicle returned?'
          />
        </div>

        {/* Return Odometer */}
        <div className='space-y-2'>
          <Label htmlFor='returnOdometer'>Return Odometer (km)</Label>
          <Input
            id='returnOdometer'
            type='number'
            value={formData.returnOdometer}
            onChange={e => handleInputChange('returnOdometer', e.target.value)}
            placeholder='Final odometer reading'
          />
        </div>

        {/* Battery Level */}
        <div className='space-y-2'>
          <Label htmlFor='batteryLevel'>Battery Level (%)</Label>
          <Input
            id='batteryLevel'
            type='number'
            min='0'
            max='100'
            value={formData.batteryLevel}
            onChange={e => handleInputChange('batteryLevel', e.target.value)}
            placeholder='Battery level when returned'
            className={errors.batteryLevel ? 'border-red-500' : ''}
          />
          {errors.batteryLevel && (
            <p className='text-sm text-red-500'>{errors.batteryLevel}</p>
          )}
        </div>

        {/* Customer Rating */}
        <div className='space-y-2'>
          <Label htmlFor='rating'>Customer Rating (1-5)</Label>
          <Input
            id='rating'
            type='number'
            min='1'
            max='5'
            value={formData.rating}
            onChange={e => handleInputChange('rating', e.target.value)}
            placeholder='Customer satisfaction rating'
            className={errors.rating ? 'border-red-500' : ''}
          />
          {errors.rating && (
            <p className='text-sm text-red-500'>{errors.rating}</p>
          )}
        </div>
      </div>

      {/* Damage Report */}
      <div className='space-y-2'>
        <Label htmlFor='damageReport'>Damage Report</Label>
        <Textarea
          id='damageReport'
          value={formData.damageReport}
          onChange={e => handleInputChange('damageReport', e.target.value)}
          placeholder='Describe any damage or issues with the vehicle...'
          rows={3}
        />
      </div>

      {/* Notes */}
      <div className='space-y-2'>
        <Label htmlFor='notes'>Notes</Label>
        <Textarea
          id='notes'
          value={formData.notes}
          onChange={e => handleInputChange('notes', e.target.value)}
          placeholder='Additional notes about the rental...'
          rows={3}
        />
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
          {loading ? 'Completing...' : 'Complete Booking'}
        </Button>
      </div>
    </form>
  );
}
