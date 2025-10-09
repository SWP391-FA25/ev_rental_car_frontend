'use client';

import { ChevronDownIcon, Loader2, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { stationService } from '../../../cars/services/stationService';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

const StationSelector = ({
  label,
  placeholder = 'Select a station',
  value,
  onChange,
  className,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  // Fetch stations on component mount
  useEffect(() => {
    const fetchStations = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await stationService.getAllStations();
        if (response.success) {
          setStations(response.data.stations || []);
        } else {
          setError(response.message || 'Failed to fetch stations');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching stations');
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  // Filter stations based on search query
  const filteredStations = stations.filter(
    station =>
      station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStationSelect = station => {
    onChange(station);
    setOpen(false);
    setSearchQuery('');
  };

  const selectedStation = stations.find(station => station.id === value?.id);

  return (
    <div className={cn('space-y-2', className)}>
      <Label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
        <MapPin className='w-5 h-5' />
        <span>{label}</span>
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            className='w-full justify-between font-normal'
            disabled={disabled}
          >
            {selectedStation ? (
              <div className='flex flex-col items-start'>
                <span className='font-medium'>{selectedStation.name}</span>
              </div>
            ) : (
              placeholder
            )}
            <ChevronDownIcon className='h-4 w-4' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-80 p-0' align='start'>
          <div className='p-3 border-b'>
            <Input
              placeholder='Search stations...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='h-8'
            />
          </div>
          <div className='max-h-60 overflow-y-auto'>
            {loading ? (
              <div className='flex items-center justify-center p-4'>
                <Loader2 className='h-4 w-4 animate-spin mr-2' />
                <span className='text-sm text-muted-foreground'>
                  Loading stations...
                </span>
              </div>
            ) : error ? (
              <div className='p-4 text-center'>
                <p className='text-sm text-destructive'>{error}</p>
              </div>
            ) : filteredStations.length === 0 ? (
              <div className='p-4 text-center'>
                <p className='text-sm text-muted-foreground'>
                  {searchQuery ? 'No stations found' : 'No stations available'}
                </p>
              </div>
            ) : (
              filteredStations.map(station => (
                <div
                  key={station.id}
                  className='p-3 hover:bg-accent cursor-pointer border-b last:border-b-0'
                  onClick={() => handleStationSelect(station)}
                >
                  <div className='flex flex-col'>
                    <span className='font-medium text-sm'>{station.name}</span>
                    {station.address && (
                      <span className='text-xs text-muted-foreground mt-1'>
                        {station.address}
                      </span>
                    )}
                    <div className='flex items-center gap-2 mt-1'>
                      <span className='text-xs text-muted-foreground'>
                        Capacity: {station.capacity}
                      </span>
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          station.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        )}
                      >
                        {station.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default StationSelector;
