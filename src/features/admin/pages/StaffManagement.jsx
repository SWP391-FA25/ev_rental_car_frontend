import {
  FilterIcon,
  LoaderIcon,
  MapPinIcon,
  PlusIcon,
  SearchIcon,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from '../../shared/lib/toast';

import { MoreVerticalIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showStaffDetails, setShowStaffDetails] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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

  // Helpers
  const getStaffAssignment = staffId =>
    assignments.find(assignment => assignment.userId === staffId);

  const getStatusBadgeVariant = status => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
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

  const handleDeleteStaff = async id => {
    try {
      // Check if staff has assignment
      const assignment = getStaffAssignment(id);

      if (assignment) {
        // If staff is assigned, show warning and unassign first
        const confirmUnassign = window.confirm(
          'This staff is currently assigned to a station. They must be unassigned before deletion. Do you want to unassign and delete?'
        );

        if (confirmUnassign) {
          // Unassign first
          try {
            await apiClient.delete(endpoints.assignments.delete(assignment.id));
            console.log('✅ Staff unassigned successfully');
            await loadAssignments(); // Reload assignments
          } catch (unassignErr) {
            console.error('Failed to unassign staff:', unassignErr);
            toast.error('Failed to unassign staff: ' + (unassignErr?.response?.data?.message || unassignErr?.message));
            return; // Stop deletion if unassign fails
          }
        } else {
          return; // User cancelled
        }
      }

      // Now delete the staff
      await deleteStaff(id);
      toast.success(t('staffManagement.messages.deleted'));
      await loadAssignments(); // Reload assignments after delete
    } catch (err) {
      console.error('Delete staff error:', err);
      // Show specific error message from backend
      const errorMessage = err?.response?.data?.message ||
        err?.message ||
        t('staffManagement.messages.errorDelete');
      toast.error(errorMessage);
    }
  };

  const handleUnassignStaff = async assignmentId => {
    try {
      const response = await apiClient.delete(
        endpoints.assignments.delete(assignmentId)
      );
      if (response.success) {
        toast.success(t('staffManagement.messages.unassigned'));
        loadAssignments();
        window.dispatchEvent(new CustomEvent('assignmentChanged'));
      }
    } catch (err) {
      toast.error(t('staffManagement.messages.errorUnassign'));
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
      toast.success(t('staffManagement.messages.staffCreated'));
    } catch (err) {
      toast.error(t('staffManagement.messages.errorCreate'));
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
      if (selectedStaff && selectedStaff.id === id) {
        setSelectedStaff(updatedStaff);
      }
      toast.success(t('staffManagement.messages.staffUpdated'));
    } catch (err) {
      toast.error(t('staffManagement.messages.errorUpdate'));
      throw err;
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            {t('staffManagement.title')}
          </h1>
          <p className='text-muted-foreground'>
            {t('staffManagement.description')}
          </p>
        </div>
        <Button onClick={() => setShowStaffForm(true)} disabled={loading}>
          <PlusIcon className='mr-2 h-4 w-4' />
          {t('staffManagement.buttons.addStaff')}
        </Button>
      </div>

      {/* Filters */}
      <div className='flex items-center space-x-4'>
        <div className='relative flex-1 max-w-sm'>
          <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder={t('staffManagement.filters.search')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline'>
              <FilterIcon className='mr-2 h-4 w-4' />
              {t('staffManagement.filters.status')}:{' '}
              {filterStatus === 'all'
                ? t('staffManagement.filters.all')
                : filterStatus}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterStatus('all')}>
              {t('staffManagement.filters.all')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('active')}>
              {t('staffManagement.table.active')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('banned')}>
              {t('staffManagement.table.banned')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline'>
              <FilterIcon className='mr-2 h-4 w-4' />
              {t('staffManagement.filters.role')}:{' '}
              {filterRole === 'all'
                ? t('staffManagement.filters.all')
                : filterRole}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterRole('all')}>
              {t('staffManagement.filters.all')}
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

      {/* Table */}
      <div className='rounded-md border min-h-[400px]'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('staffManagement.table.name')}</TableHead>
              <TableHead>{t('staffManagement.table.email')}</TableHead>
              <TableHead>{t('staffManagement.table.phone')}</TableHead>
              <TableHead>{t('staffManagement.table.role')}</TableHead>
              <TableHead>
                {t('staffManagement.table.stationAssignment')}
              </TableHead>
              <TableHead>{t('staffManagement.table.address')}</TableHead>
              <TableHead>{t('staffManagement.table.status')}</TableHead>
              <TableHead>{t('staffManagement.table.joinDate')}</TableHead>
              <TableHead className='w-[70px]'>
                {t('staffManagement.table.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className='text-center py-8'>
                  <div className='flex items-center justify-center gap-2'>
                    <LoaderIcon className='h-4 w-4 animate-spin' />
                    {t('staffManagement.messages.loading')}
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className='text-center py-8 text-red-500'
                >
                  {t('staffManagement.messages.errorGeneric')}: {error}
                </TableCell>
              </TableRow>
            ) : filteredStaff.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className='text-center py-8 text-muted-foreground'
                >
                  {t('staffManagement.messages.noStaff')}
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
                            {assignment.station?.name ||
                              t('staffManagement.table.unknownStation')}
                          </span>
                        </div>
                      ) : (
                        <Badge variant='outline' className='text-gray-500'>
                          {t('staffManagement.table.unassigned')}
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
                          {t('staffManagement.actions.viewDetails')}
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
                            {t('staffManagement.actions.unassign')}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            setStaffToDelete(staffItem.id);
                            setDeleteDialogOpen(true);
                          }}
                          className='text-red-600'
                        >
                          {t('staffManagement.actions.delete')}
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
          <div className='text-sm text-muted-foreground'>
            {t('staffManagement.stats.total')}
          </div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {staff.filter(s => s.accountStatus === 'ACTIVE').length}
          </div>
          <div className='text-sm text-muted-foreground'>
            {t('staffManagement.stats.active')}
          </div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {staff.filter(s => s.role === 'STAFF').length}
          </div>
          <div className='text-sm text-muted-foreground'>
            {t('staffManagement.stats.staff')}
          </div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {staff.filter(s => s.role === 'ADMIN').length}
          </div>
          <div className='text-sm text-muted-foreground'>
            {t('staffManagement.stats.admins')}
          </div>
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

      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t('staffManagement.dialogs.delete.title')}
        description={t('staffManagement.dialogs.delete.description')}
        onConfirm={() => {
          if (staffToDelete) {
            handleDeleteStaff(staffToDelete);
            setStaffToDelete(null);
          }
        }}
        confirmText={t('staffManagement.dialogs.delete.confirm')}
        cancelText={t('staffManagement.dialogs.delete.cancel')}
        confirmVariant='destructive'
      />

      <ConfirmDialog
        open={unassignDialogOpen}
        onOpenChange={setUnassignDialogOpen}
        title={t('staffManagement.dialogs.unassign.title')}
        description={t('staffManagement.dialogs.unassign.description')}
        onConfirm={() => {
          if (staffToUnassign) {
            handleUnassignStaff(staffToUnassign);
            setStaffToUnassign(null);
          }
        }}
        confirmText={t('staffManagement.dialogs.unassign.confirm')}
        cancelText={t('staffManagement.dialogs.unassign.cancel')}
        confirmVariant='default'
      />
    </div>
  );
}
