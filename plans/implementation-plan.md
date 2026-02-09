# Implementation Plan - Telegram Mini App for Audio Guides

## Phase 1: Project Setup and Infrastructure

### Step 1.1: Create Project Directory Structure
- [ ] Create `backend/` directory
- [ ] Create `frontend/` directory
- [ ] Create `plans/` directory (already exists)
- [ ] Create `backend/app/` directory
- [ ] Create `backend/app/api/` directory
- [ ] Create `backend/app/core/` directory
- [ ] Create `backend/app/services/` directory
- [ ] Create `backend/data/` directory
- [ ] Create `backend/tests/` directory
- [ ] Create `frontend/public/` directory
- [ ] Create `frontend/src/` directory
- [ ] Create `frontend/src/components/` directory
- [ ] Create `frontend/src/services/` directory
- [ ] Create `frontend/src/types/` directory
- [ ] Create `frontend/src/utils/` directory

### Step 1.2: Backend Configuration Files
- [ ] Create `backend/pyproject.toml` with uv configuration
- [ ] Create `backend/ruff.toml` with linting rules
- [ ] Create `backend/.mypy.ini` with type checking rules
- [ ] Create `backend/.pylintrc` with code quality rules
- [ ] Create `backend/Dockerfile` for backend containerization
- [ ] Create `backend/.gitignore` for Python-specific ignores

### Step 1.3: Frontend Configuration Files
- [ ] Create `frontend/package.json` with dependencies
- [ ] Create `frontend/tsconfig.json` with TypeScript configuration
- [ ] Create `frontend/vite.config.ts` with Vite configuration
- [ ] Create `frontend/Dockerfile` with multi-stage build
- [ ] Create `frontend/.gitignore` for Node-specific ignores

### Step 1.4: Root Configuration Files
- [ ] Create `docker-compose.yml` for orchestration
- [ ] Create `.env.example` with environment variable templates
- [ ] Update `.gitignore` with project-specific ignores

## Phase 2: Backend Implementation

### Step 2.1: Core Backend Files
- [ ] Create `backend/app/__init__.py`
- [ ] Create `backend/app/core/__init__.py`
- [ ] Create `backend/app/core/config.py` - Configuration management with Pydantic Settings
- [ ] Create `backend/app/core/security.py` - Security utilities (CORS, etc.)

### Step 2.2: Data Models
- [ ] Create `backend/app/api/__init__.py`
- [ ] Create `backend/app/api/models.py` - Pydantic models for Attraction, Route, etc.

### Step 2.3: JSON Data Storage
- [ ] Create `backend/data/attractions.json` with Nizhny Novgorod attractions
- [ ] Create `backend/data/routes.json` with route definitions

### Step 2.4: Business Logic Services
- [ ] Create `backend/app/services/__init__.py`
- [ ] Create `backend/app/services/audio_guide_service.py` - Service for managing attractions and routes

### Step 2.5: API Routes
- [ ] Create `backend/app/api/routes.py` - FastAPI route definitions
  - GET /api/v1/attractions
  - GET /api/v1/attractions/{id}
  - GET /api/v1/routes
  - GET /api/v1/routes/{id}
  - GET /api/v1/routes/{id}/attractions
  - GET /health

### Step 2.6: Main Application
- [ ] Create `backend/app/main.py` - FastAPI application entry point with CORS configuration

### Step 2.7: Backend Tests
- [ ] Create `backend/tests/__init__.py`
- [ ] Create `backend/tests/test_api.py` - API endpoint tests

## Phase 3: Frontend Implementation

### Step 3.1: Core Frontend Files
- [ ] Create `frontend/public/index.html` - HTML template
- [ ] Create `frontend/src/main.tsx` - React entry point
- [ ] Create `frontend/src/index.css` - Global styles
- [ ] Create `frontend/src/vite-env.d.ts` - Vite type definitions

### Step 3.2: TypeScript Types
- [ ] Create `frontend/src/types/index.ts` - Type definitions for Attraction, Route, etc.

