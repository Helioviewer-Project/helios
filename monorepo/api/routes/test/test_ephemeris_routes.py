import json
import pytest

from main import app

from api.ephemeris.horizons import Horizons

@pytest.fixture
def client():
    app.debug = True
    return app.test_client()

def test_observer_position_ok(client):
    response = client.get("/observer/position/150131197")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "x" in data
    assert "y" in data
    assert "z" in data

def test_observer_position_invalid_id(client):
    response = client.get("/observer/position/0")
    assert response.status_code == 400
    data = json.loads(response.data)
    assert "Couldn't find image" in data["error"]

def test_ephemeris_missing_parameters(client):
    response = client.get("/ephemeris/horizons/SDO")
    # 422 for missing dates parameter
    assert response.status_code == 422

def test_ephemeris_unknown_provider(client):
    response = client.get("/ephemeris/shouldbreak/SDO?dates=2023-01-01T00:00:00Z")
    assert response.status_code == 400
    assert "Unknown provider" in response.json['error']

def test_ephemeris_horizons(client, monkeypatch):
    # Don't actually query horizons for this test.
    def fake_horizons(*args, **kwargs) -> list[dict]:
        return [{'x': 1, 'y': 2, 'z': 3}]
    monkeypatch.setattr(Horizons, "Get", fake_horizons)

    horizons_providers = ['Horizons', 'horizons']
    for horizons in horizons_providers:
        response = client.get(f"/ephemeris/{horizons}/SDO?dates=2023-01-01T00:00:00Z")
        assert response.status_code == 200
        assert response.json[0]['x'] == 1
        assert response.json[0]['y'] == 2
        assert response.json[0]['z'] == 3

def test_get_earth(client):
    response = client.get("/earth/2023-01-01 00:00:00")
    data = response.json
    print(data)
    assert data['x'] == pytest.approx(-166.2722)
    assert data['y'] == pytest.approx(130.1701)
    assert data['z'] == pytest.approx(-10.9540)