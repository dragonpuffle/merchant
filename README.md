# Telegram Mini App for Audio Guides

A full-stack Telegram Mini App for audio guides in Nizhny Novgorod, featuring an interactive map with route visualization, attraction details, and audio playback.

## Features

- Interactive map with Yandex Maps integration
- Attraction details with text, photos, and audio guides
- HTML5 audio player with controls
- Telegram Mini App with theme support
- Responsive design for mobile devices
- Type-safe codebase (TypeScript + Python type hints)
- Docker support with multi-stage builds

## Tech Stack

### Backend
- Python 3.11+ with FastAPI
- uv package manager
- JSON data storage
- Code quality: ruff, mypy, pylint

### Frontend
- TypeScript with React 18+
- Vite build tool
- Yandex Maps API

### Infrastructure
- Docker multi-stage builds
- docker-compose orchestration

## Prerequisites

- Python 3.11+ and uv
- Node.js 18+ and npm
- Docker 20.10+ and Docker Compose 2.0+ (optional)

## Installation

### Backend

```bash
cd backend
pip install uv
uv sync
cp .env.example .env
# Edit .env with your credentials
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your credentials
```

## Running the Application

### Local Development

**Backend:**
```bash
cd backend
uv run uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Docker

```bash
cp .env.example .env
# Edit .env with your credentials
docker-compose up --build
```

Stop:
```bash
docker-compose down
```

## API Endpoints

- `GET /api/v1/health` - Health check
- `GET /api/v1/attractions` - List all attractions
- `GET /api/v1/attractions/{id}` - Get attraction by ID
- `GET /api/v1/routes` - List all routes
- `GET /api/v1/routes/{id}` - Get route by ID
- `GET /api/v1/routes/{id}/attractions` - Get route attractions

Interactive documentation: http://localhost:8000/docs

## Project Structure

```
merchant/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── api/                 # API routes and models
│   │   ├── core/                # Config and security
│   │   └── services/            # Business logic
│   ├── data/                    # JSON data files
│   ├── tests/                   # Test files
│   └── pyproject.toml           # Package configuration
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── services/            # API client
│   │   ├── types/               # TypeScript types
│   │   └── utils/               # Utilities
│   └── package.json
└── docker-compose.yml
```

## Environment Variables

### Backend

| Variable | Description | Required | Default |
|----------|-------------|-----------|---------|
| `BOT_TOKEN` | Telegram Bot Token | Yes | - |
| `YANDEX_MAPS_API_KEY` | Yandex Maps API Key | Yes | - |
| `BACKEND_HOST` | Backend host | No | `0.0.0.0` |
| `BACKEND_PORT` | Backend port | No | `8000` |
| `CORS_ORIGINS` | Allowed origins | No | `*` |

### Frontend

| Variable | Description | Required | Default |
|----------|-------------|-----------|---------|
| `VITE_API_URL` | Backend API URL | Yes | `http://localhost:8000/api/v1` |
| `VITE_YANDEX_MAPS_API_KEY` | Yandex Maps API Key | Yes | - |

## Code Quality

### Backend

```bash
cd backend
uv run ruff check          # Lint
uv run ruff check --fix     # Auto-fix
uv run ruff format         # Format
uv run mypy app            # Type check
```

### Frontend

```bash
cd frontend
npm run lint               # Lint
npm run lint -- --fix      # Auto-fix
npm run type-check         # Type check
```

## Testing

### Backend

```bash
cd backend
uv run pytest              # Run tests
uv run pytest --cov=app    # With coverage
```

### Frontend

```bash
cd frontend
npm test                  # Run tests
```

## Deployment

```bash
docker-compose build
docker-compose up -d
docker-compose logs -f
```

### Production Checklist

- Set up HTTPS/SSL certificates
- Configure nginx reverse proxy
- Set up monitoring and logging
- Configure backup strategy for JSON data
- Set up CI/CD pipeline
- Perform security audit

## Troubleshooting

- **CORS errors**: Check `CORS_ORIGINS` in backend .env
- **Maps not loading**: Verify Yandex Maps API key is valid
- **Audio not playing**: Check file format and CORS headers
- **Docker communication**: Use service names as hostnames
- **Backend not starting**: Check if port 8000 is in use
- **TypeScript errors**: Run `npm install` in frontend directory

## Nizhny Novgorod Route

Pre-configured attractions:
1. Nizhny Novgorod State Bank (56.3269, 44.0075)
2. Zelensky Descent (56.3280, 44.0085)
3. Bugrov's Night Shelter (56.3290, 44.0095)

## License

MIT License

## Contributing

Contributions welcome! Submit a Pull Request.
