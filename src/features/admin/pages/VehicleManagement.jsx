import {
  EyeIcon,
  FilterIcon,
  ImageIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { MoreVerticalIcon } from 'lucide-react';
import { Badge } from '../../shared/components/ui/badge';
import { Button } from '../../shared/components/ui/button';
import { ConfirmDialog } from '../../shared/components/ui/confirm-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../shared/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../shared/components/ui/dropdown-menu';
import { Input } from '../../shared/components/ui/input';
import { Label } from '../../shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../shared/components/ui/table';
import { apiClient } from '../../shared/lib/apiClient';
import { VehicleDetails } from '../components/vehicle/VehicleDetails';

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

export default function VehicleManagement() {
  const [vehicles, setVehicles] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [vehicleImages, setVehicleImages] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  // Form state
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
  });

  // Load vehicles and stations
  useEffect(() => {
    loadVehicles();
    loadStations();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/vehicles');
      if (response.success) {
        const vehiclesData = response.data.vehicles || [];
        setVehicles(vehiclesData);

        // Load images for each vehicle
        const imagesPromises = vehiclesData.map(async vehicle => {
          try {
            const imageResponse = await apiClient.get(
              `/api/vehicles/${vehicle.id}/images`
            );
            if (imageResponse.success) {
              return {
                vehicleId: vehicle.id,
                images: imageResponse.data.images || [],
              };
            }
          } catch (error) {
            console.error(
              `Failed to load images for vehicle ${vehicle.id}:`,
              error
            );
          }
          return { vehicleId: vehicle.id, images: [] };
        });

        const imagesResults = await Promise.all(imagesPromises);
        const imagesMap = {};
        imagesResults.forEach(result => {
          imagesMap[result.vehicleId] = result.images;
        });
        setVehicleImages(imagesMap);
      }
    } catch (error) {
      toast.error('Failed to load vehicles: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStations = async () => {
    try {
      const response = await apiClient.get('/api/stations');
      if (response.success) {
        setStations(response.data.stations || []);
      }
    } catch (error) {
      console.error('Failed to load stations:', error);
    }
  };

  const handleUpdateVehicle = async (vehicleId, updateData) => {
    try {
      setUpdateLoading(true);
      const response = await apiClient.put(
        `/api/vehicles/${vehicleId}`,
        updateData
      );
      if (response.success) {
        toast.success('Vehicle updated successfully');

        // Update the selected vehicle with new data
        if (selectedVehicle && selectedVehicle.id === vehicleId) {
          setSelectedVehicle(response.data.vehicle);
        }

        // Update the vehicle in the vehicles list
        setVehicles(prev =>
          prev.map(vehicle =>
            vehicle.id === vehicleId ? response.data.vehicle : vehicle
          )
        );

        // Reload to ensure consistency
        loadVehicles();

        return response.data.vehicle;
      }
    } catch (error) {
      toast.error('Failed to update vehicle: ' + error.message);
      throw error;
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleImageUpload = async vehicleId => {
    // Reload images for specific vehicle
    try {
      const imageResponse = await apiClient.get(
        `/api/vehicles/${vehicleId}/images`
      );
      if (imageResponse.success) {
        setVehicleImages(prev => ({
          ...prev,
          [vehicleId]: imageResponse.data.images || [],
        }));
      }
    } catch (error) {
      console.error(`Failed to reload images for vehicle ${vehicleId}:`, error);
    }
  };

  const handleCreateVehicle = async () => {
    try {
      console.log('Creating vehicle:', formData);
      const response = await apiClient.post('/api/vehicles', formData);
      console.log('Create vehicle response:', response);

      if (response.success) {
        toast.success('Vehicle created successfully');
        setIsCreateDialogOpen(false);
        resetForm();
        // Add to local state immediately for better UX
        if (response.data?.vehicle) {
          setVehicles(prev => [response.data.vehicle, ...prev]);
        }
        // Reload to ensure consistency
        loadVehicles();
      } else {
        toast.error(
          'Failed to create vehicle: ' + (response.message || 'Unknown error')
        );
      }
    } catch (error) {
      console.error('Create vehicle error:', error);
      toast.error('Failed to create vehicle: ' + error.message);
    }
  };

  const handleHardDeleteVehicle = async vehicleId => {
    try {
      console.log('Hard deleting vehicle:', vehicleId);
      const response = await apiClient.delete(`/api/vehicles/${vehicleId}`);
      console.log('Hard delete response:', response);

      if (response.success) {
        toast.success('Vehicle permanently deleted');
        // Remove from local state immediately for better UX
        setVehicles(prev => prev.filter(vehicle => vehicle.id !== vehicleId));
        // Also remove from vehicleImages
        setVehicleImages(prev => {
          const newImages = { ...prev };
          delete newImages[vehicleId];
          return newImages;
        });
        // Reload to ensure consistency
        loadVehicles();
      } else {
        toast.error(
          'Failed to delete vehicle: ' + (response.message || 'Unknown error')
        );
      }
    } catch (error) {
      console.error('Hard delete error:', error);
      toast.error('Failed to delete vehicle: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
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
    });
    setSelectedVehicle(null);
  };

  const openViewDialog = vehicle => {
    setSelectedVehicle(vehicle);
    setIsViewDialogOpen(true);
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch =
      vehicle.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.station?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      vehicle.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

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

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-lg'>Loading vehicles...</div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Vehicle Management
          </h1>
          <p className='text-muted-foreground'>
            Manage fleet vehicles and their information
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className='mr-2 h-4 w-4' />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Add New Vehicle</DialogTitle>
              <DialogDescription>
                Create a new vehicle in the fleet
              </DialogDescription>
            </DialogHeader>
            <div className='grid grid-cols-2 gap-4 py-4'>
              <div className='space-y-2'>
                <Label htmlFor='stationId'>Station *</Label>
                <Select
                  value={formData.stationId}
                  onValueChange={value =>
                    setFormData({ ...formData, stationId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select station' />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.map(station => (
                      <SelectItem key={station.id} value={station.id}>
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='type'>Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={value =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select type' />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='brand'>Brand *</Label>
                <Input
                  id='brand'
                  value={formData.brand}
                  onChange={e =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                  placeholder='e.g., Tesla'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='model'>Model *</Label>
                <Input
                  id='model'
                  value={formData.model}
                  onChange={e =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  placeholder='e.g., Model 3'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='year'>Year *</Label>
                <Input
                  id='year'
                  type='number'
                  value={formData.year}
                  onChange={e =>
                    setFormData({ ...formData, year: e.target.value })
                  }
                  placeholder='2024'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='color'>Color</Label>
                <Input
                  id='color'
                  value={formData.color}
                  onChange={e =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  placeholder='e.g., White'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='seats'>Seats</Label>
                <Input
                  id='seats'
                  type='number'
                  value={formData.seats}
                  onChange={e =>
                    setFormData({ ...formData, seats: e.target.value })
                  }
                  placeholder='5'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='licensePlate'>License Plate</Label>
                <Input
                  id='licensePlate'
                  value={formData.licensePlate}
                  onChange={e =>
                    setFormData({ ...formData, licensePlate: e.target.value })
                  }
                  placeholder='ABC-123'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='batteryLevel'>Battery Level (%)</Label>
                <Input
                  id='batteryLevel'
                  type='number'
                  min='0'
                  max='100'
                  value={formData.batteryLevel}
                  onChange={e =>
                    setFormData({ ...formData, batteryLevel: e.target.value })
                  }
                  placeholder='85'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='fuelType'>Fuel Type *</Label>
                <Select
                  value={formData.fuelType}
                  onValueChange={value =>
                    setFormData({ ...formData, fuelType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select fuel type' />
                  </SelectTrigger>
                  <SelectContent>
                    {FUEL_TYPES.map(fuel => (
                      <SelectItem key={fuel.value} value={fuel.value}>
                        {fuel.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='status'>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={value =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_STATUS.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateVehicle}>Create Vehicle</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className='flex items-center space-x-4'>
        <div className='relative flex-1 max-w-sm'>
          <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Search vehicles...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline'>
              <FilterIcon className='mr-2 h-4 w-4' />
              Status:{' '}
              {filterStatus === 'all' ? 'All' : getStatusLabel(filterStatus)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterStatus('all')}>
              All
            </DropdownMenuItem>
            {VEHICLE_STATUS.map(status => (
              <DropdownMenuItem
                key={status.value}
                onClick={() => setFilterStatus(status.value.toLowerCase())}
              >
                {status.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Vehicles Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Brand/Model</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>License Plate</TableHead>
              <TableHead>Station</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Fuel Type</TableHead>
              <TableHead>Battery</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='w-[70px]'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVehicles.map(vehicle => {
              const images = vehicleImages[vehicle.id] || [];
              const firstImage = images[0];

              return (
                <TableRow key={vehicle.id}>
                  <TableCell>
                    {firstImage ? (
                      <div className='relative w-16 h-12'>
                        <img
                          src={firstImage.thumbnailUrl || firstImage.url}
                          alt={vehicle.brand + ' ' + vehicle.model}
                          className='w-full h-full object-cover rounded border'
                        />
                        {images.length > 1 && (
                          <div className='absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                            +{images.length - 1}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className='w-16 h-12 bg-muted rounded border flex items-center justify-center'>
                        <ImageIcon className='h-6 w-6 text-muted-foreground' />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className='font-medium'>
                        {vehicle.brand} {vehicle.model}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        {vehicle.color}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeLabel(vehicle.type)}</TableCell>
                  <TableCell>{vehicle.licensePlate || 'N/A'}</TableCell>
                  <TableCell>{vehicle.station?.name || 'N/A'}</TableCell>
                  <TableCell>{vehicle.year}</TableCell>
                  <TableCell>{getFuelTypeLabel(vehicle.fuelType)}</TableCell>
                  <TableCell>
                    {vehicle.fuelType === 'ELECTRIC' ||
                    vehicle.fuelType === 'HYBRID'
                      ? `${vehicle.batteryLevel}%`
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(vehicle.status)}>
                      {getStatusLabel(vehicle.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                          <MoreVerticalIcon className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          onClick={() => openViewDialog(vehicle)}
                        >
                          <EyeIcon className='mr-2 h-4 w-4' />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='text-red-600'
                          onClick={() => {
                            setVehicleToDelete(vehicle.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <TrashIcon className='mr-2 h-4 w-4' />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Summary Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>{vehicles.length}</div>
          <div className='text-sm text-muted-foreground'>Total Vehicles</div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {vehicles.filter(v => v.status === 'AVAILABLE').length}
          </div>
          <div className='text-sm text-muted-foreground'>Available</div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {vehicles.filter(v => v.status === 'RENTED').length}
          </div>
          <div className='text-sm text-muted-foreground'>Rented</div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {vehicles.filter(v => v.fuelType === 'ELECTRIC').length}
          </div>
          <div className='text-sm text-muted-foreground'>Electric Vehicles</div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
            <DialogDescription>Update vehicle information</DialogDescription>
          </DialogHeader>
          <div className='grid grid-cols-2 gap-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='edit-stationId'>Station</Label>
              <Select
                value={formData.stationId}
                onValueChange={value =>
                  setFormData({ ...formData, stationId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select station' />
                </SelectTrigger>
                <SelectContent>
                  {stations.map(station => (
                    <SelectItem key={station.id} value={station.id}>
                      {station.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-type'>Type</Label>
              <Select
                value={formData.type}
                onValueChange={value =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select type' />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-brand'>Brand</Label>
              <Input
                id='edit-brand'
                value={formData.brand}
                onChange={e =>
                  setFormData({ ...formData, brand: e.target.value })
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-model'>Model</Label>
              <Input
                id='edit-model'
                value={formData.model}
                onChange={e =>
                  setFormData({ ...formData, model: e.target.value })
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-year'>Year</Label>
              <Input
                id='edit-year'
                type='number'
                value={formData.year}
                onChange={e =>
                  setFormData({ ...formData, year: e.target.value })
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-color'>Color</Label>
              <Input
                id='edit-color'
                value={formData.color}
                onChange={e =>
                  setFormData({ ...formData, color: e.target.value })
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-seats'>Seats</Label>
              <Input
                id='edit-seats'
                type='number'
                value={formData.seats}
                onChange={e =>
                  setFormData({ ...formData, seats: e.target.value })
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-licensePlate'>License Plate</Label>
              <Input
                id='edit-licensePlate'
                value={formData.licensePlate}
                onChange={e =>
                  setFormData({ ...formData, licensePlate: e.target.value })
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-batteryLevel'>Battery Level (%)</Label>
              <Input
                id='edit-batteryLevel'
                type='number'
                min='0'
                max='100'
                value={formData.batteryLevel}
                onChange={e =>
                  setFormData({ ...formData, batteryLevel: e.target.value })
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-fuelType'>Fuel Type</Label>
              <Select
                value={formData.fuelType}
                onValueChange={value =>
                  setFormData({ ...formData, fuelType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select fuel type' />
                </SelectTrigger>
                <SelectContent>
                  {FUEL_TYPES.map(fuel => (
                    <SelectItem key={fuel.value} value={fuel.value}>
                      {fuel.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-status'>Status</Label>
              <Select
                value={formData.status}
                onValueChange={value =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select status' />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_STATUS.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateVehicle}>Update Vehicle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vehicle Details Dialog */}
      <VehicleDetails
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        vehicle={selectedVehicle}
        onUpdate={handleUpdateVehicle}
        onImageUpload={handleImageUpload}
        loading={updateLoading}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title='Delete Vehicle'
        description='Are you sure you want to permanently delete this vehicle? This action cannot be undone and will delete all associated images.'
        onConfirm={() => {
          if (vehicleToDelete) {
            handleHardDeleteVehicle(vehicleToDelete);
            setVehicleToDelete(null);
          }
        }}
        confirmText='Delete'
        cancelText='Cancel'
        confirmVariant='destructive'
      />
    </div>
  );
}
