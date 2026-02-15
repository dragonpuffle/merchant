export interface Coordinates {
  lat: number;
  lon: number;
}

export interface Attraction {
  id: string;
  name: string;
  description: string;
  address: string;
  coordinates: Coordinates;
  image: string;
  audio_url: string;
  order: number;
}

export interface Route {
  id: string;
  name: string;
  description: string;
  attraction_ids: string[];
  polyline: [number, number][];
}

export interface AttractionListResponse {
  attractions: Attraction[];
}

export interface RouteListResponse {
  routes: Route[];
}

export interface HealthResponse {
  status: string;
  version: string;
}

export interface ErrorResponse {
  detail: string;
  status_code: number;
}

// Reward types
export interface Reward {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface UserProgress {
  totalPoints: number;
  visitedAttractions: string[];
  completedRoutes: string[];
  rewardsUnlocked: string[];
  currentStreak: number;
}

// Settings types
export interface AppSettings {
  notifications: boolean;
  soundEffects: boolean;
  autoPlayAudio: boolean;
  language: 'ru' | 'en';
  theme: 'light' | 'dark' | 'auto';
}

// Navigation types
export type AppView = 
  | 'route-selection' 
  | 'map-view' 
  | 'custom-route' 
  | 'rewards' 
  | 'settings';

export interface NavigationItem {
  id: AppView;
  label: string;
  icon: string;
}
