import { ImageIcon, TrashIcon, UploadIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

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
import { apiClient } from '../../../shared/lib/apiClient';
import { formatCurrency } from '../../../shared/lib/utils';
import { Badge } from './../../../shared/components/ui/badge';

// Vehicle status options
const VEHICLE_STATUS = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'RENTED', label: 'Rented' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'OUT_OF_SERVICE', label: 'Out of Service' },
];

// Vehicle types
const VEHICLE_TYPES = [
  { value: 'SEDAN', label: 'Sedan' },
  { value: 'SUV', label: 'SUV' },
  { value: 'HATCHBACK', label: 'Hatchback' },
  { value: 'COUPE', label: 'Coupe' },
];

// Fuel types
const FUEL_TYPES = [
  { value: 'ELECTRIC', label: 'Electric' },
  { value: 'HYBRID', label: 'Hybrid' },
];

export function VehicleDetails({
  open,
  onOpenChange,
  vehicle,
  onUpdate,
  onImageUpload,
  loading = false,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [vehicleImages, setVehicleImages] = useState([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [formData, setFormData] = useState({
    stationId: '',
    type: '',
    brand: '',
    model: '',
    year: '',
    color: '',
    seats: '',
    licensePlate: '',
    batteryLevel: '',
    fuelType: '',
    status: 'AVAILABLE',
    // Pricing fields
    baseRate: '',
    hourlyRate: '',
    weeklyRate: '',
    monthlyRate: '',
    depositAmount: '',
    insuranceRate: '',
  });

  // Update formData when vehicle prop changes
  useEffect(() => {
    if (vehicle) {
      setFormData({
        stationId: vehicle.stationId || '',
        type: vehicle.type || '',
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        year: vehicle.year?.toString() || '',
        color: vehicle.color || '',
        seats: vehicle.seats?.toString() || '',
        licensePlate: vehicle.licensePlate || '',
        batteryLevel: vehicle.batteryLevel?.toString() || '',
        fuelType: vehicle.fuelType || '',
        status: vehicle.status || 'AVAILABLE',
        // Pricing fields
        baseRate: vehicle.pricing?.baseRate?.toString() || '',
        hourlyRate: vehicle.pricing?.hourlyRate?.toString() || '',
        weeklyRate: vehicle.pricing?.weeklyRate?.toString() || '',
        monthlyRate: vehicle.pricing?.monthlyRate?.toString() || '',
        depositAmount: vehicle.pricing?.depositAmount?.toString() || '',
        insuranceRate: vehicle.pricing?.insuranceRate?.toString() || '',
      });
      loadVehicleImages(vehicle.id);
    }
  }, [
    vehicle?.id,
    vehicle?.brand,
    vehicle?.model,
    vehicle?.status,
    vehicle?.updatedAt,
  ]);

  // Reset editing state when dialog closes
  useEffect(() => {
    if (!open) {
      setIsEditing(false);
    }
  }, [open]);

  const loadVehicleImages = async vehicleId => {
    try {
      const response = await apiClient.get(`/api/vehicles/${vehicleId}/images`);
      if (response.success) {
        setVehicleImages(response.data.images || []);
      }
    } catch (error) {
      console.error('Failed to load vehicle images:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const updatedVehicle = await onUpdate(vehicle.id, formData);
      setIsEditing(false);
      // Force re-render by updating formData with the returned vehicle data
      if (updatedVehicle) {
        setFormData({
          stationId: updatedVehicle.stationId || '',
          type: updatedVehicle.type || '',
          brand: updatedVehicle.brand || '',
          model: updatedVehicle.model || '',
          year: updatedVehicle.year?.toString() || '',
          color: updatedVehicle.color || '',
          seats: updatedVehicle.seats?.toString() || '',
          licensePlate: updatedVehicle.licensePlate || '',
          batteryLevel: updatedVehicle.batteryLevel?.toString() || '',
          fuelType: updatedVehicle.fuelType || '',
          status: updatedVehicle.status || 'AVAILABLE',
          // Pricing fields
          baseRate: updatedVehicle.pricing?.baseRate?.toString() || '',
          hourlyRate: updatedVehicle.pricing?.hourlyRate?.toString() || '',
          weeklyRate: updatedVehicle.pricing?.weeklyRate?.toString() || '',
          monthlyRate: updatedVehicle.pricing?.monthlyRate?.toString() || '',
          depositAmount:
            updatedVehicle.pricing?.depositAmount?.toString() || '',
          insuranceRate:
            updatedVehicle.pricing?.insuranceRate?.toString() || '',
        });
      }
    } catch (err) {
      console.error('Error updating vehicle:', err);
    }
  };

  const handleCancel = () => {
    if (vehicle) {
      setFormData({
        stationId: vehicle.stationId || '',
        type: vehicle.type || '',
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        year: vehicle.year?.toString() || '',
        color: vehicle.color || '',
        seats: vehicle.seats?.toString() || '',
        licensePlate: vehicle.licensePlate || '',
        batteryLevel: vehicle.batteryLevel?.toString() || '',
        fuelType: vehicle.fuelType || '',
        status: vehicle.status || 'AVAILABLE',
        // Pricing fields
        baseRate: vehicle.pricing?.baseRate?.toString() || '',
        hourlyRate: vehicle.pricing?.hourlyRate?.toString() || '',
        weeklyRate: vehicle.pricing?.weeklyRate?.toString() || '',
        monthlyRate: vehicle.pricing?.monthlyRate?.toString() || '',
        depositAmount: vehicle.pricing?.depositAmount?.toString() || '',
        insuranceRate: vehicle.pricing?.insuranceRate?.toString() || '',
      });
    }
    setIsEditing(false);
  };

  const handleImageUpload = async event => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      setImageLoading(true);
      const formData = new FormData();
      formData.append('images', file);

      const response = await apiClient.post(
        `/api/vehicles/${vehicle.id}/images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.success) {
        toast.success('Image uploaded successfully');
        loadVehicleImages(vehicle.id);
        // Notify parent component to refresh images
        if (onImageUpload) {
          onImageUpload(vehicle.id);
        }
      }
    } catch (error) {
      toast.error('Failed to upload image: ' + error.message);
      console.log(error.message);
    } finally {
      setImageLoading(false);
    }
  };

  const handleDeleteImage = async imageId => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const response = await apiClient.delete(
        `/api/vehicles/${vehicle.id}/images/${imageId}`
      );
      if (response.success) {
        toast.success('Image deleted successfully');
        loadVehicleImages(vehicle.id);
        // Notify parent component to refresh images
        if (onImageUpload) {
          onImageUpload(vehicle.id);
        }
      }
    } catch (error) {
      toast.error('Failed to delete image: ' + error.message);
    }
  };

  const getStatusBadgeVariant = status => {
    switch (status) {
      case 'AVAILABLE':
        return 'default';
      case 'RENTED':
        return 'secondary';
      case 'MAINTENANCE':
        return 'outline';
      case 'OUT_OF_SERVICE':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = status => {
    const statusObj = VEHICLE_STATUS.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  const getTypeLabel = type => {
    const typeObj = VEHICLE_TYPES.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const getFuelTypeLabel = fuelType => {
    const fuelObj = FUEL_TYPES.find(f => f.value === fuelType);
    return fuelObj ? fuelObj.label : fuelType;
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

  if (!vehicle) return null;

  return (
    <Dialog open={open} onOpenChange={loading ? undefined : onOpenChange}>
      <DialogContent className='w-[95vw] max-w-[1000px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Vehicle Details</DialogTitle>
          <DialogDescription>
            View and manage vehicle information and images
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Basic Information */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Basic Information</h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='brand'>Brand</Label>
                {isEditing ? (
                  <Input
                    id='brand'
                    value={formData.brand}
                    onChange={e => handleInputChange('brand', e.target.value)}
                    className='w-full'
                    disabled={loading}
                  />
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    {vehicle.brand}
                  </div>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='model'>Model</Label>
                {isEditing ? (
                  <Input
                    id='model'
                    value={formData.model}
                    onChange={e => handleInputChange('model', e.target.value)}
                    className='w-full'
                    disabled={loading}
                  />
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    {vehicle.model}
                  </div>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='type'>Type</Label>
                {isEditing ? (
                  <Select
                    value={formData.type}
                    onValueChange={value => handleInputChange('type', value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VEHICLE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    <Badge variant='default'>
                      {getTypeLabel(vehicle.type)}
                    </Badge>
                  </div>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='year'>Year</Label>
                {isEditing ? (
                  <Input
                    id='year'
                    type='number'
                    value={formData.year}
                    onChange={e => handleInputChange('year', e.target.value)}
                    className='w-full'
                    disabled={loading}
                  />
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    {vehicle.year}
                  </div>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='color'>Color</Label>
                {isEditing ? (
                  <Input
                    id='color'
                    value={formData.color}
                    onChange={e => handleInputChange('color', e.target.value)}
                    className='w-full'
                    disabled={loading}
                  />
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    {vehicle.color || 'N/A'}
                  </div>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='seats'>Seats</Label>
                {isEditing ? (
                  <Input
                    id='seats'
                    type='number'
                    value={formData.seats}
                    onChange={e => handleInputChange('seats', e.target.value)}
                    className='w-full'
                    disabled={loading}
                  />
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    {vehicle.seats}
                  </div>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='licensePlate'>License Plate</Label>
                {isEditing ? (
                  <Input
                    id='licensePlate'
                    value={formData.licensePlate}
                    onChange={e =>
                      handleInputChange('licensePlate', e.target.value)
                    }
                    className='w-full'
                    disabled={loading}
                  />
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    {vehicle.licensePlate || 'N/A'}
                  </div>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='fuelType'>Fuel Type</Label>
                {isEditing ? (
                  <Select
                    value={formData.fuelType}
                    onValueChange={value =>
                      handleInputChange('fuelType', value)
                    }
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FUEL_TYPES.map(fuel => (
                        <SelectItem key={fuel.value} value={fuel.value}>
                          {fuel.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    <Badge variant='outline'>
                      {getFuelTypeLabel(vehicle.fuelType)}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Technical Details</h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='batteryLevel'>Battery Level (%)</Label>
                {isEditing ? (
                  <Input
                    id='batteryLevel'
                    type='number'
                    min='0'
                    max='100'
                    value={formData.batteryLevel}
                    onChange={e =>
                      handleInputChange('batteryLevel', e.target.value)
                    }
                    className='w-full'
                    disabled={loading}
                  />
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    {vehicle.fuelType === 'ELECTRIC' ||
                    vehicle.fuelType === 'HYBRID'
                      ? `${vehicle.batteryLevel}%`
                      : 'N/A'}
                  </div>
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
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VEHICLE_STATUS.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    <Badge variant={getStatusBadgeVariant(vehicle.status)}>
                      {getStatusLabel(vehicle.status)}
                    </Badge>
                  </div>
                )}
              </div>

              <div className='space-y-2'>
                <Label>Station</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {vehicle.station?.name || 'N/A'}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Vehicle ID</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center font-mono text-sm'>
                  {vehicle.id}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Pricing Information</h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='baseRate'>Base Rate (Daily)</Label>
                {isEditing ? (
                  <Input
                    id='baseRate'
                    type='number'
                    min='0'
                    step='0.01'
                    value={formData.baseRate}
                    onChange={e =>
                      handleInputChange('baseRate', e.target.value)
                    }
                    className='w-full'
                    disabled={loading}
                  />
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    {vehicle.pricing?.baseRate
                      ? formatCurrency(vehicle.pricing.baseRate, 'VND')
                      : 'N/A'}
                  </div>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='hourlyRate'>Hourly Rate</Label>
                {isEditing ? (
                  <Input
                    id='hourlyRate'
                    type='number'
                    min='0'
                    step='0.01'
                    value={formData.hourlyRate}
                    onChange={e =>
                      handleInputChange('hourlyRate', e.target.value)
                    }
                    className='w-full'
                    disabled={loading}
                  />
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    {vehicle.pricing?.hourlyRate
                      ? formatCurrency(vehicle.pricing.hourlyRate, 'VND')
                      : 'N/A'}
                  </div>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='weeklyRate'>Weekly Rate</Label>
                {isEditing ? (
                  <Input
                    id='weeklyRate'
                    type='number'
                    min='0'
                    step='0.01'
                    value={formData.weeklyRate}
                    onChange={e =>
                      handleInputChange('weeklyRate', e.target.value)
                    }
                    className='w-full'
                    disabled={loading}
                  />
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    {vehicle.pricing?.weeklyRate
                      ? formatCurrency(vehicle.pricing.weeklyRate, 'VND')
                      : 'N/A'}
                  </div>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='monthlyRate'>Monthly Rate</Label>
                {isEditing ? (
                  <Input
                    id='monthlyRate'
                    type='number'
                    min='0'
                    step='0.01'
                    value={formData.monthlyRate}
                    onChange={e =>
                      handleInputChange('monthlyRate', e.target.value)
                    }
                    className='w-full'
                    disabled={loading}
                  />
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    {vehicle.pricing?.monthlyRate
                      ? formatCurrency(vehicle.pricing.monthlyRate, 'VND')
                      : 'N/A'}
                  </div>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='depositAmount'>Deposit Amount</Label>
                {isEditing ? (
                  <Input
                    id='depositAmount'
                    type='number'
                    min='0'
                    step='0.01'
                    value={formData.depositAmount}
                    onChange={e =>
                      handleInputChange('depositAmount', e.target.value)
                    }
                    className='w-full'
                    disabled={loading}
                  />
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    {vehicle.pricing?.depositAmount
                      ? formatCurrency(vehicle.pricing.depositAmount, 'VND')
                      : 'N/A'}
                  </div>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='insuranceRate'>Insurance Rate (%)</Label>
                {isEditing ? (
                  <Input
                    id='insuranceRate'
                    type='number'
                    min='0'
                    max='1'
                    step='0.01'
                    value={formData.insuranceRate}
                    onChange={e =>
                      handleInputChange('insuranceRate', e.target.value)
                    }
                    className='w-full'
                    disabled={loading}
                  />
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    {vehicle.pricing?.insuranceRate
                      ? `${(vehicle.pricing.insuranceRate * 100).toFixed(1)}%`
                      : 'N/A'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Vehicle Images */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold'>Vehicle Images</h3>
              {isEditing && (
                <div className='flex items-center gap-2'>
                  <input
                    type='file'
                    accept='image/*'
                    onChange={handleImageUpload}
                    className='hidden'
                    id='image-upload'
                    disabled={imageLoading}
                  />
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      document.getElementById('image-upload').click()
                    }
                    disabled={imageLoading}
                  >
                    <UploadIcon className='mr-2 h-4 w-4' />
                    {imageLoading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                </div>
              )}
            </div>

            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
              {vehicleImages.length > 0 ? (
                vehicleImages.map(image => (
                  <div key={image.id} className='relative group'>
                    <img
                      src={image.thumbnailUrl || image.url}
                      alt={image.fileName}
                      className='w-full h-32 object-cover rounded-lg border'
                    />
                    {isEditing && (
                      <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center'>
                        <Button
                          size='sm'
                          variant='destructive'
                          onClick={() => handleDeleteImage(image.id)}
                        >
                          <TrashIcon className='h-4 w-4' />
                        </Button>
                      </div>
                    )}
                    <div className='absolute top-2 left-2'>
                      <Badge variant='secondary' className='text-xs'>
                        {Math.round(image.size / 1024)}KB
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className='col-span-full text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg'>
                  <ImageIcon className='mx-auto h-12 w-12 mb-2' />
                  <p>No images available for this vehicle</p>
                  {!isEditing && (
                    <p className='text-sm'>
                      Click "Upload Image" to add photos
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Vehicle Timeline</h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>Created At</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {formatDate(vehicle.createdAt)}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Last Updated</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {formatDate(vehicle.updatedAt)}
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
                Edit Vehicle
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
