# Location Components with Leaflet Integration

## Overview

This set of components handles GeoJSON location data using Leaflet maps to provide a better user experience for location-based features.

## Components

### 1. LocationDisplay

**Purpose**: Displays location data in a readable format with map integration.

**Features**:

- Handles both string and GeoJSON location data
- Shows coordinates in a readable format
- "View Map" button to open interactive map
- Fallback for invalid location data

**Usage**:

```jsx
<LocationDisplay location={station.location} stationName={station.name} />
```

### 2. StationMapModal

**Purpose**: Interactive map modal showing station location.

**Features**:

- Leaflet map with OpenStreetMap tiles
- Marker at station location
- Popup with station information
- "Open in Google Maps" button
- Responsive design

**Usage**:

```jsx
<StationMapModal
  open={isMapOpen}
  onOpenChange={setIsMapOpen}
  coordinates={[lat, lng]}
  stationName='Station Name'
/>
```

### 3. LocationPicker

**Purpose**: Map-based location picker for forms.

**Features**:

- **Smart search functionality** - Search for addresses, landmarks, or areas
  - **Debounced search** - Waits 500ms after typing stops
  - **Enter key support** - Press Enter to search immediately
  - **Search button** - Click to search manually
- **Reverse geocoding** - Get address from coordinates
- Interactive map for location selection
- Click to select coordinates
- Converts to GeoJSON format
- Preview of selected coordinates and address
- Form integration
- **Vietnam-focused search** - Optimized for Vietnamese locations

**Usage**:

```jsx
<LocationPicker
  value={formData.location}
  onChange={location => setFormData({ ...formData, location })}
  label='Location *'
/>
```

## Data Formats

### Input Formats Supported:

1. **String**: `"District 1, Ho Chi Minh City"`
2. **GeoJSON Point**:
   ```json
   {
     "type": "Point",
     "coordinates": [106.6297, 10.8231]
   }
   ```

### Output Format:

- **GeoJSON Point** for form submissions
- **Readable coordinates** for display

## Dependencies

- `leaflet`: Map library
- `react-leaflet`: React wrapper for Leaflet
- `lucide-react`: Icons

## CSS Requirements

Leaflet CSS is imported in `src/index.css`:

```css
@import 'leaflet/dist/leaflet.css';
```

## Error Handling

- Graceful fallback for map loading failures
- Validation for location data formats
- Loading states for map components
- SSR compatibility with dynamic imports

## Browser Compatibility

- Modern browsers with ES6+ support
- Mobile responsive design
- Touch-friendly map interactions
