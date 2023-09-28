from database.models import Model, Layer, Scene
from database.query import QueryGong
from flask import Flask, request
from ._db import engine
from sqlalchemy.orm import Session
from sqlalchemy import text
import gzip
import concurrent.futures
import json

def LoadJson(fname: str) -> dict:
    with open(fname, "r") as fp:
        return json.load(fp)

def _Get(model: Model, id: int) -> dict:
    with Session(engine) as session:
        return session.get(Scene, id)

def init(app: Flask, send_response, parse_date):
    @app.route("/scene/<id>", methods=["GET"])
    def get_scene(id: int):
        scene = _Get(Scene, id)
        return send_response(scene.as_dict())

    @app.route("/scene/latest/<count>")
    def get_recent(count: int):
        with Session(engine) as session:
            query = session.query(Scene).order_by(Scene.id.desc()).limit(count)
            return send_response(list(map(lambda s: s.as_dict(), query)))

    @app.route("/scene", methods=["POST"])
    def post_scene():
        data = request.get_json()
        print(data)
        scene = Scene()
        scene.created_at = parse_date(data["created_at"])
        scene.start = parse_date(data["start"])
        scene.end = parse_date(data["end"])
        scene.thumbnail = data["thumbnail"]
        scene.layers = []
        for layer in data["layers"]:
            layer["start"] = parse_date(data["start"])
            layer["end"] = parse_date(data["end"])
            newLayer = Layer(**{k: layer[k] for k in Layer.settable if k in layer})
            scene.layers.append(newLayer)
        with Session(engine) as session:
            session.add(scene)
            session.commit()
            print(scene)
        return send_response({"id": scene.id})

    @app.route("/pfss/gong")
    def get_field_lines_gong():
        date_inputs = request.args.getlist('date')
        dates = map(lambda date: parse_date(date), date_inputs)
        with concurrent.futures.ProcessPoolExecutor(10) as executor:
            futures = [executor.submit(QueryGong, date) for date in dates]
            # Put results into a set to remove duplicates.
            # There may be duplicate results when the requested dates return the same gong file
            query_results = set([future.result() for future in futures])
            # Remove "Nones" (if there is any None, they will all be None because it means the database is empty)
            without_nones = filter(lambda x: x is not None, query_results)
            # Put deduped results back into a list and sort
            sorted_result = sorted(without_nones, key=lambda x: x.date)
            # Load json for each result and return
            json_futures = [executor.submit(LoadJson, pfss.path) for pfss in sorted_result]
            json_data = [future.result() for future in json_futures]
            # This data can be pretty big, so gzip it before sending it.
            gzipped = gzip.compress(json.dumps(json_data).encode('utf-8'))
            return send_response(gzipped)
