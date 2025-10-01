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

// Station status options
const STATION_STATUS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
];

export function StationDetails({
  open,
  onOpenChange,
  station,
  onUpdate,
  loading = false,
}) {
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
    return statusObj ? statusObj.label : status;
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

  if (!station) return null;

  return (
    <Dialog open={open} onOpenChange={loading ? undefined : onOpenChange}>
      <DialogContent className='w-[95vw] max-w-[800px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Station Details</DialogTitle>
          <DialogDescription>
            View and manage station information
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Basic Information */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Basic Information</h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Station Name</Label>
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
                <Label htmlFor='status'>Status</Label>
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
                          {status.label}
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
                <Label htmlFor='capacity'>Capacity</Label>
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
                    <Badge variant='outline'>{station.capacity} slots</Badge>
                  </div>
                )}
                {errors.capacity && (
                  <p className='text-sm text-red-500'>{errors.capacity}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='contact'>Contact Information</Label>
                {isEditing ? (
                  <Input
                    id='contact'
                    value={formData.contact}
                    onChange={e => handleInputChange('contact', e.target.value)}
                    placeholder='Phone number or email'
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
                        {station.contact || 'No contact information'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='location'>Location</Label>
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
              <Label htmlFor='address'>Full Address</Label>
              {isEditing ? (
                <Textarea
                  id='address'
                  value={formData.address}
                  onChange={e => handleInputChange('address', e.target.value)}
                  placeholder='Enter full address'
                  rows={3}
                  className={`w-full resize-none ${
                    errors.address ? 'border-red-500' : ''
                  }`}
                  disabled={loading}
                />
              ) : (
                <div className='p-2 border rounded-md bg-muted/50 min-h-[80px] flex items-start'>
                  {station.address || 'N/A'}
                </div>
              )}
              {errors.address && (
                <p className='text-sm text-red-500'>{errors.address}</p>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Statistics</h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='rounded-lg border p-4'>
                <div className='flex items-center'>
                  <CarIcon className='mr-2 h-5 w-5 text-muted-foreground' />
                  <div>
                    <div className='text-2xl font-bold'>
                      {station.vehicles?.length || 0}
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      Vehicles
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
                      Staff Members
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
                      Total Capacity
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicles at Station */}
          {station.vehicles && station.vehicles.length > 0 && (
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>Vehicles at Station</h3>
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Brand/Model</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>License Plate</TableHead>
                      <TableHead>Status</TableHead>
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
                        <TableCell>{vehicle.licensePlate || 'N/A'}</TableCell>
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
              <h3 className='text-lg font-semibold'>Staff at Station</h3>
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {station.stationStaff.map(staff => (
                      <TableRow key={staff.id}>
                        <TableCell>
                          <div>
                            <div className='font-medium'>
                              {staff.user?.name || 'Unknown Staff'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{staff.user?.email || 'N/A'}</TableCell>
                        <TableCell>{staff.user?.phone || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant='outline'>
                            {staff.user?.role || 'N/A'}
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
            <h3 className='text-lg font-semibold'>Station Timeline</h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>Created At</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {formatDate(station.createdAt)}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Last Updated</Label>
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
                Edit Station
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
