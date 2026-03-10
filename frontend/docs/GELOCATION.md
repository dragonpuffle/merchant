# Geolocation Functionality Documentation

## Overview

This document describes the geolocation functionality implemented for the merchant application. The feature provides high-accuracy GPS location tracking with comprehensive permission handling, error management, and battery-efficient lifecycle management.

## Architecture

### Components

1. **GeolocationService** (`frontend/src/services/geolocation.ts`)
   - Core service managing GPS location tracking
   - Handles permission requests and GPS state validation
   - Manages location update listeners
   - Provides battery-efficient lifecycle management

2. **UserLocationMarker** (`frontend/src/components/UserLocationMarker.tsx`)
   - Displays user's current position on the map
   - Renders accuracy radius circle
   - Provides custom marker design

3. **CenterOnUserButton** (`frontend/src/components/UserLocationMarker.tsx`)
   - Floating button to center map on user location
   - Shows loading state during location requests
   - Provides visual feedback

4. **GeolocationNotification** (`frontend/src/components/GeolocationNotification.tsx`)
   - Displays user-friendly notifications
   - Shows permission requests
   - Displays error messages
   - Provides action buttons for user interaction

## Features

### 1. Permission Handling

The geolocation service automatically requests permissions when needed:

```typescript
// Request permission
await geolocationService.requestPermission();
```

**Permission States:**
- `idle` - No action taken
- `requesting_permission` - Permission request in progress
- `active` - Permission granted and tracking active
- `paused` - Tracking paused
- `error` - Error occurred
- `disabled` - GPS disabled on device

### 2. GPS State Validation

The service validates GPS availability before attempting to track:

```typescript
// Check if GPS is enabled
const isEnabled = geolocationService.getState().isGPSEnabled;
```

**Validation Logic:**
- Checks if geolocation API is supported
- Verifies GPS is enabled on the device
- Tests GPS functionality with quick position request
- Provides clear error messages for GPS issues

### 3. Location Updates

The service provides real-time location updates:

```typescript
// Start watching location
await geolocationService.startWatching({
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 5000
});

// Stop watching
geolocationService.stopWatching();
```

**Update Configuration:**
- `enableHighAccuracy: true` - Uses GPS for high accuracy
- `timeout: 10000` - 10 second timeout for position requests
- `maximumAge: 5000` - Accepts positions up to 5 seconds old

### 4. Custom Marker

The user location marker includes:

- **Position Marker**: Blue dot indicating current location
- **Accuracy Circle**: Semi-transparent circle showing GPS accuracy radius
- **Visual Feedback**: Updates smoothly when position changes