### Step 3.3: API Service
- [ ] Create `frontend/src/services/api.ts` - API client with fetch/axios
  - getAttractions()
  - getAttractionById()
  - getRoutes()
  - getRouteById()
  - getRouteAttractions()

### Step 3.4: Telegram Utilities
- [ ] Create `frontend/src/utils/telegram.ts` - Telegram Mini App utilities
  - Initialize Telegram WebApp
  - Handle theme changes
  - Handle viewport changes

### Step 3.5: React Components
- [ ] Create `frontend/src/components/Map.tsx` - Yandex Maps integration
  - Initialize Yandex Maps with API key
  - Display route polyline
  - Render attraction markers
  - Handle marker click events
  - Handle map center/zoom

- [ ] Create `frontend/src/components/AttractionCard.tsx` - Attraction detail card
  - Display attraction name, description, address
  - Show attraction image
  - Play/pause audio button
  - Audio progress indicator

- [ ] Create `frontend/src/components/AudioPlayer.tsx` - Audio player component
  - Play/pause controls
  - Progress bar
  - Volume control
  - Error handling
  - Loading state

### Step 3.6: Main App Component
- [ ] Create `frontend/src/App.tsx` - Main application component
  - Fetch attractions and routes on mount
  - Manage selected attraction state
  - Manage audio player state
  - Render Map and AttractionCard
  - Handle attraction selection
  - Handle audio playback

## Phase 4: Docker Configuration

### Step 4.1: Backend Dockerfile
- [ ] Create `backend/Dockerfile`
  - Use python:3.11-slim base image
  - Install uv
  - Copy pyproject.toml
  - Install dependencies
  - Copy application code
  - Expose port 8000
  - Run uvicorn server

### Step 4.2: Frontend Dockerfile (Multi-stage)
- [ ] Create `frontend/Dockerfile`
  - Build stage: Use node:18-alpine
  - Install dependencies
  - Build React app with Vite
  - Production stage: Use nginx:alpine
  - Copy built files to nginx
  - Configure nginx
  - Expose port 80

### Step 4.3: Docker Compose
- [ ] Create `docker-compose.yml`
  - Backend service configuration
  - Frontend service configuration
  - Volume mounts for data
  - Environment variables
  - Port mappings
  - Service dependencies

## Phase 5: Code Quality Tools

### Step 5.1: Backend Code Quality
- [ ] Configure `backend/ruff.toml`
  - Target Python 3.11
  - Line length 100
  - Select linting rules

- [ ] Configure `backend/.mypy.ini`
  - Python version 3.11
  - Strict type checking
  - Warn on any returns

- [ ] Configure `backend/.pylintrc`
  - Max line length 100
  - Disable specific warnings

### Step 5.2: Frontend Code Quality
- [ ] Add ESLint to `frontend/package.json`
- [ ] Add Prettier to `frontend/package.json`
- [ ] Configure ESLint rules
- [ ] Configure Prettier rules

## Phase 6: Environment Configuration

### Step 6.1: Environment Variables
- [ ] Create `.env.example`
  - BOT_TOKEN
  - YANDEX_MAPS_API_KEY
  - BACKEND_HOST
  - BACKEND_PORT
  - VITE_API_URL
  - VITE_YANDEX_MAPS_API_KEY

## Phase 7: Documentation

### Step 7.1: README.md
- [ ] Create comprehensive `README.md`
  - Project overview
  - Tech stack
  - Prerequisites
  - Installation instructions (uv for backend, npm for frontend)
  - Local development setup
  - Docker setup
  - API documentation
  - Environment variables
  - Testing instructions
  - Deployment instructions
  - Troubleshooting

## Phase 8: Testing and Validation

### Step 8.1: Backend Testing
- [ ] Run backend tests: `uv run pytest`
- [ ] Run type checking: `uv run mypy`
- [ ] Run linting: `uv run ruff check`
- [ ] Run code quality: `uv run pylint`

### Step 8.2: Frontend Testing
- [ ] Run frontend tests: `npm test`
- [ ] Run type checking: `npm run type-check`
- [ ] Run linting: `npm run lint`
- [ ] Build frontend: `npm run build`

