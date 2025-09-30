import { CheckIcon, MapPinIcon, SearchIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

// Dynamic import for Leaflet to avoid SSR issues
const LazyMapPicker = ({ onLocationSelect, initialCoordinates }) => {
  const [MapComponent, setMapComponent] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(initialCoordinates);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentAddress, setCurrentAddress] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Search for locations using Nominatim (OpenStreetMap)
  const searchLocation = async query => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5&countrycodes=vn&addressdetails=1`
      );
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Reverse geocoding to get address from coordinates
  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      if (data.display_name) {
        setCurrentAddress(data.display_name);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  // Handle search result selection
  const handleSearchResultSelect = result => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setSelectedLocation([lat, lng]);
    setCurrentAddress(result.display_name);
    setSearchQuery(result.display_name);
    setSearchResults([]);
  };

  // Debounced search function
  const debouncedSearch = query => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      if (query.trim().length > 2) {
        searchLocation(query);
      } else {
        setSearchResults([]);
      }
    }, 500); // 500ms delay

    setSearchTimeout(timeout);
  };

  // Handle Enter key press
  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery.trim().length > 2) {
        searchLocation(searchQuery);
      }
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  useEffect(() => {
    const loadMap = async () => {
      try {
        // Import Leaflet CSS
        await import('leaflet/dist/leaflet.css');

        // Import Leaflet and React-Leaflet components
        const L = await import('leaflet');
        const { MapContainer, TileLayer, Marker } = await import(
          'react-leaflet'
        );
        const { useMapEvents } = await import('react-leaflet');

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

        // Component to handle map clicks
        const MapClickHandler = () => {
          useMapEvents({
            click: e => {
              const { lat, lng } = e.latlng;
              setSelectedLocation([lat, lng]);
              getAddressFromCoordinates(lat, lng);
            },
          });
          return null;
        };

        setMapComponent(() => (
          <MapContainer
            center={selectedLocation || [10.8231, 106.6297]} // Default to Ho Chi Minh City
            zoom={13}
            style={{ height: '300px', width: '100%' }}
            className='rounded-lg'
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />
            <MapClickHandler />
            {selectedLocation && (
              <Marker position={selectedLocation}>
                <div className='p-2'>
                  <p className='text-sm'>
                    {selectedLocation[0].toFixed(6)},{' '}
                    {selectedLocation[1].toFixed(6)}
                  </p>
                </div>
              </Marker>
            )}
          </MapContainer>
        ));
      } catch (error) {
        console.error('Failed to load map:', error);
        setMapComponent(() => (
          <div className='flex items-center justify-center h-[300px] bg-muted rounded-lg'>
            <p className='text-muted-foreground'>Failed to load map</p>
          </div>
        ));
      }
    };

    loadMap();
  }, [selectedLocation, initialCoordinates]);

  const handleConfirm = () => {
    if (selectedLocation) {
      // Convert to GeoJSON format
      const geoJsonLocation = {
        type: 'Point',
        coordinates: [selectedLocation[1], selectedLocation[0]], // [lng, lat] for GeoJSON
      };
      onLocationSelect(geoJsonLocation);
    }
  };

  if (!MapComponent) {
    return (
      <div className='flex items-center justify-center h-[300px] bg-muted rounded-lg'>
        <p className='text-muted-foreground'>Loading map...</p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Search Interface */}
      <div className='space-y-2'>
        <Label>Search Location</Label>
        <div className='flex space-x-2'>
          <div className='relative flex-1'>
            <SearchIcon
              className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ${
                isSearching ? 'animate-spin' : ''
              }`}
            />
            <Input
              placeholder='Search for address, landmark, or area...'
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                debouncedSearch(e.target.value);
              }}
              onKeyPress={handleKeyPress}
              className='pl-10'
              disabled={isSearching}
            />
          </div>
          <Button
            type='button'
            variant='outline'
            onClick={() => {
              if (searchQuery.trim().length > 2) {
                searchLocation(searchQuery);
              }
            }}
            disabled={isSearching || searchQuery.trim().length <= 2}
            className='px-3'
          >
            <SearchIcon className='h-4 w-4' />
          </Button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className='max-h-40 overflow-y-auto border rounded-lg bg-background'>
            {searchResults.map((result, index) => (
              <div
                key={index}
                className='p-3 hover:bg-muted cursor-pointer border-b last:border-b-0'
                onClick={() => handleSearchResultSelect(result)}
              >
                <div className='flex items-start space-x-2'>
                  <MapPinIcon className='h-4 w-4 text-muted-foreground mt-0.5' />
                  <div>
                    <p className='text-sm font-medium'>{result.display_name}</p>
                    <p className='text-xs text-muted-foreground'>
                      {result.lat}, {result.lon}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      {MapComponent}

      {/* Selected Location Info */}
      {selectedLocation && (
        <div className='p-3 bg-muted rounded-lg space-y-2'>
          <p className='text-sm'>
            <strong>Coordinates:</strong> {selectedLocation[0].toFixed(6)},{' '}
            {selectedLocation[1].toFixed(6)}
          </p>
          {currentAddress && (
            <p className='text-sm'>
              <strong>Address:</strong> {currentAddress}
            </p>
          )}
        </div>
      )}

      <Button
        onClick={handleConfirm}
        disabled={!selectedLocation}
        className='w-full'
      >
        <CheckIcon className='mr-2 h-4 w-4' />
        Confirm Location
      </Button>
    </div>
  );
};

export function LocationPicker({ value, onChange, label = 'Location' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getInitialCoordinates = () => {
    if (!value) return null;

    if (typeof value === 'object' && value.coordinates) {
      const [lng, lat] = value.coordinates;
      return [lat, lng]; // Convert to [lat, lng] for Leaflet
    }

    return null;
  };

  const formatLocationForDisplay = locationData => {
    if (!locationData) return 'Click to select location';

    if (typeof locationData === 'string') {
      return locationData;
    }

    if (typeof locationData === 'object' && locationData.coordinates) {
      const [lng, lat] = locationData.coordinates;
      // Try to get a more readable format
      return `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }

    return 'Invalid location data';
  };

  const handleLocationSelect = location => {
    onChange(location);
    setIsOpen(false);
  };

  if (!isClient) {
    return (
      <div className='space-y-2'>
        <Label>{label}</Label>
        <Input
          value={formatLocationForDisplay(value)}
          readOnly
          placeholder='Click to select location'
          className='cursor-pointer'
          onClick={() => setIsOpen(true)}
        />
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      <Label>{label}</Label>
      <Input
        value={formatLocationForDisplay(value)}
        readOnly
        placeholder='Click to select location'
        className='cursor-pointer'
        onClick={() => setIsOpen(true)}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Select Station Location</DialogTitle>
          </DialogHeader>

          <div className='space-y-4'>
            <p className='text-sm text-muted-foreground'>
              Click on the map to select the station location
            </p>

            <LazyMapPicker
              onLocationSelect={handleLocationSelect}
              initialCoordinates={getInitialCoordinates()}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
