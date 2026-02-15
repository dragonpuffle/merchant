import { useState } from 'react';
import type { Route } from '../types';

interface RouteSelectionProps {
  routes: Route[];
  onSelectRoute: (route: Route) => void;
}

export default function RouteSelection({ routes, onSelectRoute }: RouteSelectionProps) {
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  const handleRouteSelect = (route: Route) => {
    setSelectedRouteId(route.id);
  };

  const handleStart = () => {
    if (selectedRouteId) {
      const selectedRoute = routes.find(r => r.id === selectedRouteId);
      if (selectedRoute) {
        onSelectRoute(selectedRoute);
      }
    }
  };

  return (
    <div className="route-selection">
      <div className="route-selection-content">
        <h1 className="route-selection-title">Выберите маршрут</h1>
        
        <div className="routes-list">
          {routes.map((route, index) => (
            <div
              key={route.id}
              className={`route-card ${selectedRouteId === route.id ? 'selected' : ''}`}
              onClick={() => handleRouteSelect(route)}
            >
              <div className="route-card-number">{index + 1}</div>
              <div className="route-card-content">
                <h3 className="route-card-name">{route.name}</h3>
                <p className="route-card-description">{route.description}</p>
              </div>
              <div className="route-card-indicator">
                {selectedRouteId === route.id && <span className="checkmark">✓</span>}
              </div>
            </div>
          ))}
        </div>

        <button
          className="start-button"
          onClick={handleStart}
          disabled={!selectedRouteId}
        >
          Начать маршрут
        </button>
      </div>
    </div>
  );
}
