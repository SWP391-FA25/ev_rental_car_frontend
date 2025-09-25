import { useEffect, useState } from 'react';
import { Button } from '../../shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../shared/components/ui/dialog';
import { Badge } from '../../shared/components/ui/badge';
import { Input } from '../../shared/components/ui/input';
import { Label } from '../../shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../shared/components/ui/select';
import { Textarea } from '../../shared/components/ui/textarea';

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
    address: '',
    status: 'ACTIVE',
    capacity: '',
    availableSpots: '',
    operatingHours: '',
    location: '',
  });

  useEffect(() => {
    if (station) {
      setFormData({
        name: station.name || '',
        address: station.address || '',
        status: station.status || 'ACTIVE',
        capacity: station.capacity || '',
        availableSpots: station.availableSpots || '',
        operatingHours: station.operatingHours || '',
        location: station.location || '',
      });
    }
  }, [station]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (typeof onUpdate !== 'function') {
      console.error('onUpdate is not a function');
      return;
    }

    // Validate formData
    const requiredFields = ['name', 'address', 'status', 'capacity'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      alert(`Missing required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      const response = await onUpdate(station.id, formData);
      if (response.success) {
        console.log('Station updated successfully:', response.data);
        setIsEditing(false);
      } else {
        console.error('Failed to update station:', response.message);
        alert(response.message || 'Failed to update station');
      }
    } catch (err) {
      console.error('Error updating station:', err);
      alert('An error occurred while updating the station');
    }
  };

  const handleCancel = () => {
    if (station) {
      setFormData({
        name: station.name || '',
        address: station.address || '',
        status: station.status || 'ACTIVE',
        capacity: station.capacity || '',
        availableSpots: station.availableSpots || '',
        operatingHours: station.operatingHours || '',
        location: station.location || '',
      });
    }
    setIsEditing(false);
  };

  const getStatusBadgeVariant = status => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'INACTIVE':
        return 'outline';
      case 'MAINTENANCE':
        return 'destructive';
      default:
        return 'outline';
    }
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
                <Label htmlFor='name'>Name</Label>
                {isEditing ? (
                  <Input
                    id='name'
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    className='w-full'
                    disabled={loading}
                  />
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    {station.name}
                  </div>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='address'>Address</Label>
                {isEditing ? (
                  <Textarea
                    id='address'
                    value={formData.address}
                    onChange={e => handleInputChange('address', e.target.value)}
                    placeholder='Enter address'
                    rows={3}
                    className='w-full resize-none'
                    disabled={loading}
                  />
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[80px] flex items-start'>
                    {station.address || 'N/A'}
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
                      <SelectItem value='ACTIVE'>Active</SelectItem>
                      <SelectItem value='INACTIVE'>Inactive</SelectItem>
                      <SelectItem value='MAINTENANCE'>Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    <Badge variant={getStatusBadgeVariant(station.status)}>
                      {station.status}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Additional Information</h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='capacity'>Capacity</Label>
                {isEditing ? (
                  <Input
                    id='capacity'
                    value={formData.capacity}
                    onChange={e =>
                      handleInputChange('capacity', e.target.value)
                    }
                    className='w-full'
                    disabled={loading}
                  />
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    {station.capacity || 'N/A'}
                  </div>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='availableSpots'>Available Spots</Label>
                {isEditing ? (
                  <Input
                    id='availableSpots'
                    value={formData.availableSpots}
                    onChange={e =>
                      handleInputChange('availableSpots', e.target.value)
                    }
                    className='w-full'
                    disabled={loading}
                  />
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    {station.availableSpots || 'N/A'}
                  </div>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='operatingHours'>Operating Hours</Label>
                {isEditing ? (
                  <Input
                    id='operatingHours'
                    value={formData.operatingHours}
                    onChange={e =>
                      handleInputChange('operatingHours', e.target.value)
                    }
                    className='w-full'
                    disabled={loading}
                  />
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    {station.operatingHours || 'N/A'}
                  </div>
                )}
              </div>

              {/* <div className='space-y-2'>
                <Label htmlFor='location'>Location</Label>
                {isEditing ? (
                  <Input
                    id='location'
                    value={formData.location}
                    onChange={e =>
                      handleInputChange('location', e.target.value)
                    }
                    className='w-full'
                    disabled={loading}
                  />
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    {typeof station.location === 'object'
                      ? JSON.stringify(station.location)
                      : station.location || 'N/A'}
                  </div>
                )}
              </div> */}
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
