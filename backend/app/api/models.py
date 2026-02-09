"""Pydantic models for the audio guide API."""

from pydantic import BaseModel, Field, field_validator


class Coordinates(BaseModel):
    """Geographic coordinates."""

    lat: float = Field(..., ge=-90, le=90, description="Latitude")
    lon: float = Field(..., ge=-180, le=180, description="Longitude")


class Attraction(BaseModel):
    """Attraction model for audio guides."""

    id: str = Field(..., description="Unique identifier for the attraction")
    name: str = Field(..., min_length=1, description="Name of the attraction")
    description: str = Field(..., min_length=1, description="Description of the attraction")
    address: str = Field(..., min_length=1, description="Address of the attraction")
    coordinates: Coordinates = Field(..., description="Geographic coordinates")
    image: str = Field(..., min_length=1, description="URL to the attraction image")
    audio_url: str = Field(..., min_length=1, description="URL to the audio guide")
    order: int = Field(..., ge=1, description="Order in the route")

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": "nizhny-novgorod-state-bank",
                "name": "Нижегородский государственный банк",
                "description": "Историческое здание банка, построенное в начале XX века.",
                "address": "ул. Большая Покровская, 26",
                "coordinates": {"lat": 56.3269, "lon": 44.0075},
                "image": "/images/state-bank.jpg",
                "audio_url": "/audio/state-bank.mp3",
                "order": 1,
            }
        }
    }


class AttractionListResponse(BaseModel):
    """Response model for a list of attractions."""

    attractions: list[Attraction] = Field(default_factory=list, description="List of attractions")


class Route(BaseModel):
    """Route model for audio guide tours."""

    id: str = Field(..., description="Unique identifier for the route")
    name: str = Field(..., min_length=1, description="Name of the route")
    description: str = Field(..., min_length=1, description="Description of the route")
    attraction_ids: list[str] = Field(
        ..., min_length=1, description="List of attraction IDs in the route"
    )
    polyline: list[list[float]] = Field(
        ..., min_length=2, description="Polyline coordinates for the route"
    )

    @field_validator("polyline")
    @classmethod
    def validate_polyline(cls, v: list[list[float]]) -> list[list[float]]:
        """Validate that polyline coordinates are valid."""
        for coord in v:
            if len(coord) != 2:
                raise ValueError("Each polyline coordinate must have exactly 2 values (lat, lon)")
            if not -90 <= coord[0] <= 90:
                raise ValueError("Latitude must be between -90 and 90")
            if not -180 <= coord[1] <= 180:
                raise ValueError("Longitude must be between -180 and 180")
        return v

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": "nizhny-novgorod-center",
                "name": "Центральный маршрут по Нижнему Новгороду",
                "description": "Прогулка по историческому центру города.",
                "attraction_ids": [
                    "nizhny-novgorod-state-bank",
                    "zelensky-descent",
                    "bugrov-night-shelter",
                ],
                "polyline": [
                    [56.3269, 44.0075],
                    [56.3280, 44.0085],
                    [56.3290, 44.0095],
                ],
            }
        }
    }


class RouteListResponse(BaseModel):
    """Response model for a list of routes."""

    routes: list[Route] = Field(default_factory=list, description="List of routes")


class HealthResponse(BaseModel):
    """Health check response model."""

    status: str = Field(default="healthy", description="Health status")
    version: str = Field(default="0.1.0", description="API version")


class ErrorResponse(BaseModel):
    """Error response model."""

    detail: str = Field(..., description="Error message")
    status_code: int = Field(..., description="HTTP status code")

    model_config = {
        "json_schema_extra": {
            "example": {
                "detail": "Attraction not found",
                "status_code": 404,
            }
        }
    }
