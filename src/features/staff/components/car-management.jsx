import {
  EyeIcon,
  FilterIcon,
  ImageIcon,
  MoreVerticalIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

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
import { VehicleDetails } from '../../admin/components/vehicle/VehicleDetails';

export function CarManagement() {
  const { t } = useTranslation();

  // Vehicle status options
  const VEHICLE_STATUS = [
    { value: 'AVAILABLE', label: t('vehicle.status.available') },
    { value: 'RENTED', label: t('vehicle.status.rented') },
    { value: 'MAINTENANCE', label: t('vehicle.status.maintenance') },
    { value: 'OUT_OF_SERVICE', label: t('vehicle.status.outOfService') },
  ];

  // Vehicle types
  const VEHICLE_TYPES = [
    { value: 'SEDAN', label: t('vehicle.types.sedan') },
    { value: 'SUV', label: t('vehicle.types.suv') },
    { value: 'HATCHBACK', label: t('vehicle.types.hatchback') },
    { value: 'COUPE', label: t('vehicle.types.coupe') },
  ];

  // Fuel types
  const FUEL_TYPES = [
    { value: 'ELECTRIC', label: t('vehicle.fuel.electric') },
    { value: 'HYBRID', label: t('vehicle.fuel.hybrid') },
  ];

  const [vehicles, setVehicles] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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
      toast.error(t('vehicle.messages.loadFailed'));
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
        toast.success(t('vehicle.messages.updateSuccess'));

        if (selectedVehicle && selectedVehicle.id === vehicleId) {
          setSelectedVehicle(response.data.vehicle);
        }

        setVehicles(prev =>
          prev.map(vehicle =>
            vehicle.id === vehicleId ? response.data.vehicle : vehicle
          )
        );

        loadVehicles();
        return response.data.vehicle;
      }
    } catch (error) {
      toast.error(t('vehicle.messages.updateFailed'));
      throw error;
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleImageUpload = async vehicleId => {
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
      const response = await apiClient.post('/api/vehicles', formData);

      if (response.success) {
        toast.success(t('vehicle.messages.createSuccess'));
        setIsCreateDialogOpen(false);
        resetForm();
        if (response.data?.vehicle) {
          setVehicles(prev => [response.data.vehicle, ...prev]);
        }
        loadVehicles();
      } else {
        toast.error(t('vehicle.messages.createFailed'));
      }
    } catch (error) {
      toast.error(t('vehicle.messages.createFailed'));
    }
  };

  const handleHardDeleteVehicle = async vehicleId => {
    try {
      const response = await apiClient.delete(`/api/vehicles/${vehicleId}`);

      if (response.success) {
        toast.success(t('vehicle.messages.deleteSuccess'));
        setVehicles(prev => prev.filter(vehicle => vehicle.id !== vehicleId));
        setVehicleImages(prev => {
          const newImages = { ...prev };
          delete newImages[vehicleId];
          return newImages;
        });
        loadVehicles();
      } else {
        toast.error(t('vehicle.messages.deleteFailed'));
      }
    } catch (error) {
      toast.error(t('vehicle.messages.deleteFailed'));
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
        <div className='text-lg'>{t('vehicle.messages.loading')}</div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            {t('vehicle.title')}
          </h1>
          <p className='text-muted-foreground'>{t('vehicle.subtitle')}</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className='mr-2 h-4 w-4' />
              {t('vehicle.actions.add')}
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>{t('vehicle.dialogs.create.title')}</DialogTitle>
              <DialogDescription>
                {t('vehicle.dialogs.create.description')}
              </DialogDescription>
            </DialogHeader>
            <div className='grid grid-cols-2 gap-4 py-4'>
              <div className='space-y-2'>
                <Label htmlFor='stationId'>
                  {t('vehicle.fields.station')} *
                </Label>
                <Select
                  value={formData.stationId}
                  onValueChange={value =>
                    setFormData({ ...formData, stationId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('vehicle.fields.stationPlaceholder')}
                    />
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
                <Label htmlFor='type'>{t('vehicle.fields.type')} *</Label>
                <Select
                  value={formData.type}
                  onValueChange={value =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('vehicle.fields.typePlaceholder')}
                    />
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
                <Label htmlFor='brand'>{t('vehicle.fields.brand')} *</Label>
                <Input
                  id='brand'
                  value={formData.brand}
                  onChange={e =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                  placeholder={t('vehicle.fields.brandPlaceholder')}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='model'>{t('vehicle.fields.model')} *</Label>
                <Input
                  id='model'
                  value={formData.model}
                  onChange={e =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  placeholder={t('vehicle.fields.modelPlaceholder')}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='year'>{t('vehicle.fields.year')} *</Label>
                <Input
                  id='year'
                  type='number'
                  value={formData.year}
                  onChange={e =>
                    setFormData({ ...formData, year: e.target.value })
                  }
                  placeholder={t('vehicle.fields.yearPlaceholder')}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='color'>{t('vehicle.fields.color')}</Label>
                <Input
                  id='color'
                  value={formData.color}
                  onChange={e =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  placeholder={t('vehicle.fields.colorPlaceholder')}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='seats'>{t('vehicle.fields.seats')}</Label>
                <Input
                  id='seats'
                  type='number'
                  value={formData.seats}
                  onChange={e =>
                    setFormData({ ...formData, seats: e.target.value })
                  }
                  placeholder={t('vehicle.fields.seatsPlaceholder')}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='licensePlate'>
                  {t('vehicle.fields.licensePlate')}
                </Label>
                <Input
                  id='licensePlate'
                  value={formData.licensePlate}
                  onChange={e =>
                    setFormData({ ...formData, licensePlate: e.target.value })
                  }
                  placeholder={t('vehicle.fields.licensePlatePlaceholder')}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='batteryLevel'>
                  {t('vehicle.fields.batteryLevel')}
                </Label>
                <Input
                  id='batteryLevel'
                  type='number'
                  min='0'
                  max='100'
                  value={formData.batteryLevel}
                  onChange={e =>
                    setFormData({ ...formData, batteryLevel: e.target.value })
                  }
                  placeholder={t('vehicle.fields.batteryLevelPlaceholder')}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='fuelType'>
                  {t('vehicle.fields.fuelType')} *
                </Label>
                <Select
                  value={formData.fuelType}
                  onValueChange={value =>
                    setFormData({ ...formData, fuelType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('vehicle.fields.fuelTypePlaceholder')}
                    />
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

            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setIsCreateDialogOpen(false)}
              >
                {t('vehicle.actions.cancel')}
              </Button>
              <Button onClick={handleCreateVehicle}>
                {t('vehicle.actions.create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className='flex items-center space-x-4'>
        <div className='relative flex-1 max-w-sm'>
          <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder={t('vehicle.filters.searchPlaceholder')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline'>
              <FilterIcon className='mr-2 h-4 w-4' />
              {t('vehicle.filters.status')}:{' '}
              {filterStatus === 'all'
                ? t('vehicle.status.all')
                : getStatusLabel(filterStatus)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterStatus('all')}>
              {t('vehicle.status.all')}
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

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('vehicle.table.image')}</TableHead>
              <TableHead>{t('vehicle.table.brandModel')}</TableHead>
              <TableHead>{t('vehicle.table.type')}</TableHead>
              <TableHead>{t('vehicle.table.licensePlate')}</TableHead>
              <TableHead>{t('vehicle.table.station')}</TableHead>
              <TableHead>{t('vehicle.table.year')}</TableHead>
              <TableHead>{t('vehicle.table.fuelType')}</TableHead>
              <TableHead>{t('vehicle.table.battery')}</TableHead>
              <TableHead>{t('vehicle.table.status')}</TableHead>
              <TableHead className='w-[70px]'>
                {t('vehicle.table.actions')}
              </TableHead>
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
                  <TableCell>
                    {vehicle.licensePlate || t('vehicle.table.na')}
                  </TableCell>
                  <TableCell>
                    {vehicle.station?.name || t('vehicle.table.na')}
                  </TableCell>
                  <TableCell>{vehicle.year}</TableCell>
                  <TableCell>{getFuelTypeLabel(vehicle.fuelType)}</TableCell>
                  <TableCell>
                    {vehicle.fuelType === 'ELECTRIC' ||
                      vehicle.fuelType === 'HYBRID'
                      ? `${vehicle.batteryLevel}%`
                      : t('vehicle.table.na')}
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
                          {t('vehicle.actions.viewDetails')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='text-red-600'
                          onClick={() => {
                            setVehicleToDelete(vehicle.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <TrashIcon className='mr-2 h-4 w-4' />
                          {t('vehicle.actions.delete')}
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

      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>{vehicles.length}</div>
          <div className='text-sm text-muted-foreground'>
            {t('vehicle.stats.total')}{vehicles.length}
          </div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {vehicles.filter(v => v.status === 'AVAILABLE').length}
          </div>
          <div className='text-sm text-muted-foreground'>
            {t('vehicle.stats.available')}
          </div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {vehicles.filter(v => v.status === 'RENTED').length}
          </div>
          <div className='text-sm text-muted-foreground'>
            {t('vehicle.stats.rented')}
          </div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {vehicles.filter(v => v.fuelType === 'ELECTRIC').length}
          </div>
          <div className='text-sm text-muted-foreground'>
            {t('vehicle.stats.electric')}
          </div>
        </div>
      </div>

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
        title={t('vehicle.dialogs.delete.title')}
        description={t('vehicle.dialogs.delete.description')}
        onConfirm={() => {
          if (vehicleToDelete) {
            handleHardDeleteVehicle(vehicleToDelete);
            setVehicleToDelete(null);
          }
        }}
        confirmText={t('vehicle.actions.delete')}
        cancelText={t('vehicle.actions.cancel')}
        confirmVariant='destructive'
      />
    </div>
  );
}