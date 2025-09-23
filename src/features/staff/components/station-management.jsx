import {
  AlertTriangle,
  Battery,
  Car,
  CheckCircle,
  Coffee,
  Edit,
  MoreHorizontal,
  Plus,
  ShoppingBag,
  Trash2,
  Users,
  Utensils,
  Wifi,
  Wrench,
  Zap,
} from 'lucide-react';
import * as React from 'react';

import { Badge } from '../../shared/components/ui/badge';
import { Button } from '../../shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../shared/components/ui/card';
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../shared/components/ui/dropdown-menu';
import { Label } from '../../shared/components/ui/label';
import { Progress } from '../../shared/components/ui/progress';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../shared/components/ui/tabs';
import { Textarea } from '../../shared/components/ui/textarea';

const mockStations = [
  {
    id: 'STATION001',
    name: 'Downtown Station',
    address: '123 Main St, New York, NY 10001',
    coordinates: { lat: 40.7128, lng: -74.006 },
    capacity: 20,
    availableSpots: 12,
    occupiedSpots: 8,
    chargingPorts: 15,
    activeChargingPorts: 8,
    faultyChargingPorts: 1,
    staff: ['John Smith', 'Maria Garcia'],
    operatingHours: '24/7',
    status: 'Active',
    amenities: ['WiFi', 'Restrooms', 'Vending Machines', 'Waiting Area'],
    lastMaintenance: '2024-01-15',
    nextMaintenance: '2024-02-15',
  },
  {
    id: 'STATION002',
    name: 'Airport Station',
    address: '456 Airport Rd, Queens, NY 11430',
    coordinates: { lat: 40.6892, lng: -74.1745 },
    capacity: 35,
    availableSpots: 22,
    occupiedSpots: 13,
    chargingPorts: 25,
    activeChargingPorts: 20,
    faultyChargingPorts: 2,
    staff: ['Sarah Johnson', 'David Kim'],
    operatingHours: '5:00 AM - 11:00 PM',
    status: 'Active',
    amenities: ['WiFi', 'Restrooms', 'Food Court', 'Shuttle Service'],
    lastMaintenance: '2024-01-10',
    nextMaintenance: '2024-02-10',
  },
  {
    id: 'STATION003',
    name: 'Mall Station',
    address: '789 Shopping Center Dr, Brooklyn, NY 11201',
    coordinates: { lat: 40.7282, lng: -73.7949 },
    capacity: 15,
    availableSpots: 8,
    occupiedSpots: 7,
    chargingPorts: 12,
    activeChargingPorts: 8,
    faultyChargingPorts: 4,
    staff: ['Mike Chen'],
    operatingHours: '10:00 AM - 10:00 PM',
    status: 'Maintenance',
    amenities: ['WiFi', 'Restrooms', 'Shopping', 'Food Court'],
    lastMaintenance: '2024-01-18',
    nextMaintenance: '2024-01-25',
  },
];

const mockChargingPorts = [
  {
    id: 'PORT001',
    stationId: 'STATION001',
    portNumber: 1,
    type: 'DC Fast Charger',
    power: '150kW',
    status: 'Available',
    currentUser: null,
    lastMaintenance: '2024-01-15',
  },
  {
    id: 'PORT002',
    stationId: 'STATION001',
    portNumber: 2,
    type: 'DC Fast Charger',
    power: '150kW',
    status: 'In Use',
    currentUser: 'Tesla Model 3 - EV-123-ABC',
    chargingStartTime: '2024-01-20T14:30:00Z',
    estimatedCompletion: '2024-01-20T16:00:00Z',
    lastMaintenance: '2024-01-15',
  },
  {
    id: 'PORT003',
    stationId: 'STATION001',
    portNumber: 3,
    type: 'Level 2 Charger',
    power: '7.2kW',
    status: 'Faulty',
    currentUser: null,
    lastMaintenance: '2024-01-10',
    issue: 'Connection error - scheduled for repair',
  },
];

const mockMaintenanceRequests = [
  {
    id: 'MAINT001',
    stationId: 'STATION001',
    type: 'Charging Port',
    priority: 'High',
    description: 'Port 3 not connecting properly',
    reportedBy: 'John Smith',
    reportedDate: '2024-01-19T09:00:00Z',
    status: 'In Progress',
    assignedTo: 'Tech Team A',
  },
  {
    id: 'MAINT002',
    stationId: 'STATION002',
    type: 'Facility',
    priority: 'Medium',
    description: 'Restroom door lock needs repair',
    reportedBy: 'Sarah Johnson',
    reportedDate: '2024-01-18T15:30:00Z',
    status: 'Pending',
    assignedTo: null,
  },
  {
    id: 'MAINT003',
    stationId: 'STATION003',
    type: 'Lighting',
    priority: 'Low',
    description: 'LED light flickering in parking area',
    reportedBy: 'Mike Chen',
    reportedDate: '2024-01-17T20:15:00Z',
    status: 'Completed',
    assignedTo: 'Tech Team B',
  },
];