### Step 8.3: Docker Testing
- [ ] Build Docker images: `docker-compose build`
- [ ] Run Docker containers: `docker-compose up`
- [ ] Test backend health: `curl http://localhost:8000/health`
- [ ] Test frontend: Open http://localhost
- [ ] Test API endpoints
- [ ] Test map functionality
- [ ] Test audio playback

## Phase 9: Final Review

### Step 9.1: Code Review Checklist
- [ ] All files created with correct structure
- [ ] Code follows best practices
- [ ] Type safety ensured (TypeScript + mypy)
- [ ] Code quality tools passing
- [ ] No hardcoded secrets
- [ ] Environment variables properly configured
- [ ] Docker configuration optimized
- [ ] Documentation complete

### Step 9.2: Functional Review Checklist
- [ ] Backend API endpoints working
- [ ] Frontend renders correctly
- [ ] Yandex Maps displays route and attractions
- [ ] Clicking attraction shows details
- [ ] Audio playback works
- [ ] Responsive design (Telegram Mini App)
- [ ] Error handling implemented

## File-by-File Creation Order

### Backend Files (in order)
1. `backend/pyproject.toml`
2. `backend/ruff.toml`
3. `backend/.mypy.ini`
4. `backend/.pylintrc`
5. `backend/app/__init__.py`
6. `backend/app/core/__init__.py`
7. `backend/app/core/config.py`
8. `backend/app/core/security.py`
9. `backend/app/api/__init__.py`
10. `backend/app/api/models.py`
11. `backend/app/services/__init__.py`
12. `backend/app/services/audio_guide_service.py`
13. `backend/data/attractions.json`
14. `backend/data/routes.json`
15. `backend/app/api/routes.py`
16. `backend/app/main.py`
17. `backend/tests/__init__.py`
18. `backend/tests/test_api.py`
19. `backend/Dockerfile`

### Frontend Files (in order)
1. `frontend/package.json`
2. `frontend/tsconfig.json`
3. `frontend/vite.config.ts`
4. `frontend/public/index.html`
5. `frontend/src/main.tsx`
6. `frontend/src/index.css`
7. `frontend/src/vite-env.d.ts`
8. `frontend/src/types/index.ts`
9. `frontend/src/services/api.ts`
10. `frontend/src/utils/telegram.ts`
11. `frontend/src/components/Map.tsx`
12. `frontend/src/components/AttractionCard.tsx`
13. `frontend/src/components/AudioPlayer.tsx`
14. `frontend/src/App.tsx`
15. `frontend/Dockerfile`

### Root Files (in order)
1. `docker-compose.yml`
2. `.env.example`
3. `.gitignore`
4. `README.md`

## Implementation Notes

### Nizhny Novgorod Attractions Data
- **Nizhny Novgorod State Bank**: 56.3269, 44.0075
- **Zelensky Descent**: 56.3280, 44.0085
- **Bugrov's Night Shelter**: 56.3290, 44.0095

### Yandex Maps Integration
- Use `@pbe-react-yandex-maps` or `react-yandex-maps` package
- Initialize map with center on Nizhny Novgorod
- Display polyline connecting attractions
- Use custom markers for attractions

### Telegram Mini App Integration
- Use `@twa-dev/sdk` package
- Initialize Telegram WebApp on mount
- Handle theme changes (light/dark)
- Handle viewport changes (expand/collapse)

### Audio Playback
- Use HTML5 Audio API
- Support play/pause, progress, volume
- Handle loading and error states
- Cache audio files for better performance

## Success Criteria

1. ✅ All backend API endpoints working correctly
2. ✅ Frontend renders without errors
3. ✅ Yandex Maps displays route and attractions
4. ✅ Clicking attraction shows details with audio
5. ✅ Audio playback works smoothly
6. ✅ Docker containers build and run successfully
7. ✅ Code quality tools passing
8. ✅ Documentation complete and accurate
9. ✅ Environment variables properly configured
10. ✅ No hardcoded secrets in code
