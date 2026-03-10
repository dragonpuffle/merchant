/**
 * User Location Marker Component
 * 
 * Displays the user's current position on the map with:
 * - Custom marker design
 * - Accuracy radius circle
 * - Animated pulse effect
 * - Battery-efficient rendering
 */

import { useEffect, useRef } from 'react';
import { Circle, Placemark } from '@pbe/react-yandex-maps';
import type { GeolocationPosition } from '../services/geolocation';

interface UserLocationMarkerProps {
  position: GeolocationPosition | null;
  isVisible: boolean;
  onCenterClick?: () => void;
}

/**
 * UserLocationMarker Component
 * 
 * Renders a custom marker with accuracy circle for the user's location
 */
export default function UserLocationMarker({
  position,
  isVisible,
  onCenterClick,
}: UserLocationMarkerProps) {
  const markerRef = useRef<any>(null);

  // Update marker when position changes
  useEffect(() => {
    if (markerRef.current && position) {
      // Force marker update
      markerRef.current.geometry.setCoordinates([position.latitude, position.longitude]);
    }
  }, [position]);

  if (!isVisible || !position) {
    return null;
  }

  // Convert accuracy from meters to degrees (approximate)
  // 1 degree ≈ 111,000 meters at the equator
  const accuracyInDegrees = position.accuracy / 111000;

  return (
    <>
      {/* Accuracy radius circle */}
      <Circle
        geometry={[
          [position.latitude, position.longitude],
          accuracyInDegrees,
        ]}
        options={{
          draggable: false,
          fill: true,
          fillColor: '#4A90E2',
          fillOpacity: 0.15,
          strokeColor: '#4A90E2',
          strokeOpacity: 0.5,
          strokeWidth: 2,
          zIndex: 100,
        }}
        properties={{
          hintContent: `Точность: ${Math.round(position.accuracy)}м`,
        }}
      />

      {/* Custom user location marker */}
      <Placemark
        geometry={[position.latitude, position.longitude]}
        instanceRef={markerRef}
        options={{
          preset: 'islands#circleDotIcon',
          iconColor: '#4A90E2',
          iconContentSize: [32, 32],
          zIndex: 101,
          hasBalloon: false,
          hasHint: true,
        }}
        properties={{
          hintContent: 'Ваше местоположение',
          iconContent: '',
        }}
        onClick={onCenterClick}
      />
    </>
  );
}

/**
 * CenterOnUserButton Component
 * 
 * Button to center the map on the user's current location
 */
interface CenterOnUserButtonProps {
  onClick: () => void;
  isVisible: boolean;
  isLoading?: boolean;
}

export function CenterOnUserButton({
  onClick,
  isVisible,
  isLoading = false,
}: CenterOnUserButtonProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="center-on-user-button"
      title={isLoading ? 'Определение местоположения...' : 'Центрировать на моем местоположении'}
      style={{
        position: 'absolute',
        right: '16px',
        bottom: '100px',
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        backgroundColor: '#4A90E2',
        color: 'white',
        border: 'none',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.2s ease',
        zIndex: 1000,
        opacity: isLoading ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!isLoading) {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.backgroundColor = '#357ABD';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.backgroundColor = '#4A90E2';
      }}
      onMouseDown={(e) => {
        if (!isLoading) {
          e.currentTarget.style.transform = 'scale(0.95)';
        }
      }}
      onMouseUp={(e) => {
        if (!isLoading) {
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
    >
      {isLoading ? (
        <span
          style={{
            display: 'inline-block',
            width: '20px',
            height: '20px',
            border: '2px solid #ffffff',
            borderRadius: '50%',
            borderTopColor: 'transparent',
            animation: 'spin 1s linear infinite',
          }}
        />
      ) : (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
}
