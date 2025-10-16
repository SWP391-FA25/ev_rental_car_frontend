import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
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

export function SimpleAssignmentForm({
  stationId,
  onSuccess,
  onCancel,
  loading = false,
}) {
  const [unassignedStaff, setUnassignedStaff] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch unassigned staff
  useEffect(() => {
    const fetchUnassignedStaff = async () => {
      try {
        const response = await apiClient.get(
          endpoints.assignments.getUnassignedStaff()
        );
        if (response.success) {
          setUnassignedStaff(response.data.staff || []);
        }
      } catch (error) {
        console.error('Error fetching unassigned staff:', error);
      }
    };

    fetchUnassignedStaff();
  }, []);

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

        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('assignmentChanged'));
      }
    } catch (error) {
      toast.error(error.message || 'Failed to assign staff');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='staffId'>Select Staff Member *</Label>
        <Select
          value={selectedStaffId}
          onValueChange={setSelectedStaffId}
          disabled={loading || isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder='Choose a staff member' />
          </SelectTrigger>
          <SelectContent>
            {unassignedStaff.map(staff => (
              <SelectItem key={staff.id} value={staff.id}>
                {staff.name} - {staff.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {unassignedStaff.length === 0 && (
          <p className='text-sm text-gray-500'>No unassigned staff available</p>
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
