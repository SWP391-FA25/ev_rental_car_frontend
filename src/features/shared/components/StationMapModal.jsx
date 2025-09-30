import { ExternalLinkIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

// Dynamic import for Leaflet to avoid SSR issues
const LazyMap = ({ coordinates, stationName }) => {
  const [MapComponent, setMapComponent] = useState(null);

  useEffect(() => {
    const loadMap = async () => {
      try {
        // Import Leaflet CSS
        await import('leaflet/dist/leaflet.css');

        // Import Leaflet and React-Leaflet components
        const L = await import('leaflet');
        const { MapContainer, TileLayer, Marker, Popup } = await import(
          'react-leaflet'
        );

        // Fix default markers in Leaflet
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        setMapComponent(() => (
          <MapContainer
            center={coordinates}
            zoom={15}
            style={{ height: '400px', width: '100%' }}
            className='rounded-lg'
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />
            <Marker position={coordinates}>
              <Popup>
                <div className='p-2'>
                  <h3 className='font-semibold'>{stationName}</h3>
                  <p className='text-sm text-muted-foreground'>
                    {coordinates[0].toFixed(6)}, {coordinates[1].toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        ));
      } catch (error) {
        console.error('Failed to load map:', error);
        setMapComponent(() => (
          <div className='flex items-center justify-center h-64 bg-muted rounded-lg'>
            <p className='text-muted-foreground'>Failed to load map</p>
          </div>
        ));
      }
    };

    loadMap();
  }, [coordinates, stationName]);

  if (!MapComponent) {
    return (
      <div className='flex items-center justify-center h-64 bg-muted rounded-lg'>
        <p className='text-muted-foreground'>Loading map...</p>
      </div>
    );
  }

  return MapComponent;
};

export function StationMapModal({
  open,
  onOpenChange,
  coordinates,
  stationName,
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const openInGoogleMaps = () => {
    const [lat, lng] = coordinates;
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  };

  if (!isClient) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <div className='flex items-center justify-between'>
            <DialogTitle>Station Location</DialogTitle>
            <Button
              variant='outline'
              size='sm'
              onClick={openInGoogleMaps}
              className='flex items-center space-x-2'
            >
              <ExternalLinkIcon className='h-4 w-4' />
              <span>Open in Google Maps</span>
            </Button>
          </div>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='p-3 bg-muted rounded-lg'>
            <p className='text-sm'>
              <strong>Station:</strong> {stationName}
            </p>
            <p className='text-sm'>
              <strong>Coordinates:</strong> {coordinates[0].toFixed(6)},{' '}
              {coordinates[1].toFixed(6)}
            </p>
          </div>

          <LazyMap coordinates={coordinates} stationName={stationName} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
