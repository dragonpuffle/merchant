import type { AppView, NavigationItem } from '../types';

interface BottomNavigationProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

const navigationItems: NavigationItem[] = [
  { id: 'route-selection', label: 'Маршруты', icon: '🗺️' },
  { id: 'custom-route', label: 'Свободный режим', icon: '🚶' },
  { id: 'rewards', label: 'Награды', icon: '🏆' },
  { id: 'settings', label: 'Настройки', icon: '⚙️' },
];

export default function BottomNavigation({ currentView, onViewChange }: BottomNavigationProps) {
  const handleNavClick = (view: AppView) => {
    onViewChange(view);
  };

  return (
    <div className="bottom-navigation">
      <div className="navigation-container">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            className={`navigation-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => handleNavClick(item.id)}
            aria-label={item.label}
            aria-current={currentView === item.id ? 'page' : undefined}
          >
            <div className="navigation-icon">{item.icon}</div>
            <div className="navigation-label">{item.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
