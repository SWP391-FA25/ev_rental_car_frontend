import {
  CarIcon,
  EyeIcon,
  FilterIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
  UsersIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { MoreVerticalIcon } from 'lucide-react';
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
import { SimpleAssignmentForm } from '../components/assignment/SimpleAssignmentForm';
import { StationDetails } from '../components/station/StationDetails';
import { StationForm } from '../components/station/StationForm';

// Station status options
const STATION_STATUS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
];

export default function StationManagement() {
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
      if (response.success) {
        setStations(response.data.stations || []);
      }
    } catch (error) {
      toast.error('Failed to load stations: ' + error.message);
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
      if (response.success) {
        toast.success('Station created successfully');
        setIsCreateDialogOpen(false);
        loadStations();
        return response.data.station;
      }
    } catch (error) {
      toast.error('Failed to create station: ' + error.message);
      throw error;
    }
  };

  const handleUpdateStation = async (stationId, updateData) => {
    try {
      const response = await apiClient.put(
        endpoints.stations.update(stationId),
        updateData
      );
      if (response.success) {
        toast.success('Station updated successfully');

        // Update the selected station with new data
        if (selectedStation && selectedStation.id === stationId) {
          setSelectedStation(response.data.station);
        }

        // Update the station in the stations list
        setStations(prev =>
          prev.map(station =>
            station.id === stationId ? response.data.station : station
          )
        );

        loadStations();
        return response.data.station;
      }
    } catch (error) {
      toast.error('Failed to update station: ' + error.message);
      throw error;
    }
  };

  const handleDeleteStation = async stationId => {
    try {
      const response = await apiClient.delete(
        endpoints.stations.delete(stationId)
      );
      if (response.success) {
        toast.success('Station deactivated successfully');
        setStations(prev => prev.filter(station => station.id !== stationId));
        loadStations();
      }
    } catch (error) {
      toast.error('Failed to deactivate station: ' + error.message);
    }
  };

  const openViewDialog = async station => {
    try {
      // Fetch detailed station data including staff
      const response = await apiClient.get(
        endpoints.stations.getById(station.id)
      );
      if (response.success) {
        setSelectedStation(response.data.station);
        setIsViewDialogOpen(true);
      } else {
        toast.error('Failed to load station details');
      }
    } catch (error) {
      toast.error('Failed to load station details: ' + error.message);
      console.error('Error loading station details:', error);
    }
  };

  const openAssignDialog = station => {
    setStationToAssign(station);
    setAssignDialogOpen(true);
  };

  const handleAssignmentSuccess = () => {
    setAssignDialogOpen(false);
    setStationToAssign(null);
    loadStations(); // Refresh stations to show updated staff count
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

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-lg'>Loading stations...</div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Station Management
          </h1>
          <p className='text-muted-foreground'>
            Manage charging stations and their information
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className='mr-2 h-4 w-4' />
              Add Station
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Add New Station</DialogTitle>
              <DialogDescription>
                Create a new charging station
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
            placeholder='Search stations...'
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
            {STATION_STATUS.map(status => (
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

      {/* Stations Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Vehicles</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='w-[70px]'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStations.map(station => (
              <TableRow key={station.id}>
                <TableCell>
                  <div>
                    <div className='font-medium'>{station.name}</div>
                    <div className='text-sm text-muted-foreground'>
                      {station.contact || 'No contact'}
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
                  <Badge variant='outline'>{station.capacity} slots</Badge>
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
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openAssignDialog(station)}
                      >
                        <UsersIcon className='mr-2 h-4 w-4' />
                        Assign Staff
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className='text-red-600'
                        onClick={() => {
                          setStationToDelete(station.id);
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
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>{stations.length}</div>
          <div className='text-sm text-muted-foreground'>Total Stations</div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {stations.filter(s => s.status === 'ACTIVE').length}
          </div>
          <div className='text-sm text-muted-foreground'>Active</div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {stations.filter(s => s.status === 'MAINTENANCE').length}
          </div>
          <div className='text-sm text-muted-foreground'>Maintenance</div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {stations.reduce(
              (total, station) => total + (station.capacity || 0),
              0
            )}
          </div>
          <div className='text-sm text-muted-foreground'>Total Capacity</div>
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
        title='Deactivate Station'
        description='Are you sure you want to delete this station? This will make it unavailable for new bookings.'
        onConfirm={() => {
          if (stationToDelete) {
            handleDeleteStation(stationToDelete);
            setStationToDelete(null);
          }
        }}
        confirmText='Delete'
        cancelText='Cancel'
        confirmVariant='destructive'
      />

      {/* Assign Staff Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Assign Staff to Station</DialogTitle>
            <DialogDescription>
              Assign a staff member to {stationToAssign?.name}
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
