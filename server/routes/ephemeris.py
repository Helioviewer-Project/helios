from datetime import datetime

from flask_openapi3 import OpenAPI
from pydantic import BaseModel, Field

from . import tags as Tags
from helios_exceptions import HeliosExceptionResponse
from get_heeq import Coordinate
import api.ephemeris as ephemeris

class Jp2IdPathParameters(BaseModel):
    id: int = Field(description="Helioviewer JPEG2000 ID.")

class EphemerisPathParameters(BaseModel):
    provider: str = Field(description="One of the ephemeris providers. ['horizons']")
    body: str = Field(description="Observatory/Celestial body of interest.")

class EphemerisQueryParameters(BaseModel):
    dates: list[datetime] = Field(description="List of dates to return coordinates for.", min_length=1)

class EphemerisResponse(BaseModel):
    positions: list[Coordinate] = Field(description="One coordinate for each date given")

def register(app: OpenAPI):
    @app.get("/observer/position/<id>",
             summary="Get observer coordinates for an image",
             tags=[Tags.Ephemeris],
             responses={
                 200: Coordinate,
                 400: HeliosExceptionResponse
             })
    def position_from_jp2(path: Jp2IdPathParameters):
        """
        Returns the observer position for a specific jpeg2000 image.
        """
        from api.observer_position import get_observer_position
        return get_observer_position(path.id)

    @app.get("/ephemeris/<provider>/<body>",
             summary="Get general coordinates",
             tags=[Tags.Ephemeris],
             responses={
                 200: EphemerisResponse,
                 400: HeliosExceptionResponse
             })
    def get_positions(path: EphemerisPathParameters, query: EphemerisQueryParameters):
        return ephemeris.Get(path.provider, path.body, query.dates)