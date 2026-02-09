"""Audio guide service for managing attractions and routes."""

import json
from pathlib import Path
from typing import Any, cast

from app.api.models import Attraction, Route


class AudioGuideService:
    """Service for managing audio guide data from JSON files."""

    def __init__(self, attractions_file: Path, routes_file: Path) -> None:
        """Initialize the audio guide service.

        Args:
            attractions_file: Path to the attractions JSON file
            routes_file: Path to the routes JSON file
        """
        self.attractions_file = attractions_file
        self.routes_file = routes_file
        self._attractions_cache: list[Attraction] | None = None
        self._routes_cache: list[Route] | None = None

    async def _load_attractions(self) -> dict[str, Any]:
        """Load attractions from JSON file.

        Returns:
            Dictionary containing attractions data
        """
        if not self.attractions_file.exists():
            return {"attractions": []}

        with open(self.attractions_file, encoding="utf-8") as f:
            return cast(dict[str, Any], json.load(f))

    async def _load_routes(self) -> dict[str, Any]:
        """Load routes from JSON file.

        Returns:
            Dictionary containing routes data
        """
        if not self.routes_file.exists():
            return {"routes": []}

        with open(self.routes_file, encoding="utf-8") as f:
            return cast(dict[str, Any], json.load(f))

    async def get_all_attractions(self) -> list[Attraction]:
        """Get all attractions.

        Returns:
            List of all attractions
        """
        if self._attractions_cache is None:
            data = await self._load_attractions()
            attractions_data = data.get("attractions", [])
            self._attractions_cache = [Attraction(**attraction) for attraction in attractions_data]
        return self._attractions_cache

    async def get_attraction_by_id(self, attraction_id: str) -> Attraction | None:
        """Get attraction by ID.

        Args:
            attraction_id: ID of the attraction

        Returns:
            Attraction if found, None otherwise
        """
        attractions = await self.get_all_attractions()
        for attraction in attractions:
            if attraction.id == attraction_id:
                return attraction
        return None

    async def get_attractions_by_ids(self, attraction_ids: list[str]) -> list[Attraction]:
        """Get attractions by list of IDs.

        Args:
            attraction_ids: List of attraction IDs

        Returns:
            List of attractions in the order of the provided IDs
        """
        attractions_map = {attr.id: attr for attr in await self.get_all_attractions()}
        result = []
        for attr_id in attraction_ids:
            if attr_id in attractions_map:
                result.append(attractions_map[attr_id])
        return result

    async def get_all_routes(self) -> list[Route]:
        """Get all routes.

        Returns:
            List of all routes
        """
        if self._routes_cache is None:
            data = await self._load_routes()
            routes_data = data.get("routes", [])
            self._routes_cache = [Route(**route) for route in routes_data]
        return self._routes_cache

    async def get_route_by_id(self, route_id: str) -> Route | None:
        """Get route by ID.

        Args:
            route_id: ID of the route

        Returns:
            Route if found, None otherwise
        """
        routes = await self.get_all_routes()
        for route in routes:
            if route.id == route_id:
                return route
        return None

    async def get_route_attractions(self, route_id: str) -> list[Attraction]:
        """Get attractions for a specific route.

        Args:
            route_id: ID of the route

        Returns:
            List of attractions in the route
        """
        route = await self.get_route_by_id(route_id)
        if route is None:
            return []
        return await self.get_attractions_by_ids(route.attraction_ids)

    def clear_cache(self) -> None:
        """Clear the internal cache."""
        self._attractions_cache = None
        self._routes_cache = None
