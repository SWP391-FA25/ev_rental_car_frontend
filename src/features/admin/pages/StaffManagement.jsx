import {
  FilterIcon,
  LoaderIcon,
  MapPinIcon,
  PlusIcon,
  SearchIcon,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { MoreVerticalIcon } from 'lucide-react';
import { Badge } from '../../shared/components/ui/badge';
import { Button } from '../../shared/components/ui/button';
import { ConfirmDialog } from '../../shared/components/ui/confirm-dialog';
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
import { StaffDetails } from '../components/staff/StaffDetails';
import { StaffForm } from '../components/staff/StaffForm';
import { useStaff } from '../hooks/useStaff';

export default function StaffManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showStaffDetails, setShowStaffDetails] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [staffToSuspend, setStaffToSuspend] = useState(null);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [staffToUnassign, setStaffToUnassign] = useState(null);
  const [unassignDialogOpen, setUnassignDialogOpen] = useState(false);
  const [assignments, setAssignments] = useState([]);

  const {
    staff,
    loading,
    error,
    createStaff,
    updateStaff,
    softDeleteStaff,
    deleteStaff,
  } = useStaff();

  // Load assignments
  const loadAssignments = useCallback(async () => {
    try {
      const response = await apiClient.get(endpoints.assignments.getAll());
      if (response.success) {
        setAssignments(response.data.assignments || []);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  }, []);

  useEffect(() => {
    loadAssignments();

    // Listen for assignment changes from other components
    const handleAssignmentChange = () => {
      loadAssignments();
    };

    window.addEventListener('assignmentChanged', handleAssignmentChange);

    return () => {
      window.removeEventListener('assignmentChanged', handleAssignmentChange);
    };
  }, [loadAssignments]);

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

  // Helper function to get station assignment for a staff member
  const getStaffAssignment = staffId => {
    return assignments.find(assignment => assignment.userId === staffId);
  };

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

  const handleSuspendStaff = async id => {
    try {
      await softDeleteStaff(id);
      toast.success('Staff account suspended successfully');


      setSelectedStaff(prev =>
        prev && prev.id === id ? { ...prev, accountStatus: 'SUSPENDED' } : prev
      );
    } catch (err) {
      toast.error('Failed to suspend staff account');
      console.error('Error suspending staff:', err);
    }
  };

  const handleDeleteStaff = async id => {
    try {
      await deleteStaff(id);
      toast.success('Staff account deleted successfully');
    } catch (err) {
      toast.error('Failed to delete staff account');
      console.error('Error deleting staff:', err);
    }
  };

  const handleUnassignStaff = async assignmentId => {
    try {
      const response = await apiClient.delete(
        endpoints.assignments.delete(assignmentId)
      );
      if (response.success) {
        toast.success('Staff unassigned successfully');
        loadAssignments(); // Refresh assignments
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('assignmentChanged'));
      }
    } catch (err) {
      toast.error('Failed to unassign staff');
      console.error('Error unassigning staff:', err);
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
            <DropdownMenuItem onClick={() => setFilterStatus('banned')}>
              Banned
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
              <TableHead>Station Assignment</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead className='w-[70px]'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className='text-center py-8'>
                  <div className='flex items-center justify-center gap-2'>
                    <LoaderIcon className='h-4 w-4 animate-spin' />
                    Loading staff...
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className='text-center py-8 text-red-500'
                >
                  Error: {error}
                </TableCell>
              </TableRow>
            ) : filteredStaff.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
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
                  <TableCell>
                    {(() => {
                      const assignment = getStaffAssignment(staffItem.id);
                      return assignment ? (
                        <div className='flex items-center gap-2'>
                          <MapPinIcon className='h-4 w-4 text-gray-500' />
                          <span className='text-sm'>
                            {assignment.station?.name || 'Unknown Station'}
                          </span>
                        </div>
                      ) : (
                        <Badge variant='outline' className='text-gray-500'>
                          Unassigned
                        </Badge>
                      );
                    })()}
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
                        {getStaffAssignment(staffItem.id) && (
                          <DropdownMenuItem
                            onClick={() => {
                              setStaffToUnassign(
                                getStaffAssignment(staffItem.id).id
                              );
                              setUnassignDialogOpen(true);
                            }}
                            className='text-blue-600'
                          >
                            Unassign from Station
                          </DropdownMenuItem>
                        )}
                        {/* <DropdownMenuItem>Reset Password</DropdownMenuItem> */}
                        <DropdownMenuItem
                          onClick={() => {
                            setStaffToSuspend(staffItem.id);
                            setSuspendDialogOpen(true);
                          }}
                          className='text-orange-600'
                        >
                          Suspend Staff
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setStaffToDelete(staffItem.id);
                            setDeleteDialogOpen(true);
                          }}
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

      {/* Suspend Staff Confirmation Dialog */}
      <ConfirmDialog
        open={suspendDialogOpen}
        onOpenChange={setSuspendDialogOpen}
        title='Suspend Staff'
        description='Are you sure you want to suspend this staff member? They will not be able to access the system until reactivated.'
        onConfirm={() => {
          if (staffToSuspend) {
            handleSuspendStaff(staffToSuspend);
            setStaffToSuspend(null);
          }
        }}
        confirmText='Suspend'
        cancelText='Cancel'
        confirmVariant='destructive'
      />

      {/* Delete Staff Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title='Delete Staff'
        description='Are you sure you want to permanently delete this staff account? This action cannot be undone and will remove all staff data.'
        onConfirm={() => {
          if (staffToDelete) {
            handleDeleteStaff(staffToDelete);
            setStaffToDelete(null);
          }
        }}
        confirmText='Delete'
        cancelText='Cancel'
        confirmVariant='destructive'
      />

      {/* Unassign Staff Confirmation Dialog */}
      <ConfirmDialog
        open={unassignDialogOpen}
        onOpenChange={setUnassignDialogOpen}
        title='Unassign Staff'
        description='Are you sure you want to unassign this staff member from their current station? They will become available for assignment to other stations.'
        onConfirm={() => {
          if (staffToUnassign) {
            handleUnassignStaff(staffToUnassign);
            setStaffToUnassign(null);
          }
        }}
        confirmText='Unassign'
        cancelText='Cancel'
        confirmVariant='default'
      />
    </div>
  );
}
