import { useState } from 'react';
import type { Attraction } from '../types';
import AudioPlayer from './AudioPlayer';

interface AttractionCardProps {
  attraction: Attraction | null;
  onClose: () => void;
}

export default function AttractionCard({ attraction, onClose }: AttractionCardProps) {
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
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'rgba(0, 0, 0, 0.1)',
          border: 'none',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          color: '#666',
        }}
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

      <h2 className="attraction-name">{attraction.name}</h2>
      <p className="attraction-address">{attraction.address}</p>
      <p className="attraction-description">{attraction.description}</p>

      <AudioPlayer
        audioUrl={attraction.audio_url}
        isPlaying={isPlaying}
        onPlay={handlePlay}
        onPause={handlePause}
      />
    </div>
  );
}