function StationStatusBadge({ status }) {
  const config = {
    Active: { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
    Maintenance: {
      variant: 'destructive',
      icon: Wrench,
      color: 'text-orange-600',
    },
    Offline: {
      variant: 'secondary',
      icon: AlertTriangle,
      color: 'text-red-600',
    },
  };

  const { variant, icon: Icon, color } = config[status] || config['Active'];

  return (
    <Badge variant={variant} className='gap-1'>
      <Icon className={`h-3 w-3 ${color}`} />
      {status}
    </Badge>
  );
}

function ChargingPortStatusBadge({ status }) {
  const config = {
    Available: {
      variant: 'default',
      icon: CheckCircle,
      color: 'text-green-600',
    },
    'In Use': { variant: 'secondary', icon: Battery, color: 'text-blue-600' },
    Faulty: {
      variant: 'destructive',
      icon: AlertTriangle,
      color: 'text-red-600',
    },
  };

  const { variant, icon: Icon, color } = config[status] || config['Available'];

  return (
    <Badge variant={variant} className='gap-1'>
      <Icon className={`h-3 w-3 ${color}`} />
      {status}
    </Badge>
  );
}

function AmenityIcon({ amenity }) {
  const icons = {
    WiFi: Wifi,
    Restrooms: Users,
    'Food Court': Utensils,
    Shopping: ShoppingBag,
    'Vending Machines': Coffee,
    'Waiting Area': Users,
    'Shuttle Service': Car,
  };

  const Icon = icons[amenity] || CheckCircle;
  return <Icon className='h-4 w-4' />;
}

function StationOverview() {
  return (
    <div className='space-y-6'>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {mockStations.map(station => (
          <Card key={station.id}>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-lg'>{station.name}</CardTitle>
                <StationStatusBadge status={station.status} />
              </div>
              <CardDescription>{station.address}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {/* Capacity Overview */}
                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>
                      Parking Capacity
                    </span>
                    <span>
                      {station.availableSpots}/{station.capacity} available
                    </span>
                  </div>
                  <Progress
                    value={(station.availableSpots / station.capacity) * 100}
                  />
                </div>

                {/* Charging Ports */}
                <div className='grid grid-cols-3 gap-4 text-center'>
                  <div className='space-y-1'>
                    <div className='text-2xl font-bold text-green-600'>
                      {station.activeChargingPorts}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      Active Ports
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <div className='text-2xl font-bold text-blue-600'>
                      {station.chargingPorts -
                        station.activeChargingPorts -
                        (station.faultyChargingPorts || 0)}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      Available
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <div className='text-2xl font-bold text-red-600'>
                      {station.faultyChargingPorts || 0}
                    </div>
                    <div className='text-xs text-muted-foreground'>Faulty</div>
                  </div>
                </div>

                {/* Amenities */}
                <div className='space-y-2'>
                  <div className='text-sm font-medium'>Amenities</div>
                  <div className='flex flex-wrap gap-2'>
                    {station.amenities.map(amenity => (
                      <Badge key={amenity} variant='outline' className='gap-1'>
                        <AmenityIcon amenity={amenity} />
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Staff */}
                <div className='space-y-2'>
                  <div className='text-sm font-medium'>Staff on Duty</div>
                  <div className='flex flex-wrap gap-1'>
                    {station.staff.map(staffMember => (
                      <Badge key={staffMember} variant='secondary'>
                        {staffMember}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Operating Hours */}
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>Operating Hours</span>
                  <span>{station.operatingHours}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ChargingStations() {
  const [selectedStation, setSelectedStation] = React.useState('all');

  const filteredPorts =
    selectedStation === 'all'
      ? mockChargingPorts
      : mockChargingPorts.filter(port => port.stationId === selectedStation);

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-4'>
        <Select value={selectedStation} onValueChange={setSelectedStation}>
          <SelectTrigger className='w-[200px]'>
            <SelectValue placeholder='Select station' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Stations</SelectItem>
            {mockStations.map(station => (
              <SelectItem key={station.id} value={station.id}>
                {station.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Port #</TableHead>
              <TableHead>Station</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Power</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Current User</TableHead>
              <TableHead>Est. Completion</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPorts.map(port => {
              const station = mockStations.find(s => s.id === port.stationId);
              return (
                <TableRow key={port.id}>
                  <TableCell className='font-medium'>
                    #{port.portNumber}
                  </TableCell>
                  <TableCell>{station?.name}</TableCell>
                  <TableCell>{port.type}</TableCell>
                  <TableCell>{port.power}</TableCell>
                  <TableCell>
                    <ChargingPortStatusBadge status={port.status} />
                  </TableCell>
                  <TableCell>{port.currentUser || '-'}</TableCell>
                  <TableCell>
                    {port.estimatedCompletion
                      ? new Date(port.estimatedCompletion).toLocaleTimeString()
                      : '-'}
                  </TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='z-50'>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Zap className='mr-2 h-4 w-4' />
                          Reset Port
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Wrench className='mr-2 h-4 w-4' />
                          Report Issue
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Edit className='mr-2 h-4 w-4' />
                          Edit Settings
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
    </div>
  );
}

function MaintenanceRequests() {
  const [selectedPriority, setSelectedPriority] = React.useState('all');

  const filteredRequests =
    selectedPriority === 'all'
      ? mockMaintenanceRequests
      : mockMaintenanceRequests.filter(
          request => request.priority.toLowerCase() === selectedPriority
        );

  const getPriorityBadge = priority => {
    const variants = {
      High: 'destructive',
      Medium: 'default',
      Low: 'secondary',
    };
    return <Badge variant={variants[priority]}>{priority}</Badge>;
  };

  const getStatusBadge = status => {
    const variants = {
      Pending: 'secondary',
      'In Progress': 'default',
      Completed: 'outline',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Filter by priority' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Priorities</SelectItem>
            <SelectItem value='high'>High Priority</SelectItem>
            <SelectItem value='medium'>Medium Priority</SelectItem>
            <SelectItem value='low'>Low Priority</SelectItem>
          </SelectContent>
        </Select>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[500px]'>
            <DialogHeader>
              <DialogTitle>Create Maintenance Request</DialogTitle>
              <DialogDescription>
                Report a new maintenance issue for station facilities or
                equipment.
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='space-y-2'>
                <Label>Station</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder='Select station' />
                  </SelectTrigger>
                  <SelectContent>
                    {mockStations.map(station => (
                      <SelectItem key={station.id} value={station.id}>
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label>Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder='Select type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='charging-port'>Charging Port</SelectItem>
                    <SelectItem value='facility'>Facility</SelectItem>
                    <SelectItem value='lighting'>Lighting</SelectItem>
                    <SelectItem value='security'>Security</SelectItem>
                    <SelectItem value='cleaning'>Cleaning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label>Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder='Select priority' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='high'>High</SelectItem>
                    <SelectItem value='medium'>Medium</SelectItem>
                    <SelectItem value='low'>Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label>Description</Label>
                <Textarea placeholder='Describe the issue in detail...' />
              </div>
            </div>
            <DialogFooter>
              <Button>Create Request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Station</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map(request => {
              const station = mockStations.find(
                s => s.id === request.stationId
              );
              return (
                <TableRow key={request.id}>
                  <TableCell className='font-medium'>{request.id}</TableCell>
                  <TableCell>{station?.name}</TableCell>
                  <TableCell>{request.type}</TableCell>
                  <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                  <TableCell className='max-w-xs truncate'>
                    {request.description}
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>{request.assignedTo || 'Unassigned'}</TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='z-50'>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Edit className='mr-2 h-4 w-4' />
                          Edit Request
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className='mr-2 h-4 w-4' />
                          Assign Technician
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className='text-red-600'>
                          <Trash2 className='mr-2 h-4 w-4' />
                          Delete Request
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
    </div>
  );
}

export function StationManagement() {
  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>
          Station Management
        </h2>
        <p className='text-muted-foreground'>
          Monitor station operations, charging infrastructure, and maintenance
        </p>
      </div>

      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='overview'>Station Overview</TabsTrigger>
          <TabsTrigger value='charging'>Charging Ports</TabsTrigger>
          <TabsTrigger value='maintenance'>Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          <StationOverview />
        </TabsContent>

        <TabsContent value='charging' className='space-y-4'>
          <ChargingStations />
        </TabsContent>

        <TabsContent value='maintenance' className='space-y-4'>
          <MaintenanceRequests />
        </TabsContent>
      </Tabs>
    </div>
  );
}
