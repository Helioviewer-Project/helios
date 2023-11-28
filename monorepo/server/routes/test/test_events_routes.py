import pytest

from main import app

@pytest.fixture
def client():
    return app.test_client()

def test_get_events(client):
    response = client.get("/event?start=2022-01-01 00:00:00&end=2022-01-01 00:01:00")
    print(response.data)
    assert response.status_code == 200