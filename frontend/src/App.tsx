import { useEffect, useState } from 'react';
import { api, ApiError } from './services/api';
import { initTelegramWebApp, applyTelegramTheme, onThemeChange } from './utils/telegram';
import Map from './components/Map';
import AttractionCard from './components/AttractionCard';
import type { Attraction, Route } from './types';

function App() {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [route, setRoute] = useState<Route | null>(null);
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        if (routesData.length > 0) {
          setRoute(routesData[0]);
        }

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

  const handleAttractionClick = (attraction: Attraction) => {
    setSelectedAttraction(attraction);
  };

  const handleCloseCard = () => {
    setSelectedAttraction(null);
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="container">
      <Map
        attractions={attractions}
        route={route}
        selectedAttraction={selectedAttraction}
        onAttractionClick={handleAttractionClick}
      />
      <AttractionCard
        attraction={selectedAttraction}
        onClose={handleCloseCard}
      />
    </div>
  );
}

export default App;
