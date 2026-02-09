import { useEffect, useRef, useState } from 'react';
import { YMaps, Map as YandexMap, Placemark, Polyline } from '@pbe/react-yandex-maps';
import type { Attraction, Route } from '../types';

interface MapProps {
  attractions: Attraction[];
  route: Route | null;
  selectedAttraction: Attraction | null;
  onAttractionClick: (attraction: Attraction) => void;
}

export default function Map({ attractions, route, selectedAttraction, onAttractionClick }: MapProps) {
  const [mapState, setMapState] = useState({
    center: [56.3269, 44.0075] as [number, number],
    zoom: 14,
  });
  const ymapsRef = useRef<any>(null);

  useEffect(() => {
    if (selectedAttraction) {
      setMapState({
        center: [selectedAttraction.coordinates.lat, selectedAttraction.coordinates.lon] as [number, number],
        zoom: 16,
      });
    }
  }, [selectedAttraction]);

  const handlePlacemarkClick = (attraction: Attraction) => {
    onAttractionClick(attraction);
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
          modules={['control.ZoomControl', 'control.FullscreenControl']}
          onLoad={(ymaps) => {
            ymapsRef.current = ymaps;
          }}
        >
          {route && route.polyline.length > 0 && (
            <Polyline
              geometry={route.polyline}
              options={{
                strokeColor: '#0066ff',
                strokeWidth: 4,
                strokeOpacity: 0.8,
              }}
            />
          )}

          {attractions.map((attraction) => (
            <Placemark
              key={attraction.id}
              geometry={[attraction.coordinates.lat, attraction.coordinates.lon]}
              properties={{
                balloonContent: attraction.name,
                hintContent: attraction.name,
              }}
              options={{
                preset: selectedAttraction?.id === attraction.id ? 'islands#blueIcon' : 'islands#grayIcon',
                iconColor: selectedAttraction?.id === attraction.id ? '#0066ff' : '#999999',
              }}
              onClick={() => handlePlacemarkClick(attraction)}
            />
          ))}
        </YandexMap>
      </YMaps>
    </div>
  );
}
