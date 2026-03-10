/**
 * Geolocation Service
 * 
 * Provides high-accuracy GPS location tracking with:
 * - Permission request handling
 * - GPS state validation
 * - Location update listeners
 * - Battery-efficient lifecycle management
 * - Error handling and user notifications
 */

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

// Native browser Geolocation types
interface NativeGeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

export interface GeolocationError {
  code: number;
  message: string;
  type: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNKNOWN';
}

export interface GeolocationOptions {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
}

export type GeolocationStatus = 
  | 'idle' 
  | 'requesting_permission' 
  | 'active' 
  | 'paused' 
  | 'error' 
  | 'disabled';

export interface GeolocationState {
  status: GeolocationStatus;
  position: GeolocationPosition | null;
  error: GeolocationError | null;
  isGPSEnabled: boolean;
}

/**
 * Geolocation Service Class
 * Manages GPS location tracking with proper lifecycle and error handling
 */
class GeolocationService {
  private watchId: number | null = null;
  private currentPosition: GeolocationPosition | null = null;
  private currentError: GeolocationError | null = null;
  private status: GeolocationStatus = 'idle';
  private listeners: Set<(state: GeolocationState) => void> = new Set();
  private isGPSEnabled: boolean = true;
  
  // Default options for high-accuracy tracking
  private readonly defaultOptions: GeolocationOptions = {
    enableHighAccuracy: true,
    timeout: 10000, // 10 seconds
    maximumAge: 5000, // Accept positions up to 5 seconds old
  };

  /**
   * Subscribe to geolocation state changes
   * @param listener Callback function to receive state updates
   * @returns Unsubscribe function
   */
  subscribe(listener: (state: GeolocationState) => void): () => void {
    this.listeners.add(listener);
    
    // Immediately call with current state
    listener(this.getState());
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get current geolocation state
   */
  getState(): GeolocationState {
    return {
      status: this.status,
      position: this.currentPosition,
      error: this.currentError,
      isGPSEnabled: this.isGPSEnabled,
    };
  }

  /**
   * Check if geolocation is supported by the browser
   */
  isSupported(): boolean {
    return 'geolocation' in navigator && navigator.geolocation !== null;
  }

  /**
   * Check if GPS is enabled on the device
   * Note: This is a heuristic check as browsers don't provide direct GPS status
   */
  private async checkGPSEnabled(): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    return new Promise((resolve) => {
      // Try to get position with very short timeout
      navigator.geolocation.getCurrentPosition(
        () => {
          this.isGPSEnabled = true;
          resolve(true);
        },
        (error) => {
          // TIMEOUT or POSITION_UNAVAILABLE typically means GPS is disabled
          this.isGPSEnabled = error.code !== error.PERMISSION_DENIED;
          resolve(this.isGPSEnabled);
        },
        {
          enableHighAccuracy: true,
          timeout: 2000, // Very short timeout for quick check
          maximumAge: 0,
        }
      );
    });
  }

  /**
   * Request geolocation permission
   * @returns Promise that resolves to true if permission granted
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      this.setError({
        code: 0,
        message: 'Геолокация не поддерживается вашим браузером',
        type: 'UNKNOWN',
      });
      return false;
    }

    this.setStatus('requesting_permission');

    try {
      // Check GPS status first
      await this.checkGPSEnabled();
      
      if (!this.isGPSEnabled) {
        this.setError({
          code: 2,
          message: 'GPS отключен на вашем устройстве. Включите геолокацию в настройках.',
          type: 'POSITION_UNAVAILABLE',
        });
        return false;
      }

      // Request permission by getting current position
      await new Promise<void>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve(),
          (error) => {
            this.handleGeolocationError(error);
            reject(error);
          },
          this.defaultOptions
        );
      });

      this.setStatus('idle');
      return true;
    } catch (error) {
      this.setStatus('error');
      return false;
    }
  }

  /**
   * Start watching position updates
   * @param options Optional geolocation options
   */
  async startWatching(options?: Partial<GeolocationOptions>): Promise<void> {
    if (!this.isSupported()) {
      this.setError({
        code: 0,
        message: 'Геолокация не поддерживается вашим браузером',
        type: 'UNKNOWN',
      });
      return;
    }

    // If already watching, do nothing
    if (this.watchId !== null) {
      return;
    }

    // Check permission first
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      return;
    }

