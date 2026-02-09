# Quick Reference Guide - Telegram Mini App for Audio Guides

## Data Structures

### Attraction (Backend Pydantic Model)
```python
class Attraction(BaseModel):
    id: str
    name: str
    description: str
    address: str
    coordinates: Coordinates
    image: str
    audio_url: str
    order: int

class Coordinates(BaseModel):
    lat: float
    lon: float
```

### Attraction (Frontend TypeScript)
```typescript
interface Coordinates {
  lat: number;
  lon: number;
}

interface Attraction {
  id: string;
  name: string;
  description: string;
  address: string;
  coordinates: Coordinates;
  image: string;
  audio_url: string;
  order: number;
}
```

### Route (Backend Pydantic Model)
```python
class Route(BaseModel):
    id: str
    name: str
    description: str
    attraction_ids: List[str]
    polyline: List[List[float]]
```

### Route (Frontend TypeScript)
```typescript
interface Route {
  id: string;
  name: string;
  description: string;
  attraction_ids: string[];
  polyline: [number, number][];
}
```

## JSON Data Examples

### attractions.json
```json
{
  "attractions": [
    {
      "id": "nizhny-novgorod-state-bank",
      "name": "Нижегородский государственный банк",
      "description": "Историческое здание банка, построенное в начале XX века. Является одним из ярких примеров архитектуры того времени.",
      "address": "ул. Большая Покровская, 26",
      "coordinates": {
        "lat": 56.3269,
        "lon": 44.0075
      },
      "image": "/images/state-bank.jpg",
      "audio_url": "/audio/state-bank.mp3",
      "order": 1
    },
    {
      "id": "zelensky-descent",
      "name": "Зеленский съезд",
      "description": "Переходная точка с потрясающими видами на Нижегородский Кремль. Идеальное место для фотосессий.",
      "address": "Зеленский съезд",
      "coordinates": {
        "lat": 56.3280,
        "lon": 44.0085
      },
      "image": "/images/zelensky-descent.jpg",
      "audio_url": "/audio/zelensky-descent.mp3",
      "order": 2
    },
    {
      "id": "bugrov-night-shelter",
      "name": "Ночлежный дом Бугрова",
      "description": "Историческое здание ночлежного дома, построенное на средства купца Бугрова в конце XIX века.",
      "address": "ул. Рождественская, 2",
      "coordinates": {
        "lat": 56.3290,
        "lon": 44.0095
      },
      "image": "/images/bugrov-shelter.jpg",
      "audio_url": "/audio/bugrov-shelter.mp3",
      "order": 3
    }
  ]
}
```

### routes.json
```json
{
  "routes": [
    {
      "id": "nizhny-novgorod-center",
      "name": "Центральный маршрут по Нижнему Новгороду",
      "description": "Прогулка по историческому центру города с посещением ключевых достопримечательностей.",
      "attraction_ids": [
        "nizhny-novgorod-state-bank",
        "zelensky-descent",
        "bugrov-night-shelter"
      ],
      "polyline": [
        [56.3269, 44.0075],
        [56.3280, 44.0085],
        [56.3290, 44.0095]
      ]
    }
  ]
}
```

## API Endpoints

### GET /api/v1/attractions
**Description**: Get all attractions
**Response**: `{"attractions": Attraction[]}`
**Example**:
```bash
curl http://localhost:8000/api/v1/attractions
```

### GET /api/v1/attractions/{id}
**Description**: Get attraction by ID
**Response**: `Attraction`
**Example**:
```bash
curl http://localhost:8000/api/v1/attractions/nizhny-novgorod-state-bank
```

### GET /api/v1/routes
**Description**: Get all routes
**Response**: `{"routes": Route[]}`
**Example**:
```bash
curl http://localhost:8000/api/v1/routes
```

### GET /api/v1/routes/{id}
**Description**: Get route by ID
**Response**: `Route`
**Example**:
```bash
curl http://localhost:8000/api/v1/routes/nizhny-novgorod-center
```

### GET /api/v1/routes/{id}/attractions
**Description**: Get attractions for a specific route
**Response**: `{"attractions": Attraction[]}`
**Example**:
```bash
curl http://localhost:8000/api/v1/routes/nizhny-novgorod-center/attractions
```

### GET /health
**Description**: Health check endpoint
**Response**: `{"status": "healthy"}`
**Example**:
```bash
curl http://localhost:8000/health
```

## Environment Variables

### Backend (.env)
```env
BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
YANDEX_MAPS_API_KEY=your_yandex_maps_api_key_here
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_YANDEX_MAPS_API_KEY=your_yandex_maps_api_key_here
```

## Key Dependencies

### Backend (pyproject.toml)
```toml
[project]
name = "audio-guide-backend"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.104.0",
    "uvicorn[standard]>=0.24.0",
    "pydantic>=2.5.0",
    "pydantic-settings>=2.1.0",
    "python-multipart>=0.0.6",
    "python-dotenv>=1.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-asyncio>=0.21.0",
    "httpx>=0.25.0",
    "ruff>=0.1.0",
    "mypy>=1.7.0",
    "pylint>=3.0.0",
]

[tool.ruff]
target-version = "py311"
line-length = 100
select = ["E", "F", "I", "N", "W"]
```

### Frontend (package.json)
```json
{
  "name": "audio-guide-frontend",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@pbe-react-yandex-maps": "^1.2.5",
    "@twa-dev/sdk": "^6.9.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

## Docker Commands

### Build and Run
```bash
# Build containers
docker-compose build

