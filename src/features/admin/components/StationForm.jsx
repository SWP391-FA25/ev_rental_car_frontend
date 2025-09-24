import { useState, useEffect } from 'react';
import { Button } from '../../shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../shared/components/ui/dialog';
import { Input } from '../../shared/components/ui/input';
import { Label } from '../../shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../shared/components/ui/select';

export function StationForm({
  open,
  onOpenChange,
  onSubmit,
  loading = false,
  initialData = {},
}) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    setFormData({
      name: initialData.name || '',
      address: initialData.address || '',
      status: initialData.status || 'ACTIVE',
      capacity: initialData.capacity || 0,
      availableSpots: initialData.availableSpots || 0,
      chargingPorts: initialData.chargingPorts || 0,
      operatingHours: initialData.operatingHours || '',
    });
  }, [initialData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      setFormData({
        name: '',
        address: '',
        status: 'ACTIVE',
        capacity: 0,
        availableSpots: 0,
        chargingPorts: 0,
        operatingHours: '',
      });
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>
            {initialData.id ? 'Edit Station' : 'Add New Station'}
          </DialogTitle>
          <DialogDescription>
            {initialData.id
              ? 'Update station information. All fields marked with * are required.'
              : 'Create a new station. All fields marked with * are required.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='name' className='text-right'>
                Name *
              </Label>
              <Input
                id='name'
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                className='col-span-3'
                placeholder='Enter station name'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='address' className='text-right'>
                Address *
              </Label>
              <Input
                id='address'
                value={formData.address}
                onChange={e => handleInputChange('address', e.target.value)}
                className='col-span-3'
                placeholder='Enter station address'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='status' className='text-right'>
                Status *
              </Label>
              <Select
                value={formData.status}
                onValueChange={value => handleInputChange('status', value)}
              >
                <SelectTrigger className='col-span-3'>
                  <SelectValue placeholder='Select status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ACTIVE'>Active</SelectItem>
                  <SelectItem value='MAINTENANCE'>Maintenance</SelectItem>
                  <SelectItem value='INACTIVE'>Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='capacity' className='text-right'>
                Capacity *
              </Label>
              <Input
                id='capacity'
                type='number'
                value={formData.capacity}
                onChange={e => handleInputChange('capacity', e.target.value)}
                className='col-span-3'
                placeholder='Enter station capacity'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='availableSpots' className='text-right'>
                Available Spots *
              </Label>
              <Input
                id='availableSpots'
                type='number'
                value={formData.availableSpots}
                onChange={e =>
                  handleInputChange('availableSpots', e.target.value)
                }
                className='col-span-3'
                placeholder='Enter available spots'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='chargingPorts' className='text-right'>
                Charging Ports *
              </Label>
              <Input
                id='chargingPorts'
                type='number'
                value={formData.chargingPorts}
                onChange={e =>
                  handleInputChange('chargingPorts', e.target.value)
                }
                className='col-span-3'
                placeholder='Enter number of charging ports'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='operatingHours' className='text-right'>
                Operating Hours
              </Label>
              <Input
                id='operatingHours'
                value={formData.operatingHours}
                onChange={e =>
                  handleInputChange('operatingHours', e.target.value)
                }
                className='col-span-3'
                placeholder='Enter operating hours'
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={loading}>
              {loading
                ? 'Saving...'
                : initialData.id
                ? 'Save Changes'
                : 'Create Station'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
