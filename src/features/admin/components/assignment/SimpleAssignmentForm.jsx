import { useEffect, useState } from 'react';
import { Button } from '../../../shared/components/ui/button';
import { Label } from '../../../shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/components/ui/select';
import { apiClient } from '../../../shared/lib/apiClient';
import { endpoints } from '../../../shared/lib/endpoints';
import { toast } from '../../../shared/lib/toast';

export function SimpleAssignmentForm({
  stationId,
  onSuccess,
  onCancel,
  loading = false,
}) {
  const [assignments, setAssignments] = useState([]);
  const [availableStaff, setAvailableStaff] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Fetch all staff and assignments
  useEffect(() => {
    const fetchData = async () => {
      if (!stationId) return;

      try {
        setIsFetching(true);

        // Fetch all staff
        const staffResponse = await apiClient.get(endpoints.staff.getAll());
        const staffData =
          staffResponse.data?.staff ||
          staffResponse.data?.data?.staff ||
          staffResponse.data ||
          [];

        // Fetch all assignments
        const assignmentsResponse = await apiClient.get(
          endpoints.assignments.getAll()
        );
        const assignmentsData =
          assignmentsResponse.data?.assignments ||
          assignmentsResponse.data?.data?.assignments ||
          assignmentsResponse.data ||
          [];
        setAssignments(assignmentsData);

        // Get staff IDs already assigned to this station
        const assignedStaffIds = assignmentsData
          .filter(
            assignment =>
              assignment.station?.id === stationId ||
              assignment.stationId === stationId
          )
          .map(
            assignment =>
              assignment.user?.id || assignment.userId || assignment.staffId
          )
          .filter(Boolean);

        // Filter out staff already assigned to this station
        const available = staffData.filter(
          staff => !assignedStaffIds.includes(staff.id)
        );

        setAvailableStaff(available);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load staff data');
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [stationId]);

  const handleSubmit = async e => {
    e.preventDefault();

    if (!selectedStaffId) {
      toast.error('Please select a staff member');
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiClient.post(endpoints.assignments.create(), {
        stationId,
        staffId: selectedStaffId,
      });

      if (response.success) {
        toast.success('Staff assigned successfully');
        onSuccess?.(response.data.assignment);

        // Update assignments state with new assignment
        const newAssignment = response.data.assignment;
        if (newAssignment) {
          setAssignments(prev => [...prev, newAssignment]);
        }

        // Remove assigned staff from available list
        setAvailableStaff(prev =>
          prev.filter(staff => staff.id !== selectedStaffId)
        );
        setSelectedStaffId('');

        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('assignmentChanged'));
      }
    } catch (error) {
      toast.error(error.message || 'Failed to assign staff');
    } finally {
      setIsLoading(false);
    }
  };

  // Create map of staff to their assigned stations (for display)
  const staffAssignmentsMap = {};
  assignments.forEach(assignment => {
    const staffId =
      assignment.user?.id || assignment.userId || assignment.staffId;
    const stationName = assignment.station?.name || '';
    if (staffId && stationName) {
      if (!staffAssignmentsMap[staffId]) {
        staffAssignmentsMap[staffId] = [];
      }
      // Only add stations that are not the current station
      if (
        assignment.station?.id !== stationId &&
        assignment.stationId !== stationId
      ) {
        staffAssignmentsMap[staffId].push(stationName);
      }
    }
  });

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='staffId'>Select Staff Member *</Label>
        <Select
          value={selectedStaffId}
          onValueChange={setSelectedStaffId}
          disabled={loading || isLoading || isFetching}
        >
          <SelectTrigger className='w-full'>
            <SelectValue
              placeholder={
                isFetching ? 'Loading staff...' : 'Choose a staff member'
              }
            />
          </SelectTrigger>
          <SelectContent className='min-w-[500px]'>
            {availableStaff.map(staff => {
              const assignedStations = staffAssignmentsMap[staff.id] || [];
              const hasOtherAssignments = assignedStations.length > 0;
              const displayText = hasOtherAssignments
                ? `${staff.name} - ${
                    staff.email
                  } (Assigned to: ${assignedStations.join(', ')})`
                : `${staff.name} - ${staff.email}`;
              return (
                <SelectItem key={staff.id} value={staff.id}>
                  <span className='whitespace-normal break-words'>
                    {displayText}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {!isFetching && availableStaff.length === 0 && (
          <p className='text-sm text-muted-foreground'>
            All staff members are already assigned to this station
          </p>
        )}
        {isFetching && (
          <p className='text-sm text-muted-foreground'>Loading staff data...</p>
        )}
      </div>

      <div className='flex justify-end space-x-3 pt-4'>
        <Button
          type='button'
          variant='outline'
          onClick={onCancel}
          disabled={loading || isLoading}
        >
          Cancel
        </Button>
        <Button
          type='submit'
          disabled={loading || isLoading || !selectedStaffId}
        >
          {isLoading ? 'Assigning...' : 'Assign Staff'}
        </Button>
      </div>
    </form>
  );
}
