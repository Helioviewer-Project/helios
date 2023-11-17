import gzip
import concurrent.futures
import struct
from datetime import datetime

from flask import request
from flask_openapi3 import OpenAPI
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .models import Model, Layer, Scene, SceneData
from .query import QueryGong
from ._db import engine
from helios_exceptions import HeliosExceptionResponse
from routes.common.response import SendResponse
from routes.common.dates import ParseDate
from meta.mimetype import MimeType
import routes.tags as Tags

def _ReadFile(fname: str) -> bytes:
    with open(fname, "rb") as fp:
        return fp.read()

def _Get(model: Model, id: int) -> dict:
    with Session(engine) as session:
        return session.get(Scene, id)

class GetScenePathParameters(BaseModel):
    id: int

class PostSceneResponse(BaseModel):
    id: int

class GetRecentPathParameters(BaseModel):
    count: int

class GetRecentResponse(BaseModel):
    scenes: list[SceneData]

class GetGongPFSSQueryParameters(BaseModel):
    dates: list[datetime]

def register(app: OpenAPI):
    @app.get("/scene/<id>",
             summary="Get metadata for the given scene",
             tags=[Tags.Scene],
             responses={
                 200: SceneData,
                 400: HeliosExceptionResponse
             })
    def get_scene(path: GetScenePathParameters):
        scene = _Get(Scene, path.id)
        print(scene)
        return scene.as_dict()

    @app.get("/scene/latest/<count>",
             summary="Get a list of the latest scenes",
             tags=[Tags.Scene],
             responses={
                 200: GetRecentResponse
             })
    def get_recent(path: GetRecentPathParameters):
        with Session(engine) as session:
            query = session.query(Scene).order_by(Scene.id.desc()).limit(path.count)
            response = GetRecentResponse(
                scenes=list(map(lambda s: SceneData.model_validate(s.as_dict()).model_dump(), query))
            )
            return response.model_dump()

    @app.post("/scene",
              summary="Upload a new scene",
              tags=[Tags.Scene],
              responses={
                  200: PostSceneResponse
              })
    def post_scene(body: SceneData):
        data = body.model_dump(exclude=['created_at'])
        data['layers'] = list(map(lambda layer: Layer.from_dict(layer), data['layers']))
        scene = Scene.from_dict(data)
        scene.created_at = datetime.now()
        with Session(engine) as session:
            session.add(scene)
            session.commit()
            id = scene.id
        return PostSceneResponse(id=id).model_dump()

    @app.get("/pfss/gong/",
             summary="Field lines generated from GONG data",
             tags=[Tags.PFSS],
             responses={
                 200: {
                     'content': {
                        MimeType.Binary.value: {
                            'schema': {
                                'type': 'object'
                            }
                        }
                     }
                 }
             })
    def get_field_lines_gong(query: GetGongPFSSQueryParameters):
        dates = query.dates
        with concurrent.futures.ThreadPoolExecutor() as executor:
            futures = [executor.submit(QueryGong, date) for date in dates]
            # Put results into a set to remove duplicates.
            # There may be duplicate results when the requested dates return the same gong file
            query_results = set([future.result() for future in futures])
            # Remove "Nones" (if there is any None, they will all be None because it means the database is empty)
            without_nones = filter(lambda x: x is not None, query_results)
            # Put deduped results back into a list and sort
            sorted_result = sorted(without_nones, key=lambda x: x.date)
            # Load data for each result
            data_futures = [executor.submit(_ReadFile, pfss.path) for pfss in sorted_result]
            data = [future.result() for future in data_futures]
            # Build file bundle
            bytes = bytearray()
            bytes += struct.pack(">i", len(data))
            for binary in data:
                # Add length of the binary
                bytes += struct.pack(">I", len(binary))
                bytes += binary
            gzipped = gzip.compress(bytes, compresslevel=1)
            return SendResponse(gzipped, mime=MimeType.Binary)
