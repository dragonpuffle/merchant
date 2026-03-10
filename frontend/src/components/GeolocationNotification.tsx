/**
 * Geolocation Notification Component
 * 
 * Displays user-friendly notifications for geolocation:
 * - Permission requests
 * - Error messages
 * - Status updates
 * - GPS availability warnings
 */

import { useEffect, useState } from 'react';
import type { GeolocationError, GeolocationStatus } from '../services/geolocation';

interface GeolocationNotificationProps {
  status: GeolocationStatus;
  error: GeolocationError | null;
  isGPSEnabled: boolean;
  onRequestPermission?: () => void;
  onDismiss?: () => void;
}

/**
 * GeolocationNotification Component
 * 
 * Shows contextual notifications based on geolocation state
 */
export default function GeolocationNotification({
  status,
  error,
  isGPSEnabled,
  onRequestPermission,
  onDismiss,
}: GeolocationNotificationProps) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'error'>('info');

  // Update notification based on status and error
  useEffect(() => {
    let showNotification = false;
    let notificationMessage = '';
    let notificationType: 'info' | 'warning' | 'error' = 'info';

    switch (status) {
      case 'requesting_permission':
        showNotification = true;
        notificationMessage = 'Запрашиваем доступ к геолокации...';
        notificationType = 'info';
        break;

      case 'active':
        showNotification = false;
        break;

      case 'paused':
        showNotification = false;
        break;

      case 'error':
        if (error) {
          showNotification = true;
          notificationMessage = error.message;
          notificationType = 'error';
        }
        break;

      case 'disabled':
        showNotification = true;
        notificationMessage = 'Геолокация отключена на вашем устройстве';
        notificationType = 'warning';
        break;

      case 'idle':
      default:
        showNotification = false;
        break;
    }

    // Additional GPS check
    if (!isGPSEnabled && status !== 'error') {
      showNotification = true;
      notificationMessage = 'GPS отключен. Включите геолокацию в настройках устройства.';
      notificationType = 'warning';
    }

    setVisible(showNotification);
    setMessage(notificationMessage);
    setType(notificationType);
  }, [status, error, isGPSEnabled]);

  if (!visible) {
    return null;
  }

  // Determine if action button should be shown
  const showActionButton = status === 'idle' || (type === 'warning' as const);
  const actionButtonText = (type === 'warning' as const) ? 'Настройки' : 'Разрешить доступ';

  const getBackgroundColor = () => {
    switch (type) {
      case 'error':
        return 'rgba(220, 53, 69, 0.95)';
      case 'warning':
        return 'rgba(255, 193, 7, 0.95)';
      case 'info':
      default:
        return 'rgba(73, 144, 226, 0.95)';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return '⚠️';
      case 'warning':
        return '📍';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const isWarning = type === 'warning';

  return (
    <div
      className="geolocation-notification"
      style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: '90%',
        width: 'auto',
        minWidth: '300px',
        backgroundColor: getBackgroundColor(),
        color: isWarning ? '#000' : '#fff',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        animation: 'slideDown 0.3s ease-out',
      }}
    >
      {/* Icon */}
      <span
        style={{
          fontSize: '24px',
          flexShrink: 0,
          marginTop: '2px',
        }}
      >
        {getIcon()}
      </span>

      {/* Content */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: '14px',
            lineHeight: '1.4',
            fontWeight: 500,
          }}
        >
          {message}
        </p>

        {/* Action buttons */}
        {showActionButton && (
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginTop: '12px',
            }}
          >
            {onRequestPermission && (
              <button
                onClick={onRequestPermission}
                style={{
                  backgroundColor: isWarning ? '#000' : '#fff',
                  color: isWarning ? '#fff' : '#4A90E2',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                {actionButtonText}
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                style={{
                  backgroundColor: 'transparent',
                  color: isWarning ? '#000' : '#fff',
                  border: isWarning ? '1px solid rgba(0,0,0,0.3)' : '1px solid rgba(255,255,255,0.5)',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                Закрыть
              </button>
            )}
          </div>
        )}
      </div>

      {/* Dismiss button (X) */}
      {onDismiss && !showActionButton && (
        <button
          onClick={onDismiss}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: isWarning ? '#000' : '#fff',
            cursor: 'pointer',
            padding: '4px',
            fontSize: '18px',
            lineHeight: '1',
            opacity: 0.7,
            transition: 'opacity 0.2s',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.7';
          }}
        >
          ✕
        </button>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
