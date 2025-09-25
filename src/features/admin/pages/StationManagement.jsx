import { FilterIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

import { MoreVerticalIcon } from 'lucide-react';
import { Badge } from '../../shared/components/ui/badge';
import { Button } from '../../shared/components/ui/button';
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
import { StationDetails } from '../components/StationDetails';
import { StationForm } from '../components/StationForm';
import { useApi } from '../../shared/hooks/useApi';
import { endpoints } from '../../shared/lib/endpoints';

export default function StationManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedStation, setSelectedStation] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [stations, setStations] = useState([]);
  const { get, post, put, del, loading, error } = useApi();

  // Fetch stations from API
  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const response = await get(endpoints.stations.getAll());
      if (response.success) {
        setStations(response.data.stations);
      }
    } catch (err) {
      console.error('Error fetching stations:', err);
    }
  };

  const filteredStations = stations.filter(station => {
    const matchesSearch =
      station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      station.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = status => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'MAINTENANCE':
        return 'secondary';
      case 'INACTIVE':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleViewDetails = station => {
    setSelectedStation(station);
    setIsEditing(false);
    setOpen(true);
  };

  const handleEditStation = station => {
    setSelectedStation(station);
    setIsEditing(true);
    setOpen(true);
  };

  const handleAddStation = () => {
    setSelectedStation(null);
    setIsEditing(true);
    setOpen(true);
  };

  const handleSaveStation = async data => {
    try {
      if (selectedStation && selectedStation.id) {
        // Update existing station
        const response = await put(
          endpoints.stations.update(selectedStation.id),
          data
        );
        if (response.success) {
          fetchStations(); // Refresh the list
          setOpen(false);
        }
      } else {
        // Create new station
        const response = await post(endpoints.stations.create(), data);
        if (response.success) {
          fetchStations(); // Refresh the list
          setOpen(false);
        }
      }
    } catch (err) {
      console.error('Error saving station:', err);
    }
  };

  const handleDeactivateStation = async stationId => {
    try {
      const response = await post(endpoints.stations.softDelete(stationId));
      if (response.success) {
        fetchStations(); // Refresh the list
      } else {
        alert('Failed to deactivate station');
      }
    } catch (error) {
      console.error('Error deactivating station:', error);
    }
  };

  const handleDeleteStation = async stationId => {
    try {
      const response = await del(endpoints.stations.delete(stationId));
      if (response.success) {
        fetchStations(); // Refresh the list
      } else {
        alert('Failed to delete station');
      }
    } catch (error) {
      console.error('Error deleting station:', error);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Station Management
          </h1>
          <p className='text-muted-foreground'>
            Manage charging stations and locations
          </p>
        </div>
        <Button onClick={handleAddStation}>
          <PlusIcon className='mr-2 h-4 w-4' />
          Add Station
        </Button>
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
              Status: {filterStatus === 'all' ? 'All' : filterStatus}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterStatus('all')}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('active')}>
              Active
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('maintenance')}>
              Maintenance
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('inactive')}>
              Inactive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stations Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Operating Hours</TableHead>
              <TableHead className='w-[70px]'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStations.map(station => (
              <TableRow key={station.id}>
                <TableCell className='font-medium'>{station.name}</TableCell>
                <TableCell>{station.address}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(station.status)}>
                    {station.status}
                  </Badge>
                </TableCell>
                <TableCell>{station.capacity}</TableCell>
                <TableCell>{station.availableSpots}</TableCell>
                <TableCell>{station.operatingHours}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' className='h-8 w-8 p-0'>
                        <MoreVerticalIcon className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem
                        onClick={() => handleViewDetails(station)}
                      >
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleEditStation(station)}
                      >
                        Edit Station
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className='text-red-600'
                        onClick={() => handleDeactivateStation(station.id)}
                      >
                        Deactivate Station
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className='text-red-600'
                        onClick={() => handleDeleteStation(station.id)}
                      >
                        Delete Station
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
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>{stations.length}</div>
          <div className='text-sm text-muted-foreground'>Total Stations</div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {stations.filter(s => s.status === 'ACTIVE').length}
          </div>
          <div className='text-sm text-muted-foreground'>Active Stations</div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {stations.reduce((sum, s) => sum + (s.availableSpots || 0), 0)}
          </div>
          <div className='text-sm text-muted-foreground'>Available Spots</div>
        </div>
      </div>

      {/* Station Details or Edit Form */}
      {selectedStation && (
        <div className='rounded-md border p-4'>
          {isEditing ? (
            <StationForm
              open={open}
              onOpenChange={setOpen}
              initialData={selectedStation}
              onSubmit={handleSaveStation}
              loading={loading}
            />
          ) : (
            <StationDetails
              open={open}
              onOpenChange={setOpen}
              station={selectedStation}
            />
          )}
        </div>
      )}
    </div>
  );
}
