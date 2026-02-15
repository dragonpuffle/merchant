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

export default function Map({
  attractions,
  route,
  routeAttractions,
  selectedAttraction,
  onAttractionClick,
  isCustomRoute: _isCustomRoute = false,
}: MapProps) {
  const [mapState, setMapState] = useState({
    center: [56.3269, 44.0075] as [number, number],
    zoom: 14,
  });

  // Состояние для запасной линии, если построение маршрута не удалось
  const [fallbackPolyline, setFallbackPolyline] = useState<[number, number][] | null>(null);

  // Состояния для API и экземпляра карты
  const [ymaps, setYmaps] = useState<any>(null);
  const [map, setMap] = useState<any>(null);

  // Ссылка на текущий объект мультимаршрута
  const multiRouteRef = useRef<any>(null);

  // Центрирование карты при выборе достопримечательности
  useEffect(() => {
    if (selectedAttraction) {
      setMapState({
        center: [selectedAttraction.coordinates.lat, selectedAttraction.coordinates.lon] as [number, number],
        zoom: 16,
      });
    }
  }, [selectedAttraction]);

  // Сброс fallback-линии при смене маршрута
  useEffect(() => {
    setFallbackPolyline(null);
  }, [route, routeAttractions]);

  // Управление маршрутом: создание, обновление, удаление
  useEffect(() => {
    if (!ymaps || !map) return;

    // Если точек меньше двух – удаляем маршрут с карты
    if (routeAttractions.length < 2) {
      if (multiRouteRef.current) {
        map.geoObjects.remove(multiRouteRef.current);
        multiRouteRef.current = null;
      }
      return;
    }

    const points = routeAttractions.map(
      (a) => [a.coordinates.lat, a.coordinates.lon] as [number, number]
    );

    // Если маршрут уже существует – просто обновляем точки
    if (multiRouteRef.current) {
      try {
        multiRouteRef.current.model.setReferencePoints(points);
      } catch (error) {
        console.error('Failed to update route points:', error);
        // В случае ошибки пересоздадим маршрут
        map.geoObjects.remove(multiRouteRef.current);
        multiRouteRef.current = null;
      }
    }

    // Если маршрута нет или он был удалён – создаём новый
    if (!multiRouteRef.current) {
      const multiRoute = new ymaps.multiRouter.MultiRoute(
        {
          referencePoints: points,
          params: {
            routingMode: 'pedestrian', // пешеходный маршрут, как в примере
          },
        },
        {
          boundsAutoApply: true, // автоматически подбирать границы карты
          // Настройки внешнего вида линии
          wayPointVisible:false,
          routeWalkMarkerVisible: false,
          routeActiveMarkerVisible: false,
          routeStrokeColor: '#0066ff',
          routeStrokeWidth: 4,
          routeOpacity: 0.8,
        }
      );

      // Обработка успешного построения (можно использовать для сброса fallback)
      multiRoute.model.events.add('requestsuccess', () => {
        setFallbackPolyline(null);
      });

      // Обработка ошибки построения
      multiRoute.model.events.add('requestfail', (error: any) => {
        console.error('Route building failed:', error);
        map.geoObjects.remove(multiRoute);
        // Показываем запасную линию, если она есть
        if (route?.polyline?.length) {
          setFallbackPolyline(route.polyline as [number, number][]);
        }
      });

      map.geoObjects.add(multiRoute);
      multiRouteRef.current = multiRoute;
    }

    // Очистка при размонтировании или смене карты/ymaps
    return () => {
      if (multiRouteRef.current && map) {
        map.geoObjects.remove(multiRouteRef.current);
        multiRouteRef.current = null;
      }
    };
  }, [ymaps, map, routeAttractions, route?.polyline]);

  const handlePlacemarkClick = (attraction: Attraction) => {
    onAttractionClick(attraction);
  };

  const handleMapLoad = (ymapsInstance: any) => {
    setYmaps(ymapsInstance);
  };

  return (
    <div className="map-container">
      <YMaps
        query={{ apikey: import.meta.env.VITE_YANDEX_MAPS_API_KEY || ''}}
        enterprise={false}
        version="2.1"
      >
        <YandexMap
          state={mapState}
          width="100%"
          height="100%"
          modules={['control.ZoomControl', 'control.FullscreenControl', 'multiRouter.MultiRoute']}
          onLoad={handleMapLoad}
          instanceRef={(ref) => setMap(ref)}
        >
          {/* Запасная линия, если построение маршрута не удалось */}
          {fallbackPolyline && fallbackPolyline.length > 0 && (
            <Polyline
              geometry={fallbackPolyline}
              options={{
                strokeColor: '#0066ff',
                strokeWidth: 4,
                strokeOpacity: 0.8,
              }}
            />
          )}

          {/* Если точек маршрута нет, но есть готовая ломаная из route (например, из БД) */}
          {!fallbackPolyline && routeAttractions.length === 0 && route?.polyline?.length > 0 && (
            <Polyline
              geometry={route.polyline}
              options={{
                strokeColor: '#0066ff',
                strokeWidth: 4,
                strokeOpacity: 0.8,
              }}
            />
          )}

          {/* Метки достопримечательностей */}
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
                  preset:
                    selectedAttraction?.id === attraction.id
                      ? 'islands#blueIcon'
                      : isRouteAttraction
                      ? 'islands#circleIcon'
                      : 'islands#grayIcon',
                  iconColor:
                    selectedAttraction?.id === attraction.id
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