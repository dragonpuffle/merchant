import { useState } from 'react';
import type { Attraction } from '../types';
import AudioPlayer from './AudioPlayer';

interface AttractionCardProps {
  attraction: Attraction | null;
  onClose: () => void;
  onNextPoint: () => void;
  hasNextPoint: boolean;
  currentPointNumber: number;
  totalPoints: number;
  isCustomRoute?: boolean;
}

export default function AttractionCard({ 
  attraction, 
  onClose, 
  onNextPoint, 
  hasNextPoint,
  currentPointNumber,
  totalPoints,
  isCustomRoute = false
}: AttractionCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!attraction) {
    return null;
  }

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  return (
    <div className={`attraction-card ${!attraction ? 'hidden' : ''}`}>
      <button
        onClick={onClose}
        className="close-button"
      >
        ×
      </button>

      <img
        src={attraction.image}
        alt={attraction.name}
        className="attraction-image"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
        }}
      />

      {!isCustomRoute && (
        <div className="point-indicator">
          Точка {currentPointNumber} из {totalPoints}
        </div>
      )}

      <h2 className="attraction-name">{attraction.name}</h2>
      <p className="attraction-address">{attraction.address}</p>
      <p className="attraction-description">{attraction.description}</p>

      <AudioPlayer
        audioUrl={attraction.audio_url}
        isPlaying={isPlaying}
        onPlay={handlePlay}
        onPause={handlePause}
      />

      {!isCustomRoute && hasNextPoint && (
        <button
          className="next-point-button"
          onClick={onNextPoint}
        >
          Следующая точка →
        </button>
      )}
    </div>
  );
}
