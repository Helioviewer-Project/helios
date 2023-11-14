import pytest

from main import app

from api.ephemeris.horizons import Horizons

@pytest.fixture
def client():
    return app.test_client()

def test_ephemeris_no_provider(client):
    response = client.get("/ephemeris/shouldbreak/SDO")
    assert response.status_code == 400
    assert "Unknown provider" in response.json['error']

def test_ephemeris_horizons(client, monkeypatch):
    # Don't actually query horizons for this test.
    def fake_horizons(*args, **kwargs) -> list[dict]:
        return [{'x': 1, 'y': 2, 'z': 3}]
    monkeypatch.setattr(Horizons, "Get", fake_horizons)

    horizons_providers = ['Horizons', 'horizons']
    for horizons in horizons_providers:
        response = client.get(f"/ephemeris/{horizons}/SDO")
        assert response.status_code == 200
        assert response.json[0]['x'] == 1
        assert response.json[0]['y'] == 2
        assert response.json[0]['z'] == 3
