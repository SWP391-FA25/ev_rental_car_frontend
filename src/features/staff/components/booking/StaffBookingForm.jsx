import { AlertCircle, Calendar, Clock, MapPin, User } from 'lucide-react';
import { Alert, AlertDescription } from '../../../shared/components/ui/alert';
import { Button } from '../../../shared/components/ui/button';
import { Combobox } from '../../../shared/components/ui/combobox';
import { DatePicker } from '../../../shared/components/ui/date-picker';
import { Label } from '../../../shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/components/ui/select';
import { Separator } from '../../../shared/components/ui/separator';
import { Textarea } from '../../../shared/components/ui/textarea';
import { TimePicker } from '../../../shared/components/ui/time-picker';
import { useStaffBooking } from '../../hooks/useStaffBooking';
import { PricingBreakdown } from './PricingBreakdown';
import { VehicleSelector } from './VehicleSelector';

export const StaffBookingForm = ({ onSuccess, onCancel }) => {
  const {
    formData,
    updateField,
    renters,
    stations,
    vehicles,
    promotions,
    loadingRenters,
    loadingStations,
    loadingVehicles,
    submitting,
    calculatePricing,
    submitBooking,
    error,
    validationErrors,
  } = useStaffBooking();

  const handleSubmit = async e => {
    console.log(formData);
    e.preventDefault();
    const result = await submitBooking();
    if (result.success) {
      onSuccess?.(result.data);
    }
  };

  const pricingBreakdown = calculatePricing();

  // Check if time range is invalid
  const isInvalidTimeRange = () => {
    if (!formData.startDate || !formData.endDate) return false;

    const startDateTime = new Date(formData.startDate);
    startDateTime.setHours(
      parseInt(formData.startTime.split(':')[0]),
      parseInt(formData.startTime.split(':')[1])
    );

    const endDateTime = new Date(formData.endDate);
    endDateTime.setHours(
      parseInt(formData.endTime.split(':')[0]),
      parseInt(formData.endTime.split(':')[1])
    );

    return endDateTime <= startDateTime;
  };

  // Prepare renter options for Combobox
  const renterOptions = renters.map(renter => ({
    value: renter.id,
    label: `${renter.name} (${renter.email})`,
    searchText: `${renter.name} ${renter.email} ${renter.phone || ''}`,
  }));

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Error Alert */}
      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Renter Selection */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <User className='h-5 w-5 text-primary' />
          <h3 className='text-lg font-semibold'>Step 1: Select Renter</h3>
        </div>
        <div className='space-y-2'>
          <Label htmlFor='renterId'>
            Renter <span className='text-destructive'>*</span>
          </Label>
          <Combobox
            options={renterOptions}
            value={formData.renterId}
            onValueChange={value => updateField('renterId', value)}
            placeholder='Search and select a renter...'
            searchPlaceholder='Search by name or email...'
            emptyText='No renters found.'
            disabled={loadingRenters}
            renderOption={option => (
              <div className='flex flex-col'>
                <span className='font-medium'>
                  {option.label.split(' (')[0]}
                </span>
                <span className='text-xs text-muted-foreground'>
                  {option.label.match(/\(([^)]+)\)/)?.[1]}
                </span>
              </div>
            )}
          />
          {loadingRenters && (
            <p className='text-xs text-muted-foreground'>Loading renters...</p>
          )}
        </div>
      </div>

      <Separator />

      {/* Step 2: Station Selection */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <MapPin className='h-5 w-5 text-primary' />
          <h3 className='text-lg font-semibold'>Step 2: Select Station</h3>
        </div>
        <div className='space-y-2'>
          <Label htmlFor='stationId'>
            Pickup Station <span className='text-destructive'>*</span>
          </Label>
          <Select
            value={formData.stationId}
            onValueChange={value => updateField('stationId', value)}
            disabled={loadingStations}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select a station...' />
            </SelectTrigger>
            <SelectContent>
              {stations.map(station => (
                <SelectItem key={station.id} value={station.id}>
                  {station.name} - {station.address}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {loadingStations && (
            <p className='text-xs text-muted-foreground'>Loading stations...</p>
          )}
        </div>
      </div>

      <Separator />

      {/* Step 3: Date & Time Selection */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <Calendar className='h-5 w-5 text-primary' />
          <h3 className='text-lg font-semibold'>
            Step 3: Select Rental Period
          </h3>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* Start Date & Time */}
          <div className='space-y-3'>
            <div className='space-y-2'>
              <Label>
                Start Date <span className='text-destructive'>*</span>
              </Label>
              <DatePicker
                value={formData.startDate}
                onChange={value => updateField('startDate', value)}
                placeholder='Select start date'
                minDate={new Date()}
                disabled={submitting}
              />
            </div>
            <div className='space-y-2'>
              <Label>
                Start Time <span className='text-destructive'>*</span>
              </Label>
              <TimePicker
                value={formData.startTime}
                onChange={value => updateField('startTime', value)}
                disabled={submitting}
              />
            </div>
          </div>

          {/* End Date & Time */}
          <div className='space-y-3'>
            <div className='space-y-2'>
              <Label>
                End Date <span className='text-destructive'>*</span>
              </Label>
              <DatePicker
                value={formData.endDate}
                onChange={value => updateField('endDate', value)}
                placeholder='Select end date'
                disabled={!formData.startDate || submitting}
                minDate={formData.startDate || new Date()}
              />
            </div>
            <div className='space-y-2'>
              <Label>
                End Time <span className='text-destructive'>*</span>
              </Label>
              <TimePicker
                value={formData.endTime}
                onChange={value => updateField('endTime', value)}
                disabled={submitting}
              />
            </div>
          </div>
        </div>

        {formData.startDate && formData.endDate && (
          <Alert>
            <Clock className='h-4 w-4' />
            <AlertDescription>
              {formData.endDate <= formData.startDate
                ? 'End date must be after start date'
                : 'Ready to search for available vehicles'}
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Separator />

      {/* Step 4: Vehicle Selection */}
      {formData.stationId &&
        formData.startDate &&
        formData.endDate &&
        formData.startTime &&
        formData.endTime &&
        !isInvalidTimeRange() && (
          <div className='space-y-4'>
            <VehicleSelector
              vehicles={vehicles}
              selectedVehicleId={formData.vehicleId}
              onSelectVehicle={vehicleId => updateField('vehicleId', vehicleId)}
              loading={loadingVehicles}
            />
          </div>
        )}

      {/* Step 5: Promotion Selection (Optional) */}
      {formData.vehicleId && (
        <>
          <Separator />
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>
              Step 5: Apply Promotion (Optional)
            </h3>
            <div className='space-y-2'>
              <Label htmlFor='promotionId'>Promotion Code</Label>
              <Select
                value={formData.promotionId}
                onValueChange={value => updateField('promotionId', value)}
                disabled={submitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder='No promotion (optional)' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='none'>No promotion</SelectItem>
                  {promotions.map(promotion => (
                    <SelectItem key={promotion.id} value={promotion.id}>
                      {promotion.code} - {promotion.discount}
                      {promotion.discountType === 'PERCENTAGE'
                        ? '%'
                        : ' VND'}{' '}
                      off
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      )}

      {/* Step 6: Pricing Breakdown */}
      {formData.vehicleId && (
        <>
          <Separator />
          <PricingBreakdown pricing={pricingBreakdown} />
        </>
      )}

      {/* Additional Notes */}
      {formData.vehicleId && (
        <>
          <Separator />
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Additional Information</h3>
            <div className='space-y-2'>
              <Label htmlFor='notes'>Notes (Optional)</Label>
              <Textarea
                id='notes'
                value={formData.notes}
                onChange={e => updateField('notes', e.target.value)}
                placeholder='Add any additional notes or special requests...'
                rows={3}
                disabled={submitting}
              />
            </div>
          </div>
        </>
      )}

      {/* Validation Errors Alert */}
      {validationErrors && validationErrors.length > 0 && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            <ul className='list-disc list-inside space-y-1'>
              {validationErrors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className='flex justify-end gap-3 pt-4'>
        <Button
          type='button'
          variant='outline'
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type='submit' disabled={submitting || !formData.vehicleId}>
          {submitting ? 'Creating Booking...' : 'Create Booking'}
        </Button>
      </div>
    </form>
  );
};
