import { useEffect, useState } from 'react';
import { Button } from '../../shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../shared/components/ui/dialog';

export function StationDetails({ open, onOpenChange, station }) {
  console.log('StationDetails received:', station); // Debugging log

  const [stationData, setStationData] = useState(null);

  useEffect(() => {
    if (station) {
      setStationData(station);
    }
  }, [station]);

  if (!stationData) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Station Details</DialogTitle>
          <DialogDescription>
            View and manage station information.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <p className='text-right font-semibold'>Name:</p>
            <p className='col-span-3'>{stationData.name}</p>
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <p className='text-right font-semibold'>Address:</p>
            <p className='col-span-3'>{stationData.address}</p>
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <p className='text-right font-semibold'>Status:</p>
            <p className='col-span-3'>{stationData.status}</p>
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <p className='text-right font-semibold'>Operating Hours:</p>
            <p className='col-span-3'>{stationData.operatingHours}</p>
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <p className='text-right font-semibold'>Capacity:</p>
            <p className='col-span-3'>{stationData.capacity}</p>
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <p className='text-right font-semibold'>Available Spots:</p>
            <p className='col-span-3'>{stationData.availableSpots}</p>
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <p className='text-right font-semibold'>Charging Ports:</p>
            <p className='col-span-3'>
              {stationData.activeChargingPorts}/{stationData.chargingPorts}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
