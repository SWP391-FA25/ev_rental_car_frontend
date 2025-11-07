import {
  CarIcon,
  EyeIcon,
  FilterIcon,
  MoreVerticalIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
  UsersIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '../../shared/lib/toast';

import { SimpleAssignmentForm } from '../../admin/components/assignment/SimpleAssignmentForm';
import { StationDetails } from '../../admin/components/station/StationDetails';
import { StationForm } from '../../admin/components/station/StationForm';
import { LocationDisplay } from '../../shared/components/LocationDisplay';
import { Badge } from '../../shared/components/ui/badge';
import { Button } from '../../shared/components/ui/button';
import { ConfirmDialog } from '../../shared/components/ui/confirm-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../shared/components/ui/table';
import { apiClient } from '../../shared/lib/apiClient';
import { endpoints } from '../../shared/lib/endpoints';

// Station status options
const STATION_STATUS = [
  { value: 'ACTIVE', labelKey: 'station.form.status.active' },
  { value: 'INACTIVE', labelKey: 'station.form.status.inactive' },
  { value: 'PENDING', labelKey: 'station.form.status.pending' },
  { value: 'MAINTENANCE', labelKey: 'station.form.status.maintenance' },
];

export default function StationManagement() {
  const { t } = useTranslation();

  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stationToDelete, setStationToDelete] = useState(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [stationToAssign, setStationToAssign] = useState(null);

  // Load stations
  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.stations.getAll());
      console.debug('[staff] loadStations response:', response);
      if (response && response.success) {
        setStations(response.data.stations || []);
      } else {
        console.warn(
          '[staff] loadStations: unexpected response shape',
          response
        );
      }
    } catch (error) {
      console.error('[staff] loadStations error:', error);
      toast.error(
        t('station.management.messages.loadFailed') +
          ': ' +
          (error?.message || error)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStation = async stationData => {
    try {
      const response = await apiClient.post(
        endpoints.stations.create(),
        stationData
      );
      console.debug('[staff] createStation response:', response);
      if (response && response.success) {
        toast.success(t('station.management.messages.createSuccess'));
        setIsCreateDialogOpen(false);
        loadStations();
        return response.data.station;
      }
    } catch (error) {
      console.error('[staff] createStation error:', error);
      toast.error(
        t('station.management.messages.createFailed') +
          ': ' +
          (error?.message || error)
      );
      throw error;
    }
  };

  const handleUpdateStation = async (stationId, updateData) => {
    try {
      const response = await apiClient.put(
        endpoints.stations.update(stationId),
        updateData
      );
      console.debug('[staff] updateStation response:', stationId, response);
      if (response && response.success) {
        toast.success(t('station.management.messages.updateSuccess'));

        if (selectedStation && selectedStation.id === stationId) {
          setSelectedStation(response.data.station);
        }

        setStations(prev =>
          prev.map(station =>
            station.id === stationId ? response.data.station : station
          )
        );

        loadStations();
        return response.data.station;
      }
    } catch (error) {
      console.error('[staff] updateStation error:', error);
      toast.error(
        t('station.management.messages.updateFailed') +
          ': ' +
          (error?.message || error)
      );
      throw error;
    }
  };

  const handleDeleteStation = async stationId => {
    try {
      const response = await apiClient.delete(
        endpoints.stations.delete(stationId)
      );
      console.debug('[staff] deleteStation response:', stationId, response);
      if (response && response.success) {
        toast.success(t('station.management.messages.deleteSuccess'));
        setStations(prev => prev.filter(station => station.id !== stationId));
        loadStations();
      }
    } catch (error) {
      console.error('[staff] deleteStation error:', error);
      toast.error(
        t('station.management.messages.deleteFailed') +
          ': ' +
          (error?.message || error)
      );
    }
  };

  const openViewDialog = async station => {
    try {
      const response = await apiClient.get(
        endpoints.stations.getById(station.id)
      );
      console.debug('[staff] getStationById response:', station.id, response);
      if (response && response.success) {
        setSelectedStation(response.data.station);
        setIsViewDialogOpen(true);
      } else {
        console.warn('[staff] getStationById unexpected response', response);
        toast.error(t('station.management.messages.loadFailed'));
      }
    } catch (error) {
      console.error('[staff] getStationById error:', error);
      toast.error(
        t('station.management.messages.loadFailed') +
          ': ' +
          (error?.message || error)
      );
    }
  };

  const openAssignDialog = station => {
    setStationToAssign(station);
    setAssignDialogOpen(true);
  };

  const handleAssignmentSuccess = () => {
    setAssignDialogOpen(false);
    setStationToAssign(null);
    loadStations();
  };

  const filteredStations = stations.filter(station => {
    const matchesSearch =
      station.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      station.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = status => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'INACTIVE':
        return 'secondary';
      case 'PENDING':
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

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-lg'>
          {t('station.management.messages.loading')}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            {t('station.management.title')}
          </h1>
          <p className='text-muted-foreground'>
            {t('station.management.subtitle')}
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className='mr-2 h-4 w-4' />
              {t('station.management.add')}
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>{t('station.management.addNew')}</DialogTitle>
              <DialogDescription>
                {t('station.management.addDescription')}
              </DialogDescription>
            </DialogHeader>
            <StationForm
              onSubmit={handleCreateStation}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className='flex items-center space-x-4'>
        <div className='relative flex-1 max-w-sm'>
          <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder={t('station.management.filters.search')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline'>
              <FilterIcon className='mr-2 h-4 w-4' />
              {t('station.management.filters.status')}:{' '}
              {filterStatus === 'all'
                ? t('station.management.filters.all')
                : getStatusLabel(filterStatus)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterStatus('all')}>
              {t('station.management.filters.all')}
            </DropdownMenuItem>
            {STATION_STATUS.map(status => (
              <DropdownMenuItem
                key={status.value}
                onClick={() => setFilterStatus(status.value.toLowerCase())}
              >
                {t(status.labelKey)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stations Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('station.management.table.name')}</TableHead>
              <TableHead>{t('station.management.table.location')}</TableHead>
              <TableHead>{t('station.management.table.address')}</TableHead>
              <TableHead>{t('station.management.table.capacity')}</TableHead>
              <TableHead>{t('station.management.table.vehicles')}</TableHead>
              <TableHead>{t('station.management.table.staff')}</TableHead>
              <TableHead>{t('station.management.table.status')}</TableHead>
              <TableHead className='w-[70px]'>
                {t('station.management.table.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStations.map(station => (
              <TableRow key={station.id}>
                <TableCell>
                  <div>
                    <div className='font-medium'>{station.name}</div>
                    <div className='text-sm text-muted-foreground'>
                      {station.contact || t('station.management.noContact')}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <LocationDisplay
                    location={station.location}
                    stationName={station.name}
                  />
                </TableCell>
                <TableCell className='max-w-xs truncate'>
                  {station.address}
                </TableCell>
                <TableCell>
                  <Badge variant='outline'>
                    {station.capacity} {t('station.management.slots')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className='flex items-center'>
                    <CarIcon className='mr-2 h-4 w-4 text-muted-foreground' />
                    {station.vehicles?.length || 0}
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex items-center'>
                    <UsersIcon className='mr-2 h-4 w-4 text-muted-foreground' />
                    {station.stationStaff?.length || 0}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(station.status)}>
                    {getStatusLabel(station.status)}
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
                      <DropdownMenuItem onClick={() => openViewDialog(station)}>
                        <EyeIcon className='mr-2 h-4 w-4' />
                        {t('station.management.actions.view')}
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className='text-red-600'
                        onClick={() => {
                          setStationToDelete(station.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <TrashIcon className='mr-2 h-4 w-4' />
                        {t('station.management.actions.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>{stations.length}</div>
          <div className='text-sm text-muted-foreground'>
            {t('station.management.slots')}
          </div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {stations.filter(s => s.status === 'ACTIVE').length}
          </div>
          <div className='text-sm text-muted-foreground'>
            {t('station.form.status.active')}
          </div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {stations.filter(s => s.status === 'MAINTENANCE').length}
          </div>
          <div className='text-sm text-muted-foreground'>
            {t('station.form.status.maintenance')}
          </div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {stations.reduce(
              (total, station) => total + (station.capacity || 0),
              0
            )}
          </div>
          <div className='text-sm text-muted-foreground'>
            {t('station.management.summary.capacity')}
          </div>
        </div>
      </div>

      {/* Station Details Dialog */}
      <StationDetails
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        station={selectedStation}
        onUpdate={handleUpdateStation}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t('station.management.confirmDelete.title')}
        description={t('station.management.confirmDelete.description')}
        onConfirm={() => {
          if (stationToDelete) {
            handleDeleteStation(stationToDelete);
            setStationToDelete(null);
          }
        }}
        confirmText={t('station.management.confirmDelete.confirm')}
        cancelText={t('station.management.confirmDelete.cancel')}
        confirmVariant='destructive'
      />

      {/* Assign Staff Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>
              {t('station.management.assignDialog.title')}
            </DialogTitle>
            <DialogDescription>
              {t('station.management.assignDialog.description', {
                stationName: stationToAssign?.name,
              })}
            </DialogDescription>
          </DialogHeader>
          <SimpleAssignmentForm
            stationId={stationToAssign?.id}
            onSuccess={handleAssignmentSuccess}
            onCancel={() => setAssignDialogOpen(false)}
            loading={loading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
