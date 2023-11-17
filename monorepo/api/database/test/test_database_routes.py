from datetime import datetime, timedelta

import pytest

from main import app
from routes.common.dates import ParseDate
from database.models import SceneData
from database.models import LayerData

now = datetime.now()
earlier = now - timedelta(days=1)
TestScene = SceneData(
    start=earlier.isoformat(),
    end=now.isoformat(),
    thumbnail="n/a",
    layers=[LayerData(
        cadence=3600,
        start=earlier.isoformat(),
        end=now.isoformat(),
        source=1,
        scale=1
    )]
)

@pytest.fixture
def client():
    app.debug = True
    return app.test_client()

def test_upload_and_get_scene(client):
    response = client.post('/scene', json=TestScene.model_dump_json())
    assert 'id' in response.json
    assert type(response.json['id']) is int
    response = client.get(f"/scene/{response.json['id']}")
    assert response.status_code == 200
    assert response.json['thumbnail'] == 'n/a'
    assert response.json['layers'][0]['cadence'] == 3600
    assert response.json['layers'][0]['source'] == 1
    assert response.json['layers'][0]['scale'] == 1

def test_get_recent(client):
    response = client.get('/scene/latest/1')
    assert len(response.json) == 1
    assert 'scenes' in response.json
    assert type(response.json['scenes'][0]) is dict
    assert type(response.json['scenes'][0]['layers'][0]['source']) is int