**Accuracy Circle:**
- Color: Blue (#4A90E2)
- Fill opacity: 15%
- Stroke opacity: 50%
- Radius: Converted from GPS accuracy in meters to degrees

### 5. Camera Control

The center-on-user button provides:

- **Floating Button**: Positioned in bottom-right corner
- **Click to Center**: Instantly centers map on user location
- **Loading State**: Shows spinner during location requests
- **Visual Feedback**: Hover and active states

### 6. Error Handling

Comprehensive error handling for all scenarios:

**Error Types:**
- `PERMISSION_DENIED` - User denied location access
- `POSITION_UNAVAILABLE` - Cannot determine position
- `TIMEOUT` - Position request timed out
- `UNKNOWN` - Other errors

**User Messages:**
- Clear, actionable error descriptions
- Context-aware notifications
- Action buttons for resolution

### 7. Battery Efficiency

Lifecycle management to prevent unnecessary battery drain:

```typescript
// Automatic cleanup on component unmount
useEffect(() => {
  geoState.startWatching();
  return () => {
    geoState.stopWatching();
  };
}, []);
```

**Optimizations:**
- Stops tracking when not needed
- Uses reasonable timeout values
- Accepts cached positions when appropriate
- Cleans up listeners on unmount

## Usage

### Basic Usage

The geolocation is automatically activated when the Map component mounts:

```typescript
import Map from './components/Map';

// Geolocation starts automatically
<Map
  attractions={attractions}
  route={route}
  routeAttractions={routeAttractions}
  selectedAttraction={selectedAttraction}
  onAttractionClick={handleAttractionClick}
/>
```

### Manual Control

You can manually control geolocation:

```typescript
import { geolocationService } from './services/geolocation';

// Request permission
await geolocationService.requestPermission();

// Start tracking
await geolocationService.startWatching();

// Get current position once
const position = await geolocationService.getCurrentPosition();

// Stop tracking
geolocationService.stopWatching();

// Get current state
const state = geolocationService.getState();
```

### React Hook

Use the provided hook for React components:

```typescript
import { useGeolocation } from './services/geolocation';

function MyComponent() {
  const geoState = useGeolocation();
  
  return (
    <div>
      {geoState.position && (
        <p>
          Latitude: {geoState.position.latitude}<br/>
          Longitude: {geoState.position.longitude}<br/>
          Accuracy: {geoState.position.accuracy}m
        </p>
      )}
    </div>
  );
}
```

## API Reference

### GeolocationService

#### Methods

##### `isSupported(): boolean`
Checks if geolocation is supported by the browser.

##### `requestPermission(): Promise<boolean>`
Requests geolocation permission from the user.
Returns `true` if permission granted, `false` otherwise.

##### `startWatching(options?: Partial<GeolocationOptions>): Promise<void>`
Starts watching for location updates.
- `options.enableHighAccuracy` - Use GPS for high accuracy (default: true)
- `options.timeout` - Timeout in milliseconds (default: 10000)
- `options.maximumAge` - Maximum age of cached position in milliseconds (default: 5000)

##### `stopWatching(): void`
Stops watching for location updates.

##### `getCurrentPosition(options?: Partial<GeolocationOptions>): Promise<GeolocationPosition | null>`
Gets current position once.
Returns position object or `null` if error.

##### `getState(): GeolocationState`
Returns current geolocation state.

##### `subscribe(listener: (state: GeolocationState) => void): () => void`
Subscribes to state changes.
Returns unsubscribe function.

##### `destroy(): void`
Cleans up service state and stops all tracking.

### Types

#### `GeolocationPosition`
```typescript
interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}
```

#### `GeolocationError`
```typescript
interface GeolocationError {
  code: number;
  message: string;
  type: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNKNOWN';
}
```

#### `GeolocationState`
```typescript
interface GeolocationState {
  status: GeolocationStatus;
  position: GeolocationPosition | null;
  error: GeolocationError | null;
  isGPSEnabled: boolean;
}
```

#### `GeolocationStatus`
```typescript
type GeolocationStatus = 
  | 'idle' 
  | 'requesting_permission' 
  | 'active' 
  | 'paused' 
  | 'error' 
  | 'disabled';
```

## Error Messages

### Permission Denied
```
Доступ к геолокации запрещен. Разрешите доступ в настройках браузера.
```

### GPS Disabled
```
GPS отключен на вашем устройстве. Включите геолокацию в настройках.
```

### Position Unavailable
```
Не удалось определить местоположение. Проверьте сигнал GPS.
```

### Timeout
```
Время ожидания определения местоположения истекло.
```

### Not Supported
```
Геолокация не поддерживается вашим браузером.
```

## Browser Compatibility

The geolocation feature requires:

- **Geolocation API**: Supported in all modern browsers
- **HTTPS**: Required for geolocation in production
- **User Permission**: Requires user consent

**Supported Browsers:**
- Chrome 5+
- Firefox 3.5+
- Safari 5+
- Edge 12+
- Opera 16+

## Performance Considerations

### Battery Usage

The implementation is optimized for battery efficiency:

1. **High Accuracy Only When Needed**: Uses GPS only when high accuracy is required
2. **Reasonable Timeouts**: 10-second timeout prevents excessive battery drain
3. **Cached Positions**: Accepts positions up to 5 seconds old
4. **Automatic Cleanup**: Stops tracking when not needed

### Memory Usage

- Single service instance shared across components
- Efficient listener management
- Automatic cleanup on unmount

## Testing

### Manual Testing

1. **Permission Flow**:
   - Open application
   - Grant/deny permission
   - Verify notification appears

2. **Location Updates**:
   - Move device
   - Verify marker updates
   - Check accuracy circle

3. **Error Handling**:
   - Disable GPS
   - Verify error notification
   - Re-enable GPS
   - Verify tracking resumes

4. **Center Button**:
   - Click center button
   - Verify map centers on user
   - Check loading state

### Automated Testing

```typescript
// Example test
describe('GeolocationService', () => {
  it('should request permission', async () => {
    const granted = await geolocationService.requestPermission();
    expect(granted).toBe(true);
  });

  it('should start watching', async () => {
    await geolocationService.startWatching();
    const state = geolocationService.getState();
    expect(state.status).toBe('active');
  });
});
```

## Troubleshooting

### Location Not Updating

**Possible Causes:**
- GPS signal weak
- Permission denied
- GPS disabled

**Solutions:**
- Check GPS is enabled
- Verify permission granted
- Move to area with better signal
- Check browser console for errors

### High Battery Usage

**Possible Causes:**
- Tracking enabled continuously
- High accuracy mode always on

**Solutions:**
- Stop tracking when not needed
- Reduce update frequency
- Use cached positions when possible

### Accuracy Circle Too Large

**Possible Causes:**
- Weak GPS signal
- Indoor location
- Interference

**Solutions:**
- Move outdoors
- Wait for better signal
- Check GPS settings

## Future Enhancements

Potential improvements:

1. **Background Tracking**: Continue tracking when app is in background
2. **Geofencing**: Alert when entering/leaving areas
3. **Location History**: Store and display location history
4. **Offline Support**: Cache locations for offline use
5. **Custom Accuracy Levels**: Allow users to adjust accuracy vs battery tradeoff

## Contributing

When modifying geolocation functionality:

1. Test on multiple devices
2. Verify battery efficiency
3. Check error handling
4. Update documentation
5. Add tests for new features

## License

This geolocation implementation is part of the merchant application project.
