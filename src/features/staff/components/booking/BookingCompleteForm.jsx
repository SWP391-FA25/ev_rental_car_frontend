import { useEffect, useState } from 'react';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Textarea } from '../../../shared/components/ui/textarea';
import { Combobox } from '../../../shared/components/ui/combobox';
import { stationService } from '@/features/cars/services/stationService';

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

  const [stations, setStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(false);
  const [selectedReturnStationId, setSelectedReturnStationId] = useState('');

  useEffect(() => {
    const loadStations = async () => {
      setLoadingStations(true);
      try {
        const response = await stationService.getAllStations();
        const list =
          response?.data?.stations ||
          response?.data ||
          response?.stations ||
          [];
        setStations(Array.isArray(list) ? list : []);
      } catch (e) {
        // keep stations empty on failure
      } finally {
        setLoadingStations(false);
      }
    };
    loadStations();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.actualEndTime) {
      newErrors.actualEndTime = 'Actual end time is required';
    }

    const loc = (formData.actualReturnLocation || '').trim();
    if (!loc) {
      newErrors.actualReturnLocation = 'Return location is required';
    } else if (loc.length < 3) {
      newErrors.actualReturnLocation =
        'Return location must be at least 3 characters';
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
      // Chuẩn hóa thời gian thành ISO8601 để khớp validator backend
      const endISO = formData.actualEndTime
        ? new Date(formData.actualEndTime).toISOString()
        : new Date().toISOString();
      // Chuẩn hóa tên trạm: trim để tránh lỗi khoảng trắng
      const location = (formData.actualReturnLocation || '').trim();

      const submitData = {
        ...formData,
        actualEndTime: endISO,
        actualReturnLocation: location,
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
          <Combobox
            value={selectedReturnStationId}
            onValueChange={value => {
              setSelectedReturnStationId(value);
              const selected = stations.find(
                s => String(s.id) === String(value)
              );
              const stationName = selected?.name ? String(selected.name).trim() : '';
              handleInputChange('actualReturnLocation', stationName);
            }}
            placeholder='Select return station'
            searchPlaceholder='Search station by name/address/code'
            disabled={loadingStations}
            options={stations.map(station => ({
              value: String(station.id),
              label: station.name || station.address || String(station.id),
              searchText: [station.name, station.address, station.code]
                .filter(Boolean)
                .join(' '),
            }))}
            className={errors.actualReturnLocation ? 'border-red-500' : ''}
          />
          {errors.actualReturnLocation && (
            <p className='text-sm text-red-500'>
              {errors.actualReturnLocation}
            </p>
          )}
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
