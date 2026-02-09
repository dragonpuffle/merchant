"""API routes for the audio guide backend."""

from fastapi import APIRouter, HTTPException, status

from app.api.models import (
    Attraction,
    AttractionListResponse,
    ErrorResponse,
    HealthResponse,
    Route,
    RouteListResponse,
)
from app.core.config import get_settings
from app.services.audio_guide_service import AudioGuideService

router = APIRouter()
settings = get_settings()
audio_service = AudioGuideService(
    attractions_file=settings.attractions_file,
    routes_file=settings.routes_file,
)


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description="Check if the API is running",
)
async def health_check() -> HealthResponse:
    """Health check endpoint."""
    return HealthResponse(status="healthy", version=settings.app_version)


@router.get(
    "/attractions",
    response_model=AttractionListResponse,
    summary="Get all attractions",
    description="Retrieve a list of all available attractions",
)
async def get_attractions() -> AttractionListResponse:
    """Get all attractions."""
    attractions = await audio_service.get_all_attractions()
    return AttractionListResponse(attractions=attractions)


@router.get(
    "/attractions/{attraction_id}",
    response_model=Attraction,
    summary="Get attraction by ID",
    description="Retrieve a specific attraction by its ID",
    responses={
        status.HTTP_404_NOT_FOUND: {
            "model": ErrorResponse,
            "description": "Attraction not found",
        },
    },
)
async def get_attraction(attraction_id: str) -> Attraction:
    """Get attraction by ID."""
    attraction = await audio_service.get_attraction_by_id(attraction_id)
    if attraction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Attraction with ID '{attraction_id}' not found",
        )
    return attraction


@router.get(
    "/routes",
    response_model=RouteListResponse,
    summary="Get all routes",
    description="Retrieve a list of all available routes",
)
async def get_routes() -> RouteListResponse:
    """Get all routes."""
    routes = await audio_service.get_all_routes()
    return RouteListResponse(routes=routes)


@router.get(
    "/routes/{route_id}",
    response_model=Route,
    summary="Get route by ID",
    description="Retrieve a specific route by its ID",
    responses={
        status.HTTP_404_NOT_FOUND: {
            "model": ErrorResponse,
            "description": "Route not found",
        },
    },
)
async def get_route(route_id: str) -> Route:
    """Get route by ID."""
    route = await audio_service.get_route_by_id(route_id)
    if route is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Route with ID '{route_id}' not found",
        )
    return route


@router.get(
    "/routes/{route_id}/attractions",
    response_model=AttractionListResponse,
    summary="Get attractions for a route",
    description="Retrieve all attractions belonging to a specific route",
    responses={
        status.HTTP_404_NOT_FOUND: {
            "model": ErrorResponse,
            "description": "Route not found",
        },
    },
)
async def get_route_attractions(route_id: str) -> AttractionListResponse:
    """Get attractions for a specific route."""
    route = await audio_service.get_route_by_id(route_id)
    if route is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Route with ID '{route_id}' not found",
        )

    attractions = await audio_service.get_attractions_by_ids(route.attraction_ids)
    return AttractionListResponse(attractions=attractions)
