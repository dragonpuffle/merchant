"""Main FastAPI application for the audio guide backend."""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import router
from app.core.config import get_settings
from app.core.security import setup_cors, setup_security_headers

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan context manager for the FastAPI application.

    Args:
        app: FastAPI application instance

    Yields:
        None
    """
    # Startup
    print(f"Starting {settings.app_name} v{settings.app_version}")
    print(f"Debug mode: {settings.debug}")
    yield
    # Shutdown
    print(f"Shutting down {settings.app_name}")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application.

    Returns:
        Configured FastAPI application instance
    """
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="Backend API for Telegram Mini App audio guides",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # Setup CORS
    setup_cors(app, settings.cors_origins)

    # Setup security headers
    setup_security_headers(app)

    # Include API routes
    app.include_router(router, prefix=settings.api_prefix)

    # Mount static files directory for images
    images_path = Path(__file__).parent.parent / "images"
    if images_path.exists():
        app.mount("/images", StaticFiles(directory=str(images_path)), name="images")

    # Mount static files directory for audio
    audio_path = Path(__file__).parent.parent / "audio"
    if audio_path.exists():
        app.mount("/audio", StaticFiles(directory=str(audio_path)), name="audio")

    # Add exception handlers
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
        """Handle HTTP exceptions."""
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail, "status_code": exc.status_code},
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        """Handle general exceptions."""
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error", "status_code": 500},
        )

    return app


app = create_app()


@app.get("/")
async def root() -> dict:
    """Root endpoint.

    Returns:
        Welcome message
    """
    return {
        "message": f"Welcome to {settings.app_name}",
        "version": settings.app_version,
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.backend_host,
        port=settings.backend_port,
        reload=settings.debug,
    )