# Start containers
docker-compose up

# Start in detached mode
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and restart
docker-compose up --build -d
```

### Backend Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install uv
RUN pip install uv

# Copy dependency files
COPY pyproject.toml ./

# Install dependencies
RUN uv sync

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile (Multi-stage)
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Run nginx
CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    container_name: audio-guide-backend
    ports:
      - "8000:8000"
    environment:
      - BOT_TOKEN=${BOT_TOKEN}
      - YANDEX_MAPS_API_KEY=${YANDEX_MAPS_API_KEY}
      - BACKEND_HOST=0.0.0.0
      - BACKEND_PORT=8000
    volumes:
      - ./backend/data:/app/data
    restart: unless-stopped

  frontend:
    build: ./frontend
    container_name: audio-guide-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

## Code Quality Tools

### Ruff (Python Linter)
```bash
# Check code
uv run ruff check .

# Fix issues
uv run ruff check --fix .

# Format code
uv run ruff format .
```

### MyPy (Type Checker)
```bash
# Type check
uv run mypy .
```

### Pylint (Code Quality)
```bash
# Check code
uv run pylint app/
```

### ESLint (JavaScript/TypeScript)
```bash
# Lint code
npm run lint

# Fix issues
npm run lint -- --fix
```

## Testing Commands

### Backend Tests
```bash
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=app

# Run specific test file
uv run pytest tests/test_api.py
```

### Frontend Tests
```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch
```

## Development Workflow

### Local Development
```bash
# Terminal 1: Backend
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

### Docker Development
```bash
# Build and run
docker-compose up --build

# Access
# Frontend: http://localhost
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## Yandex Maps Integration

### Initialize Map
```typescript
import { YMaps, Map, Placemark, Polyline } from '@pbe-react-yandex-maps';

const mapState = {
  center: [56.3269, 44.0075], // Nizhny Novgorod center
  zoom: 14,
  behaviors: ['default', 'scrollZoom']
};

<YMaps query={{ apikey: YANDEX_MAPS_API_KEY }}>
  <Map state={mapState} width="100%" height="100%">
    {/* Add attractions as placemarks */}
    {attractions.map(attraction => (
      <Placemark
        key={attraction.id}
        geometry={[attraction.coordinates.lat, attraction.coordinates.lon]}
        properties={{
          balloonContent: attraction.name
        }}
        onClick={() => handleAttractionClick(attraction)}
      />
    ))}
    
    {/* Add route polyline */}
    <Polyline
      geometry={route.polyline}
      options={{
        strokeColor: '#0066ff',
        strokeWidth: 4,
        strokeOpacity: 0.8
      }}
    />
  </Map>
</YMaps>
```

## Telegram Mini App Integration

### Initialize Telegram WebApp
```typescript
import WebApp from '@twa-dev/sdk';

useEffect(() => {
  // Initialize Telegram WebApp
  WebApp.ready();
  
  // Expand to full height
  WebApp.expand();
  
  // Handle theme changes
  WebApp.onEvent('themeChanged', () => {
    // Update theme based on Telegram theme
    const colorScheme = WebApp.colorScheme;
    // Apply theme to app
  });
  
  // Handle viewport changes
  WebApp.onEvent('viewportChanged', () => {
    // Adjust layout
  });
  
  // Set header color
  WebApp.setHeaderColor('#ffffff');
  
  // Cleanup
  return () => {
    WebApp.offEvent('themeChanged');
    WebApp.offEvent('viewportChanged');
  };
}, []);
```

## Audio Player Implementation

### HTML5 Audio API
```typescript
const audioRef = useRef<HTMLAudioElement>(null);

const handlePlay = () => {
  if (audioRef.current) {
    audioRef.current.play();
  }
};

const handlePause = () => {
  if (audioRef.current) {
    audioRef.current.pause();
  }
};

const handleTimeUpdate = () => {
  if (audioRef.current) {
    setCurrentTime(audioRef.current.currentTime);
    setDuration(audioRef.current.duration);
  }
};

return (
  <div>
    <audio
      ref={audioRef}
      src={attraction.audio_url}
      onTimeUpdate={handleTimeUpdate}
      onEnded={() => setIsPlaying(false)}
    />
    <button onClick={isPlaying ? handlePause : handlePlay}>
      {isPlaying ? 'Pause' : 'Play'}
    </button>
    <progress value={currentTime} max={duration} />
  </div>
);
```

## Common Issues and Solutions

### Issue: CORS errors
**Solution**: Configure CORS in FastAPI backend
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: Yandex Maps not loading
**Solution**: Ensure API key is correct and valid
```typescript
const YANDEX_MAPS_API_KEY = import.meta.env.VITE_YANDEX_MAPS_API_KEY;
```

### Issue: Audio not playing
**Solution**: Check audio file format and CORS headers
```python
# Add CORS headers for audio files
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    expose_headers=["Content-Length"],
)
```

### Issue: Docker containers not communicating
**Solution**: Use service names as hostnames
```yaml
# In docker-compose.yml
services:
  frontend:
    environment:
      - VITE_API_URL=http://backend:8000/api/v1
```

## Performance Optimization

### Backend
- Use async/await for I/O operations
- Implement caching for frequently accessed data
- Use gzip compression for responses

### Frontend
- Lazy load audio files
- Implement virtual scrolling for long lists
- Use React.memo for expensive components
- Optimize images (WebP format)

### Docker
- Use multi-stage builds to reduce image size
- Use .dockerignore to exclude unnecessary files
- Use Alpine-based images for smaller size
