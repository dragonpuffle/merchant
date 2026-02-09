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
