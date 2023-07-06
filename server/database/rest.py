from database.models import Model, Layer, Scene
from flask import Flask, request
from ._db import engine
from sqlalchemy.orm import Session

def _Get(model: Model, id: int) -> dict:
    with Session(engine) as session:
        return session.get(Scene, id)

def init(app: Flask, send_response, parse_date):
    @app.route("/scene/<id>", methods=["GET"])
    def get_scene(id: int):
        scene = _Get(Scene, id)
        return send_response(scene.as_dict())

    @app.route("/scene", methods=["POST"])
    def post_scene():
        layers = request.get_json()
        scene = Scene()
        for data in layers:
            data["start"] = parse_date(data["start"])
            data["end"] = parse_date(data["end"])
            layer = Layer(**{k: data[k] for k in Layer.settable if k in data})
            print(layer)
            scene.layers.append(layer)
        with Session(engine) as session:
            session.add(scene)
            session.commit()
            print(scene)
        return send_response({"id": scene.id})
