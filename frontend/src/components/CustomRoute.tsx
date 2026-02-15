import { useState } from 'react';
import type { Attraction } from '../types';

interface CustomRouteProps {
  attractions: Attraction[];
  onStartCustomRoute: (startAttraction: Attraction) => void;
  onBack: () => void;
}

export default function CustomRoute({ attractions, onStartCustomRoute, onBack }: CustomRouteProps) {
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const filteredAttractions = attractions.filter(attraction =>
    attraction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    attraction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    attraction.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAttractionSelect = (attraction: Attraction) => {
    setSelectedAttraction(attraction);
    setShowConfirmation(true);
  };

  const handleConfirmStart = () => {
    if (selectedAttraction) {
      onStartCustomRoute(selectedAttraction);
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
    setSelectedAttraction(null);
  };

  return (
    <div className="custom-route-container">
      <div className="custom-route-header">
        <button className="back-button" onClick={onBack}>
          ← Назад
        </button>
        <h1 className="custom-route-title">Произвольный маршрут</h1>
      </div>

      <div className="custom-route-content">
        <div className="custom-route-intro">
          <div className="intro-icon">🗺️</div>
          <h2 className="intro-title">Исследуйте город на своих условиях</h2>
          <p className="intro-description">
            Выберите любую достопримечательность в качестве стартовой точки и начните своё собственное путешествие по Нижнему Новгороду
          </p>
        </div>

        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Поиск достопримечательностей..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="search-icon">🔍</div>
        </div>

        <div className="attractions-list">
          {filteredAttractions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <p className="empty-text">Достопримечательности не найдены</p>
            </div>
          ) : (
            filteredAttractions.map((attraction) => (
              <div
                key={attraction.id}
                className={`attraction-item ${selectedAttraction?.id === attraction.id ? 'selected' : ''}`}
                onClick={() => handleAttractionSelect(attraction)}
              >
                <div className="attraction-item-image">
                  <img
                    src={attraction.image}
                    alt={attraction.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                    }}
                  />
                </div>
                <div className="attraction-item-content">
                  <h3 className="attraction-item-name">{attraction.name}</h3>
                  <p className="attraction-item-address">{attraction.address}</p>
                  <p className="attraction-item-description">
                    {attraction.description.length > 100
                      ? `${attraction.description.substring(0, 100)}...`
                      : attraction.description}
                  </p>
                </div>
                <div className="attraction-item-action">
                  <div className="action-icon">📍</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showConfirmation && selectedAttraction && (
        <div className="confirmation-modal-overlay" onClick={handleCancelConfirmation}>
          <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">🚀</div>
              <h2 className="modal-title">Начать маршрут?</h2>
            </div>
            
            <div className="modal-content">
              <div className="selected-attraction-preview">
                <img
                  src={selectedAttraction.image}
                  alt={selectedAttraction.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                  }}
                />
                <div className="preview-info">
                  <h3 className="preview-name">{selectedAttraction.name}</h3>
                  <p className="preview-address">{selectedAttraction.address}</p>
                </div>
              </div>
              
              <p className="modal-description">
                Вы выбрали эту достопримечательность как стартовую точку для вашего произвольного маршрута. 
                Вы сможете свободно перемещаться по карте и исследовать любые интересные места.
              </p>
            </div>

            <div className="modal-actions">
              <button className="modal-button secondary" onClick={handleCancelConfirmation}>
                Отмена
              </button>
              <button className="modal-button primary" onClick={handleConfirmStart}>
                Начать путешествие
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
