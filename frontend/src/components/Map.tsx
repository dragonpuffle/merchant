import { useEffect, useRef, useState } from 'react';
import { YMaps, Map as YandexMap, Placemark, Polyline } from '@pbe/react-yandex-maps';
import type { Attraction, Route } from '../types';

interface MapProps {
  attractions: Attraction[];
  route: Route | null;
  routeAttractions: Attraction[];
  selectedAttraction: Attraction | null;
  onAttractionClick: (attraction: Attraction) => void;
  isCustomRoute?: boolean;
}

export default function Map({ attractions, route, routeAttractions, selectedAttraction, onAttractionClick, isCustomRoute: _isCustomRoute = false }: MapProps) {
  const [mapState, setMapState] = useState({
    center: [56.3269, 44.0075] as [number, number],
    zoom: 14,
  });
  const [pedestrianRoute, setPedestrianRoute] = useState<[number, number][] | null>(null);
  const ymapsRef = useRef<any>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (selectedAttraction) {
      setMapState({
        center: [selectedAttraction.coordinates.lat, selectedAttraction.coordinates.lon] as [number, number],
        zoom: 16,
      });
    }
  }, [selectedAttraction]);

  useEffect(() => {
    if (route && routeAttractions.length > 1 && ymapsRef.current) {
      buildPedestrianRoute();
    }
  }, [route, routeAttractions, ymapsRef.current]);

  const buildPedestrianRoute = async () => {
    if (!ymapsRef.current || routeAttractions.length < 2) return;

    try {
      const ymaps = ymapsRef.current;
      const multiRoute = new ymaps.multiRouter.MultiRoute({
        referencePoints: routeAttractions.map(a => [a.coordinates.lat, a.coordinates.lon]),
        params: {
          routingMode: 'pedestrian',
          results: 1
        }
      }, {
        boundsAutoApply: true
      });

      // Wait for route to be built
      multiRoute.model.events.add('requestsuccess', () => {
        const activeRoute = multiRoute.getActiveRoute();
        if (activeRoute) {
          const geometry = activeRoute.geometry.getCoordinates();
          setPedestrianRoute(geometry);
        }
      });

      multiRoute.model.events.add('requestfail', (e: any) => {
        console.error('Route building failed:', e);
      });
    } catch (error) {
      console.error('Error building pedestrian route:', error);
    }
  };

  const handlePlacemarkClick = (attraction: Attraction) => {
    onAttractionClick(attraction);
  };

  const handleMapLoad = (ymaps: any) => {
    ymapsRef.current = ymaps;
  };

  return (
    <div className="map-container">
      <YMaps
        query={{ apikey: import.meta.env.VITE_YANDEX_MAPS_API_KEY || '' }}
        enterprise={false}
        version="2.1"
      >
        <YandexMap
          state={mapState}
          width="100%"
          height="100%"
          modules={['control.ZoomControl', 'control.FullscreenControl', 'multiRouter.MultiRoute']}
          onLoad={handleMapLoad}
          instanceRef={(ref) => { mapRef.current = ref; }}
        >
          {/* Display pedestrian route if available, otherwise fall back to polyline */}
          {pedestrianRoute && pedestrianRoute.length > 0 && (
            <Polyline
              geometry={pedestrianRoute}
              options={{
                strokeColor: '#0066ff',
                strokeWidth: 4,
                strokeOpacity: 0.8,
              }}
            />
          )}

          {!pedestrianRoute && route && route.polyline.length > 0 && (
            <Polyline
              geometry={route.polyline}
              options={{
                strokeColor: '#0066ff',
                strokeWidth: 4,
                strokeOpacity: 0.8,
              }}
            />
          )}

          {attractions.map((attraction) => {
            const isRouteAttraction = route?.attraction_ids.includes(attraction.id);
            return (
              <Placemark
                key={attraction.id}
                geometry={[attraction.coordinates.lat, attraction.coordinates.lon]}
                properties={{
                  balloonContent: attraction.name,
                  hintContent: attraction.name,
                }}
                options={{
                  preset: selectedAttraction?.id === attraction.id 
                    ? 'islands#blueIcon' 
                    : isRouteAttraction 
                      ? 'islands#circleIcon' 
                      : 'islands#grayIcon',
                  iconColor: selectedAttraction?.id === attraction.id 
                    ? '#0066ff' 
                    : isRouteAttraction 
                      ? '#ff6b6b' 
                      : '#999999',
                  iconContentSize: isRouteAttraction ? [32, 32] : [26, 26],
                }}
                onClick={() => handlePlacemarkClick(attraction)}
              />
            );
          })}
        </YandexMap>
      </YMaps>
    </div>
  );
}
