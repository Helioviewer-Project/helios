from database.models import Model, Layer, Scene
from flask import Flask, request
from ._db import engine
from sqlalchemy.orm import Session
from sqlalchemy import text

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

    @app.route("/lines/gong/<date>")
    def get_field_lines_gong(date):
        date = parse_date(date)
        date_str = date.strftime("%Y-%m-%d %H:%M:%S")
        with Session(engine) as session:
            result = session.execute(text(f"""
                SELECT s.path, s.date as timestamp FROM (
                    SELECT * FROM (SELECT path, date FROM pfss WHERE date <= "{date_str}" ORDER BY date DESC LIMIT 1)
                    UNION ALL
                    SELECT * FROM (SELECT path, date FROM pfss WHERE date > "{date_str}" ORDER BY date ASC LIMIT 1)
                ) s
                ORDER BY ABS(julianday(s.date) - julianday("{date_str}"))
                LIMIT 1;
            """))
            row = list(result)
            return send_response({"path": row[0][0], "date": row[0][1]})
