import { FilterIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../shared/components/ui/dialog';
import { Label } from '../../shared/components/ui/label';

// Mock data for stations
const mockStations = [
  {
    id: '1',
    name: 'Downtown Station',
    address: '123 Main St, New York, NY 10001',
    status: 'Active',
    capacity: 20,
    availableSpots: 12,
    staff: ['John Smith', 'Maria Garcia'],
    operatingHours: '24/7',
  },
  {
    id: '2',
    name: 'Airport Station',
    address: '456 Airport Rd, Queens, NY 11430',
    status: 'Active',
    capacity: 35,
    availableSpots: 22,
    staff: ['Sarah Johnson', 'David Kim'],
    operatingHours: '5:00 AM - 11:00 PM',
  },
  {
    id: '3',
    name: 'Mall Station',
    address: '789 Shopping Center Dr, Brooklyn, NY 11201',
    status: 'Maintenance',
    capacity: 15,
    availableSpots: 8,
    staff: ['Mike Chen'],
    operatingHours: '10:00 AM - 10:00 PM',
  },
];

export default function StationManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedStation, setSelectedStation] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [open, setOpen] = useState(false); // Added state for modal visibility
  const navigate = useNavigate();

  const filteredStations = mockStations.filter(station => {
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
      case 'Active':
        return 'default';
      case 'Maintenance':
        return 'secondary';
      case 'Inactive':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleViewDetails = station => {
    console.log('Viewing station:', station); // Debugging log
    setSelectedStation(station);
    setIsEditing(false);
    setOpen(true); // Ensure modal opens
  };

  const handleEditStation = station => {
    console.log('Editing station:', station); // Debugging log
    setSelectedStation(station);
    setIsEditing(true);
    setOpen(true); // Ensure modal opens
  };

  const handleManageStaff = station => {
    setSelectedStation(station);
    setIsEditing(false);
    setOpen(true);
  };

  const handleDeactivateStation = async stationId => {
    try {
      const response = await fetch(`/api/stations/${stationId}/deactivate`, {
        method: 'POST',
      });
      if (response.ok) {
        alert('Station deactivated successfully');
      } else {
        alert('Failed to deactivate station');
      }
    } catch (error) {
      console.error('Error deactivating station:', error);
    }
  };

  const renderManageStaff = station => (
    <div className='space-y-6'>
      <h1 className='text-3xl font-bold tracking-tight'>
        Manage Staff for {station.name}
      </h1>
      <p className='text-muted-foreground'>
        View and manage staff for this station.
      </p>
      {/* Add staff management functionality here */}
    </div>
  );

  const renderStationDetails = station => (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='w-[95vw] max-w-[800px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Station Details</DialogTitle>
          <DialogDescription>
            View and manage station information
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-6'>
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Basic Information</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Name</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {station.name}
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='address'>Address</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {station.address}
                </div>
              </div>
            </div>
          </div>
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Operational Details</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='status'>Status</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {station.status}
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='capacity'>Capacity</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {station.capacity}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

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
        <Button>
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
              <TableHead>Staff</TableHead>
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
                <TableCell>{station.staff.join(', ')}</TableCell>
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
                        onClick={() => handleManageStaff(station)}
                      >
                        Manage Staff
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className='text-red-600'
                        onClick={() => handleDeactivateStation(station.id)}
                      >
                        Deactivate Station
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
          <div className='text-2xl font-bold'>{mockStations.length}</div>
          <div className='text-sm text-muted-foreground'>Total Stations</div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {mockStations.filter(s => s.status === 'Active').length}
          </div>
          <div className='text-sm text-muted-foreground'>Active Stations</div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {mockStations.reduce((sum, s) => sum + s.availableSpots, 0)}
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
              onSubmit={data => {
                console.log('Updated station data:', data);
                setIsEditing(false);
                setOpen(false);
              }}
            />
          ) : (
            renderStationDetails(selectedStation)
          )}
        </div>
      )}
    </div>
  );
}
