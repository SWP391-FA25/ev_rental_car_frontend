import { FilterIcon, LoaderIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

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
import { StaffDetails } from '../components/StaffDetails';
import { StaffForm } from '../components/StaffForm';
import { useStaff } from '../hooks/useStaff';

export default function StaffManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showStaffDetails, setShowStaffDetails] = useState(false);

  const {
    staff,
    loading,
    error,
    createStaff,
    updateStaff,
    softDeleteStaff,
    deleteStaff,
  } = useStaff();

  const filteredStaff = staff.filter(staffItem => {
    const matchesSearch =
      staffItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staffItem.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      staffItem.accountStatus.toLowerCase() === filterStatus.toLowerCase();
    const matchesRole =
      filterRole === 'all' ||
      staffItem.role.toLowerCase().includes(filterRole.toLowerCase());
    return matchesSearch && matchesStatus && matchesRole;
  });

  const getStatusBadgeVariant = status => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'SUSPENDED':
        return 'destructive';
      case 'BANNED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getRoleBadgeVariant = role => {
    if (role === 'STAFF') return 'default';
    return 'outline';
  };

  const handleSoftDelete = async id => {
    try {
      const updated = await softDeleteStaff(id);
      toast.success('Staff account suspended successfully');


      setSelectedStaff(prev =>
        prev && prev.id === id ? { ...prev, accountStatus: 'SUSPENDED' } : prev
      );
    } catch (err) {
      toast.error('Failed to suspend staff account');
      console.error('Error suspending staff:', err);
    }
  };



  const handleDelete = async id => {
    if (
      window.confirm(
        'Are you sure you want to permanently delete this staff account?'
      )
    ) {
      try {
        await deleteStaff(id);
        toast.success('Staff account deleted successfully');
      } catch (err) {
        toast.error('Failed to delete staff account');
        console.error('Error deleting staff:', err);
      }
    }
  };

  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCreateStaff = async staffData => {
    try {
      await createStaff(staffData);
      toast.success('Staff created successfully');
    } catch (err) {
      toast.error('Failed to create staff');
      throw err;
    }
  };

  const handleViewDetails = staffItem => {
    setSelectedStaff(staffItem);
    setShowStaffDetails(true);
  };

  const handleUpdateStaff = async (id, staffData) => {
    try {
      const updatedStaff = await updateStaff(id, staffData);
      // Update the selected staff with the latest data
      if (selectedStaff && selectedStaff.id === id) {
        setSelectedStaff(updatedStaff);
      }
      toast.success('Staff updated successfully');
    } catch (err) {
      toast.error('Failed to update staff');
      throw err;
    }
  };


  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Staff Management
          </h1>
          <p className='text-muted-foreground'>
            Manage staff accounts and permissions
          </p>
        </div>
        <Button onClick={() => setShowStaffForm(true)} disabled={loading}>
          <PlusIcon className='mr-2 h-4 w-4' />
          Add Staff
        </Button>
      </div>

      {/* Filters */}
      <div className='flex items-center space-x-4'>
        <div className='relative flex-1 max-w-sm'>
          <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Search staff...'
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

            <DropdownMenuItem onClick={() => setFilterStatus('suspended')}>
              Suspended
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('admin')}>
              Admin
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline'>
              <FilterIcon className='mr-2 h-4 w-4' />
              Role: {filterRole === 'all' ? 'All' : filterRole}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterRole('all')}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterRole('staff')}>
              Staff
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterRole('admin')}>
              Admin
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Staff Table */}
      <div className='rounded-md border min-h-[400px]'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead className='w-[70px]'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className='text-center py-8'>
                  <div className='flex items-center justify-center gap-2'>
                    <LoaderIcon className='h-4 w-4 animate-spin' />
                    Loading staff...
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className='text-center py-8 text-red-500'
                >
                  Error: {error}
                </TableCell>
              </TableRow>
            ) : filteredStaff.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className='text-center py-8 text-muted-foreground'
                >
                  No staff found
                </TableCell>
              </TableRow>
            ) : (
              filteredStaff.map(staffItem => (
                <TableRow key={staffItem.id}>
                  <TableCell className='font-medium'>
                    {staffItem.name}
                  </TableCell>
                  <TableCell>{staffItem.email}</TableCell>
                  <TableCell>{staffItem.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(staffItem.role)}>
                      {staffItem.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{staffItem.address || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusBadgeVariant(staffItem.accountStatus)}
                    >
                      {staffItem.accountStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(staffItem.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                          <MoreVerticalIcon className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          onClick={() => handleViewDetails(staffItem)}
                        >
                          View Details
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleSoftDelete(staffItem.id)}
                          className='text-orange-600'
                        >
                          Suspend Staff
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(staffItem.id)}
                          className='text-red-600'
                        >
                          Delete Staff
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>{staff.length}</div>
          <div className='text-sm text-muted-foreground'>Total Staff</div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {staff.filter(s => s.accountStatus === 'ACTIVE').length}
          </div>
          <div className='text-sm text-muted-foreground'>Active Staff</div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {staff.filter(s => s.role === 'STAFF').length}
          </div>
          <div className='text-sm text-muted-foreground'>Staff Members</div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {staff.filter(s => s.role === 'ADMIN').length}
          </div>
          <div className='text-sm text-muted-foreground'>Admins</div>
        </div>
      </div>

      {/* Staff Form Dialog */}
      <StaffForm
        open={showStaffForm}
        onOpenChange={setShowStaffForm}
        onSubmit={handleCreateStaff}
        loading={loading}
      />

      {/* Staff Details Dialog */}
      <StaffDetails
        open={showStaffDetails}
        onOpenChange={setShowStaffDetails}
        staff={selectedStaff}
        onUpdate={handleUpdateStaff}
        loading={loading}
      />
    </div>
  );
}
