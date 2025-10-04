import { Alert, AlertDescription } from '@/features/shared/components/ui/alert';
import { Button } from '@/features/shared/components/ui/button';
import { Input } from '@/features/shared/components/ui/input';
import { Label } from '@/features/shared/components/ui/label';
import { AlertCircle, MapPin, Navigation, Search } from 'lucide-react';
import { useState } from 'react';

const LocationInputSection = ({
  userLocation,
  onLocationSelect,
  onGetCurrentLocation,
  loading,
  error,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Use Nominatim API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1&countrycodes=vn&addressdetails=1`
      );
      const results = await response.json();

      if (results.length > 0) {
        const result = results[0];
        const location = {
          type: 'Point',
          coordinates: [parseFloat(result.lon), parseFloat(result.lat)],
          address: result.display_name,
        };
        onLocationSelect(location);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className='space-y-4 p-6 bg-muted/30 rounded-lg border'>
      <div className='flex items-center gap-2 mb-4'>
        <MapPin className='h-5 w-5 text-primary' />
        <h2 className='text-lg font-semibold'>Find Vehicles Near You</h2>
      </div>

      {/* Current Location Button */}
      <div className='flex flex-col sm:flex-row gap-3'>
        <Button
          onClick={onGetCurrentLocation}
          disabled={loading}
          className='flex items-center gap-2'
          variant={userLocation ? 'default' : 'outline'}
        >
          <Navigation className='h-4 w-4' />
          {loading ? 'Getting Location...' : 'Use Current Location'}
        </Button>

        {userLocation && (
          <div className='flex-1'>
            <Label className='text-sm text-muted-foreground'>
              Current Location:
            </Label>
            <p className='text-sm font-medium'>
              {userLocation.address ||
                `${userLocation.coordinates[1].toFixed(
                  4
                )}, ${userLocation.coordinates[0].toFixed(4)}`}
            </p>
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className='space-y-2'>
        <Label htmlFor='location-search'>Or search for a location:</Label>
        <div className='flex gap-2'>
          <Input
            id='location-search'
            placeholder='Enter address, city, or landmark...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className='flex-1'
          />
          <Button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            variant='outline'
            size='icon'
          >
            <Search className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Location Status */}
      {userLocation && (
        <div className='text-sm text-muted-foreground'>
          ✓ Location set successfully
        </div>
      )}
    </div>
  );
};

export default LocationInputSection;
