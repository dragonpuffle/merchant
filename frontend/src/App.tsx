import { useEffect, useState } from 'react';
import { api, ApiError } from './services/api';
import { initTelegramWebApp, applyTelegramTheme, onThemeChange } from './utils/telegram';
import Map from './components/Map';
import AttractionCard from './components/AttractionCard';
import RouteSelection from './components/RouteSelection';
import type { Attraction, Route } from './types';

type AppView = 'route-selection' | 'map-view';

function App() {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
  const [currentAttractionIndex, setCurrentAttractionIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('route-selection');

  useEffect(() => {
    // Initialize Telegram WebApp
    initTelegramWebApp();
    applyTelegramTheme();

    // Handle theme changes
    const handleThemeChange = () => {
      applyTelegramTheme();
    };
    onThemeChange(handleThemeChange);

    return () => {
      onThemeChange(handleThemeChange);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch attractions
        const attractionsData = await api.getAttractions();
        setAttractions(attractionsData);

        // Fetch routes
        const routesData = await api.getRoutes();
        setRoutes(routesData);

        setLoading(false);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(`Ошибка: ${err.detail}`);
        } else {
          setError('Произошла ошибка при загрузке данных');
        }
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRouteSelect = (route: Route) => {
    setSelectedRoute(route);
    setCurrentView('map-view');
    
    // Get the first attraction of the route
    const firstAttraction = attractions.find(a => route.attraction_ids.includes(a.id));
    if (firstAttraction) {
      setSelectedAttraction(firstAttraction);
      setCurrentAttractionIndex(0);
    }
  };

  const handleAttractionClick = (attraction: Attraction) => {
    setSelectedAttraction(attraction);
    
    // Update current index if it's part of the selected route
    if (selectedRoute) {
      const index = selectedRoute.attraction_ids.indexOf(attraction.id);
      if (index !== -1) {
        setCurrentAttractionIndex(index);
      }
    }
  };

  const handleCloseCard = () => {
    setSelectedAttraction(null);
  };

  const handleNextPoint = () => {
    if (!selectedRoute || currentAttractionIndex >= selectedRoute.attraction_ids.length - 1) {
      return;
    }

    const nextAttractionId = selectedRoute.attraction_ids[currentAttractionIndex + 1];
    const nextAttraction = attractions.find(a => a.id === nextAttractionId);
    
    if (nextAttraction) {
      setSelectedAttraction(nextAttraction);
      setCurrentAttractionIndex(currentAttractionIndex + 1);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (currentView === 'route-selection') {
    return <RouteSelection routes={routes} onSelectRoute={handleRouteSelect} />;
  }

  const routeAttractions = selectedRoute 
    ? attractions.filter(a => selectedRoute.attraction_ids.includes(a.id))
    : [];

  return (
    <div className="container">
      <Map
        attractions={attractions}
        route={selectedRoute}
        routeAttractions={routeAttractions}
        selectedAttraction={selectedAttraction}
        onAttractionClick={handleAttractionClick}
      />
      <AttractionCard
        attraction={selectedAttraction}
        onClose={handleCloseCard}
        onNextPoint={handleNextPoint}
        hasNextPoint={selectedRoute ? currentAttractionIndex < selectedRoute.attraction_ids.length - 1 : false}
        currentPointNumber={currentAttractionIndex + 1}
        totalPoints={selectedRoute ? selectedRoute.attraction_ids.length : 0}
      />
    </div>
  );
}

export default App;
