import { useEffect, useState } from 'react';
import { api, ApiError, normalizeUrl } from './services/api';
import { initTelegramWebApp, applyTelegramTheme, onThemeChange } from './utils/telegram';
import Map from './components/Map';
import AttractionCard from './components/AttractionCard';
import RouteSelection from './components/RouteSelection';
import Rewards from './components/Rewards';
import Settings from './components/Settings';
import CustomRoute from './components/CustomRoute';
import BottomNavigation from './components/BottomNavigation';
import type {
  Attraction,
  Route,
  AppView,
  Reward,
  UserProgress,
  AppSettings
} from './types';

function App() {
  // Data state
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  
  // Navigation state
  const [currentView, setCurrentView] = useState<AppView>('route-selection');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
  const [currentAttractionIndex, setCurrentAttractionIndex] = useState<number>(0);
  const [isCustomRoute, setIsCustomRoute] = useState<boolean>(false);
  
  // Loading and error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // User progress and settings state
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalPoints: 0,
    visitedAttractions: [],
    completedRoutes: [],
    rewardsUnlocked: [],
    currentStreak: 0
  });
  
  const [appSettings, setAppSettings] = useState<AppSettings>({
    notifications: true,
    soundEffects: true,
    autoPlayAudio: false,
    language: 'ru',
    theme: 'auto'
  });
  
  // Mock rewards data
  const [rewards] = useState<Reward[]>([
    {
      id: 'first-visit',
      name: 'Первое посещение',
      description: 'Посетите свою первую достопримечательность',
      icon: '🌟',
      points: 10,
      unlocked: false
    },
    {
      id: 'explorer',
      name: 'Исследователь',
      description: 'Посетите 5 достопримечательностей',
      icon: '🧭',
      points: 50,
      unlocked: false
    },
    {
      id: 'route-master',
      name: 'Мастер маршрутов',
      description: 'Завершите первый готовый маршрут',
      icon: '🏅',
      points: 100,
      unlocked: false
    },
    {
      id: 'streak-3',
      name: '3 дня подряд',
      description: 'Используйте приложение 3 дня подряд',
      icon: '🔥',
      points: 30,
      unlocked: false
    },
    {
      id: 'audio-lover',
      name: 'Меломан',
      description: 'Прослушайте все аудиогиды маршрута',
      icon: '🎧',
      points: 75,
      unlocked: false
    }
  ]);

  // Initialize Telegram WebApp
  useEffect(() => {
    initTelegramWebApp();
    applyTelegramTheme();

    const handleThemeChange = () => {
      applyTelegramTheme();
    };
    onThemeChange(handleThemeChange);

    return () => {
      onThemeChange(handleThemeChange);
    };
  }, []);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const attractionsData = await api.getAttractions();
        // Normalize URLs in attractions data
        const normalizedAttractions = attractionsData.map(attraction => ({
          ...attraction,
          image: normalizeUrl(attraction.image),
          audio_url: normalizeUrl(attraction.audio_url)
        }));
        setAttractions(normalizedAttractions);

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

  // Route selection handler
  const handleRouteSelect = (route: Route) => {
    setSelectedRoute(route);
    setIsCustomRoute(false);
    setCurrentView('map-view');

    const firstAttraction = attractions.find(a => route.attraction_ids.includes(a.id));
    if (firstAttraction) {
      setSelectedAttraction(firstAttraction);
      setCurrentAttractionIndex(0);
    }
  };

  // Custom route start handler
  const handleStartCustomRoute = (startAttraction: Attraction) => {
    setSelectedRoute(null);
    setSelectedAttraction(startAttraction);
    setIsCustomRoute(true);
    setCurrentView('map-view');
  };

  // Attraction click handler
  const handleAttractionClick = (attraction: Attraction) => {
    setSelectedAttraction(attraction);
    
    // Update current index if it's part of the selected route
    if (selectedRoute && !isCustomRoute) {
      const index = selectedRoute.attraction_ids.indexOf(attraction.id);
      if (index !== -1) {
        setCurrentAttractionIndex(index);
      }
    }
    
    // Simulate visiting attraction and updating progress
    if (!userProgress.visitedAttractions.includes(attraction.id)) {
      setUserProgress(prev => ({
        ...prev,
        visitedAttractions: [...prev.visitedAttractions, attraction.id],
        totalPoints: prev.totalPoints + 10
      }));
    }
  };

  // Close attraction card handler
  const handleCloseCard = () => {
    setSelectedAttraction(null);
  };

  // Next point handler (for ready routes)
  const handleNextPoint = () => {
    if (!selectedRoute || isCustomRoute || currentAttractionIndex >= selectedRoute.attraction_ids.length - 1) {
      return;
    }

    const nextAttractionId = selectedRoute.attraction_ids[currentAttractionIndex + 1];
    const nextAttraction = attractions.find(a => a.id === nextAttractionId);
    
    if (nextAttraction) {
      setSelectedAttraction(nextAttraction);
      setCurrentAttractionIndex(currentAttractionIndex + 1);
    }
  };

  // Navigation handler
  const handleViewChange = (view: AppView) => {
    // If navigating away from map view, reset map-related state
    if (currentView === 'map-view' && view !== 'map-view') {
      setSelectedRoute(null);
      setSelectedAttraction(null);
      setIsCustomRoute(false);
    }
    
    setCurrentView(view);
  };

  // Settings change handler
  const handleSettingsChange = (settings: AppSettings) => {
    setAppSettings(settings);
    // In a real app, this would save to localStorage or send to server
    console.log('Settings updated:', settings);
  };

  // Reward click handler
  const handleRewardClick = (reward: Reward) => {
    console.log('Reward clicked:', reward);
    // In a real app, this might show more details or trigger an action
  };

  // Loading state
  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  // Error state
  if (error) {
    return <div className="error">{error}</div>;
  }

  // Route selection view
  if (currentView === 'route-selection') {
    return (
      <>
        <RouteSelection routes={routes} onSelectRoute={handleRouteSelect} />
        <BottomNavigation currentView={currentView} onViewChange={handleViewChange} />
      </>
    );
  }

  // Custom route view
  if (currentView === 'custom-route') {
    return (
      <>
        <CustomRoute 
          attractions={attractions} 
          onStartCustomRoute={handleStartCustomRoute}
          onBack={() => setCurrentView('route-selection')}
        />
        <BottomNavigation currentView={currentView} onViewChange={handleViewChange} />
      </>
    );
  }

  // Rewards view
  if (currentView === 'rewards') {
    return (
      <>
        <Rewards 
          userProgress={userProgress}
          rewards={rewards}
          onRewardClick={handleRewardClick}
          onBack={() => setCurrentView('route-selection')}
        />
        <BottomNavigation currentView={currentView} onViewChange={handleViewChange} />
      </>
    );
  }

  // Settings view
  if (currentView === 'settings') {
    return (
      <>
        <Settings 
          settings={appSettings}
          onSettingsChange={handleSettingsChange}
          onBack={() => setCurrentView('route-selection')}
        />
        <BottomNavigation currentView={currentView} onViewChange={handleViewChange} />
      </>
    );
  }

  // Map view (ready route or custom route)
  const routeAttractions = selectedRoute && !isCustomRoute
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
        isCustomRoute={isCustomRoute}
      />
      <AttractionCard
        attraction={selectedAttraction}
        onClose={handleCloseCard}
        onNextPoint={handleNextPoint}
        hasNextPoint={selectedRoute && !isCustomRoute ? currentAttractionIndex < selectedRoute.attraction_ids.length - 1 : false}
        currentPointNumber={currentAttractionIndex + 1}
        totalPoints={selectedRoute && !isCustomRoute ? selectedRoute.attraction_ids.length : 0}
        isCustomRoute={isCustomRoute}
      />
      <BottomNavigation currentView={currentView} onViewChange={handleViewChange} />
    </div>
  );
}

export default App;