    this.setStatus('active');
    this.clearError();

    // Merge options with defaults
    const watchOptions: GeolocationOptions = {
      ...this.defaultOptions,
      ...options,
    };

    // Start watching position
    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.handlePositionUpdate(position),
      (error) => this.handleGeolocationError(error),
      watchOptions
    );
  }

  /**
   * Stop watching position updates
   */
  stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.setStatus('paused');
    }
  }

  /**
   * Get current position once (one-time request)
   * @param options Optional geolocation options
   */
  async getCurrentPosition(options?: Partial<GeolocationOptions>): Promise<GeolocationPosition | null> {
    if (!this.isSupported()) {
      this.setError({
        code: 0,
        message: 'Геолокация не поддерживается вашим браузером',
        type: 'UNKNOWN',
      });
      return null;
    }

    try {
      const position = await new Promise<NativeGeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos as NativeGeolocationPosition),
          (error) => {
            this.handleGeolocationError(error);
            reject(error);
          },
          {
            ...this.defaultOptions,
            ...options,
          }
        );
      });

      return this.mapNativePosition(position);
    } catch (error) {
      return null;
    }
  }

  /**
   * Handle successful position update
   */
  private handlePositionUpdate(position: NativeGeolocationPosition): void {
    this.currentPosition = this.mapNativePosition(position);
    this.clearError();
    this.setStatus('active');
    this.notifyListeners();
  }

  /**
   * Handle geolocation error
   */
  private handleGeolocationError(error: GeolocationPositionError): void {
    const geoError = this.mapNativeError(error);
    this.setError(geoError);
    this.setStatus('error');
    
    // Stop watching on permission denied
    if (geoError.type === 'PERMISSION_DENIED') {
      this.stopWatching();
    }
  }

  /**
   * Map native GeolocationPosition to our interface
   */
  private mapNativePosition(position: NativeGeolocationPosition): GeolocationPosition {
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      altitudeAccuracy: position.coords.altitudeAccuracy,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: position.timestamp,
    };
  }

  /**
   * Map native GeolocationPositionError to our interface
   */
  private mapNativeError(error: GeolocationPositionError): GeolocationError {
    let type: GeolocationError['type'] = 'UNKNOWN';
    let message = error.message;

    switch (error.code) {
      case error.PERMISSION_DENIED:
        type = 'PERMISSION_DENIED';
        message = 'Доступ к геолокации запрещен. Разрешите доступ в настройках браузера.';
        break;
      case error.POSITION_UNAVAILABLE:
        type = 'POSITION_UNAVAILABLE';
        message = 'Не удалось определить местоположение. Проверьте сигнал GPS.';
        break;
      case error.TIMEOUT:
        type = 'TIMEOUT';
        message = 'Время ожидания определения местоположения истекло.';
        break;
    }

    return {
      code: error.code,
      message,
      type,
    };
  }

  /**
   * Set status and notify listeners
   */
  private setStatus(status: GeolocationStatus): void {
    this.status = status;
    this.notifyListeners();
  }

  /**
   * Set error and notify listeners
   */
  private setError(error: GeolocationError): void {
    this.currentError = error;
    this.notifyListeners();
  }

  /**
   * Clear error and notify listeners
   */
  private clearError(): void {
    this.currentError = null;
    this.notifyListeners();
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (error) {
        console.error('Error in geolocation listener:', error);
      }
    });
  }

  /**
   * Cleanup and reset service state
   */
  destroy(): void {
    this.stopWatching();
    this.currentPosition = null;
    this.currentError = null;
    this.status = 'idle';
    this.listeners.clear();
  }
}

// Export singleton instance
export const geolocationService = new GeolocationService();

// Export convenience hooks for React components
export function useGeolocation() {
  const [state, setState] = React.useState<GeolocationState>(geolocationService.getState());

  React.useEffect(() => {
    const unsubscribe = geolocationService.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    ...state,
    startWatching: geolocationService.startWatching.bind(geolocationService),
    stopWatching: geolocationService.stopWatching.bind(geolocationService),
    getCurrentPosition: geolocationService.getCurrentPosition.bind(geolocationService),
    requestPermission: geolocationService.requestPermission.bind(geolocationService),
    isSupported: geolocationService.isSupported.bind(geolocationService),
  };
}

// Import React for the hook
import React from 'react';
