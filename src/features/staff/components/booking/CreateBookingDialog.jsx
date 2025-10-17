import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../shared/components/ui/dialog';
import { StaffBookingForm } from './StaffBookingForm';

export const CreateBookingDialog = ({ onBookingCreated }) => {
  const [open, setOpen] = useState(false);

  const handleSuccess = data => {
    setOpen(false);
    // Callback to refresh bookings list
    onBookingCreated?.(data);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='h-4 w-4 mr-2' />
          Create Booking
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Create New Booking</DialogTitle>
          <DialogDescription>
            Create a booking on behalf of a renter. All fields marked with * are
            required.
          </DialogDescription>
        </DialogHeader>
        <StaffBookingForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </DialogContent>
    </Dialog>
  );
};
