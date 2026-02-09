"""Security utilities for the audio guide backend."""

from collections.abc import Awaitable, Callable

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware


def setup_cors(app: FastAPI, origins: list[str]) -> None:
    """Configure CORS middleware for the FastAPI application.

    Args:
        app: FastAPI application instance
        origins: List of allowed origins
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["Content-Length", "Content-Type"],
    )


def setup_security_headers(app: FastAPI) -> None:
    """Add security headers middleware to the FastAPI application.

    Args:
        app: FastAPI application instance
    """

    @app.middleware("http")
    async def add_security_headers(
        request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        """Add security headers to all responses."""
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response
