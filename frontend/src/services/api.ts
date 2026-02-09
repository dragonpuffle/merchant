import type {
  Attraction,
  AttractionListResponse,
  ErrorResponse,
  HealthResponse,
  Route,
  RouteListResponse,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

class ApiError extends Error {
  constructor(public detail: string, public statusCode: number) {
    super(detail);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new ApiError(error.detail, error.status_code);
  }
  return response.json();
}

export const api = {
  async getHealth(): Promise<HealthResponse> {
    const response = await fetch(`${API_URL}/health`);
    return handleResponse<HealthResponse>(response);
  },

  async getAttractions(): Promise<Attraction[]> {
    const response = await fetch(`${API_URL}/attractions`);
    const data = await handleResponse<AttractionListResponse>(response);
    return data.attractions;
  },

  async getAttractionById(id: string): Promise<Attraction> {
    const response = await fetch(`${API_URL}/attractions/${id}`);
    return handleResponse<Attraction>(response);
  },

  async getRoutes(): Promise<Route[]> {
    const response = await fetch(`${API_URL}/routes`);
    const data = await handleResponse<RouteListResponse>(response);
    return data.routes;
  },

  async getRouteById(id: string): Promise<Route> {
    const response = await fetch(`${API_URL}/routes/${id}`);
    return handleResponse<Route>(response);
  },

  async getRouteAttractions(routeId: string): Promise<Attraction[]> {
    const response = await fetch(`${API_URL}/routes/${routeId}/attractions`);
    const data = await handleResponse<AttractionListResponse>(response);
    return data.attractions;
  },
};

export { ApiError };
