import {
  CarIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  UsersIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { LocationDisplay } from '../../../shared/components/LocationDisplay';
import { LocationPicker } from '../../../shared/components/LocationPicker';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../shared/components/ui/table';
import { Textarea } from '../../../shared/components/ui/textarea';
import { useTranslation } from 'react-i18next';

// Station status options (label resolved via i18n inside component)
const STATION_STATUS = [
  { value: 'ACTIVE', labelKey: 'station.form.status.active' },
  { value: 'INACTIVE', labelKey: 'station.form.status.inactive' },
  { value: 'MAINTENANCE', labelKey: 'station.form.status.maintenance' },
];

export function StationDetails({
  open,
  onOpenChange,
  station,
  onUpdate,
  loading = false,
}) {
  const { t, i18n } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    status: 'ACTIVE',
    capacity: '',
    contact: '',
  });

  const [errors, setErrors] = useState({});

  // Update formData when station prop changes
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

  // Reset editing state when dialog closes
  useEffect(() => {
    if (!open) {
      setIsEditing(false);
    }
  }, [open]);

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

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const updateData = {
        ...formData,
        capacity: parseInt(formData.capacity),
      };

      await onUpdate(station.id, updateData);
      setIsEditing(false);
      // Don't show success toast here as it's already handled in parent component
    } catch (err) {
      // Error handling is done in parent component
      console.error('Error updating station:', err);
    }
  };

  const handleCancel = () => {
    // Reset form data to original station data
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
    setErrors({});
    setIsEditing(false);
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

  const getStatusBadgeVariant = status => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'INACTIVE':
        return 'secondary';
      case 'MAINTENANCE':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = status => {
    const statusObj = STATION_STATUS.find(s => s.value === status);
    return statusObj ? t(statusObj.labelKey) : status;
  };

  const formatDate = dateString => {
    if (!dateString) return t('vehicle.table.na');
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return t('vehicle.table.na');
    try {
      return new Intl.DateTimeFormat(i18n.language || 'en', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (_) {
      return date.toLocaleString();
    }
  };

  if (!station) return null;

  return (
    <Dialog open={open} onOpenChange={loading ? undefined : onOpenChange}>
      <DialogContent className='w-[95vw] max-w-[800px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{t('station.details.title')}</DialogTitle>
          <DialogDescription>
            {t('station.details.description', { defaultValue: t('station.management.subtitle') })}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Basic Information */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>{t('station.details.info')}</h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>{t('station.form.name')}</Label>
                {isEditing ? (
                  <Input
                    id='name'
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    className={`w-full ${errors.name ? 'border-red-500' : ''}`}
                    disabled={loading}
                  />
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    {station.name}
                  </div>
                )}
                {errors.name && (
                  <p className='text-sm text-red-500'>{errors.name}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='status'>{t('station.form.status.label')}</Label>
                {isEditing ? (
                  <Select
                    value={formData.status}
                    onValueChange={value => handleInputChange('status', value)}
                    disabled={loading}
                  >
                    <SelectTrigger
                      className={errors.status ? 'border-red-500' : ''}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATION_STATUS.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {t(status.labelKey)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    <Badge variant={getStatusBadgeVariant(station.status)}>
                      {getStatusLabel(station.status)}
                    </Badge>
                  </div>
                )}
                {errors.status && (
                  <p className='text-sm text-red-500'>{errors.status}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='capacity'>{t('station.form.capacity')}</Label>
                {isEditing ? (
                  <Input
                    id='capacity'
                    type='number'
                    min='1'
                    value={formData.capacity}
                    onChange={e =>
                      handleInputChange('capacity', e.target.value)
                    }
                    className={`w-full ${
                      errors.capacity ? 'border-red-500' : ''
                    }`}
                    disabled={loading}
                  />
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    <Badge variant='outline'>{station.capacity} {t('station.management.slots')}</Badge>
                  </div>
                )}
                {errors.capacity && (
                  <p className='text-sm text-red-500'>{errors.capacity}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='contact'>{t('station.form.contact')}</Label>
                {isEditing ? (
                  <Input
                    id='contact'
                    value={formData.contact}
                    onChange={e => handleInputChange('contact', e.target.value)}
                    placeholder={t('station.form.placeholders.contact')}
                    className='w-full'
                    disabled={loading}
                  />
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    <div className='flex items-center'>
                      {station.contact?.includes('@') ? (
                        <MailIcon className='mr-2 h-4 w-4 text-muted-foreground' />
                      ) : (
                        <PhoneIcon className='mr-2 h-4 w-4 text-muted-foreground' />
                      )}
                      <span className='text-sm'>
                        {station.contact || t('station.management.noContact')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='location'>{t('station.form.location')}</Label>
              {isEditing ? (
                <>
                  <LocationPicker
                    value={formData.location}
                    onChange={location =>
                      handleInputChange('location', location)
                    }
                    label=''
                  />
                  {errors.location && (
                    <p className='text-sm text-red-500'>{errors.location}</p>
                  )}
                </>
              ) : (
                <div className='p-2 border rounded-md bg-muted/50 min-h-[80px] flex items-start'>
                  <LocationDisplay
                    location={station.location}
                    stationName={station.name}
                  />
                </div>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='address'>{t('station.form.address')}</Label>
              {isEditing ? (
                <Textarea
                  id='address'
                  value={formData.address}
                  onChange={e => handleInputChange('address', e.target.value)}
                  placeholder={t('station.form.placeholders.address')}
                  rows={3}
                  className={`w-full resize-none ${
                    errors.address ? 'border-red-500' : ''
                  }`}
                  disabled={loading}
                />
              ) : (
                <div className='p-2 border rounded-md bg-muted/50 min-h-[80px] flex items-start'>
                  {station.address || t('vehicle.table.na')}
                </div>
              )}
              {errors.address && (
                <p className='text-sm text-red-500'>{errors.address}</p>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>{t('station.details.statistics')}</h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='rounded-lg border p-4'>
                <div className='flex items-center'>
                  <CarIcon className='mr-2 h-5 w-5 text-muted-foreground' />
                  <div>
                    <div className='text-2xl font-bold'>
                      {station.vehicles?.length || 0}
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      {t('station.details.vehicles')}
                    </div>
                  </div>
                </div>
              </div>
              <div className='rounded-lg border p-4'>
                <div className='flex items-center'>
                  <UsersIcon className='mr-2 h-5 w-5 text-muted-foreground' />
                  <div>
                    <div className='text-2xl font-bold'>
                      {station.stationStaff?.length || 0}
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      {t('station.details.staff')}
                    </div>
                  </div>
                </div>
              </div>
              <div className='rounded-lg border p-4'>
                <div className='flex items-center'>
                  <MapPinIcon className='mr-2 h-5 w-5 text-muted-foreground' />
                  <div>
                    <div className='text-2xl font-bold'>
                      {station.capacity || 0}
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      {t('station.management.summary.capacity')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicles at Station */}
          {station.vehicles && station.vehicles.length > 0 && (
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>{t('station.details.vehiclesAtStation')}</h3>
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('station.details.vehicleTable.brandModel')}</TableHead>
                      <TableHead>{t('station.details.vehicleTable.type')}</TableHead>
                      <TableHead>{t('station.details.vehicleTable.licensePlate')}</TableHead>
                      <TableHead>{t('station.details.vehicleTable.status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {station.vehicles.map(vehicle => (
                      <TableRow key={vehicle.id}>
                        <TableCell>
                          <div>
                            <div className='font-medium'>
                              {vehicle.brand} {vehicle.model}
                            </div>
                            <div className='text-sm text-muted-foreground'>
                              {vehicle.year}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{vehicle.type}</TableCell>
                        <TableCell>{vehicle.licensePlate || t('vehicle.table.na')}</TableCell>
                        <TableCell>
                          <Badge variant='outline'>{vehicle.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Staff at Station */}
          {station.stationStaff && station.stationStaff.length > 0 && (
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>{t('station.details.staffAtStation')}</h3>
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('station.details.staffTable.name')}</TableHead>
                      <TableHead>{t('station.details.staffTable.email')}</TableHead>
                      <TableHead>{t('station.details.staffTable.phone')}</TableHead>
                      <TableHead>{t('station.details.staffTable.role')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {station.stationStaff.map(staff => (
                      <TableRow key={staff.id}>
                        <TableCell>
                          <div>
                            <div className='font-medium'>
                              {staff.user?.name || t('station.details.unknownStaff')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{staff.user?.email || t('vehicle.table.na')}</TableCell>
                        <TableCell>{staff.user?.phone || t('vehicle.table.na')}</TableCell>
                        <TableCell>
                          <Badge variant='outline'>
                            {staff.user?.role || t('vehicle.table.na')}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Station Timeline */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>{t('station.timeline.title')}</h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>{t('station.timeline.createdAt')}</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {formatDate(station.createdAt)}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>{t('station.timeline.updatedAt')}</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {formatDate(station.updatedAt)}
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
                {t('station.form.cancel')}
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className='w-full sm:w-auto'
              >
                {loading ? t('station.form.saving') : t('vehicle.actions.saveChanges')}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant='outline'
                onClick={() => onOpenChange(false)}
                className='w-full sm:w-auto'
              >
                {t('station.details.close')}
              </Button>
              <Button
                onClick={() => setIsEditing(true)}
                className='w-full sm:w-auto'
              >
                {t('station.details.edit')}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
