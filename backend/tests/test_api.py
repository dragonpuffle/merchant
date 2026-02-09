"""Tests for the audio guide API endpoints."""

import pytest
from httpx import AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_health_check():
    """Test health check endpoint."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data


@pytest.mark.asyncio
async def test_get_attractions():
    """Test getting all attractions."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/attractions")
        assert response.status_code == 200
        data = response.json()
        assert "attractions" in data
        assert isinstance(data["attractions"], list)


@pytest.mark.asyncio
async def test_get_attraction_by_id():
    """Test getting attraction by ID."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/attractions/nizhny-novgorod-state-bank")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "nizhny-novgorod-state-bank"
        assert "name" in data
        assert "description" in data


@pytest.mark.asyncio
async def test_get_attraction_not_found():
    """Test getting non-existent attraction."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/attractions/non-existent")
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data


@pytest.mark.asyncio
async def test_get_routes():
    """Test getting all routes."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/routes")
        assert response.status_code == 200
        data = response.json()
        assert "routes" in data
        assert isinstance(data["routes"], list)


@pytest.mark.asyncio
async def test_get_route_by_id():
    """Test getting route by ID."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/routes/nizhny-novgorod-center")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "nizhny-novgorod-center"
        assert "name" in data
        assert "attraction_ids" in data


@pytest.mark.asyncio
async def test_get_route_not_found():
    """Test getting non-existent route."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/routes/non-existent")
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data


@pytest.mark.asyncio
async def test_get_route_attractions():
    """Test getting attractions for a route."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/routes/nizhny-novgorod-center/attractions")
        assert response.status_code == 200
        data = response.json()
        assert "attractions" in data
        assert isinstance(data["attractions"], list)
        assert len(data["attractions"]) > 0


@pytest.mark.asyncio
async def test_root_endpoint():
    """Test root endpoint."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        assert "docs" in data
