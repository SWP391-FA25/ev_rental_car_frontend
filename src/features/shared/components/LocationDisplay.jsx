import { MapPinIcon, Sidebar } from 'lucide-react';
import { useState } from 'react';
import { StationMapModal } from './StationMapModal';
import { Button } from './ui/button';

export function LocationDisplay({ location, stationName }) {
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Helper function to format location data
  const formatLocation = locationData => {
    if (!locationData) return 'Not specified';

    // If it's already a string, return as is
    if (typeof locationData === 'string') {
      return locationData;
    }

    // If it's a GeoJSON object
    if (typeof locationData === 'object' && locationData.coordinates) {
      const [lng, lat] = locationData.coordinates;
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
    return 'Invalid location data';
  };

  const getCoordinates = locationData => {
    if (!locationData || typeof locationData !== 'object') return null;

    if (locationData.coordinates && Array.isArray(locationData.coordinates)) {
      const [lng, lat] = locationData.coordinates;
      return [lat, lng]; // Leaflet expects [lat, lng]
    }

    return null;
  };

  const coordinates = getCoordinates(location);
  const displayText = formatLocation(location);

  return (
    <>
      <div className='flex items-center space-x-2'>
        <MapPinIcon className='h-4 w-4 text-muted-foreground' />
        <span className='text-sm'>{displayText}</span>
        {coordinates && (
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setIsMapOpen(true)}
            className='h-6 px-2 text-xs'
          >
            View Map
          </Button>
        )}
      </div>

      {coordinates && (
        <StationMapModal
          open={isMapOpen}
          onOpenChange={setIsMapOpen}
          coordinates={coordinates}
          stationName={stationName}
        />
      )}
    </>
  );
}
