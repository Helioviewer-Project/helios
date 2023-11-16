from datetime import datetime

from flask_openapi3 import OpenAPI
from pydantic import BaseModel
from helios_exceptions import HeliosExceptionResponse

from api.events import Event
from routes import tags as Tags

class EventLookupPathParameters(BaseModel):
    start: datetime
    end: datetime

class EventResponse(BaseModel):
    results: list[Event]

def register(app: OpenAPI):
    @app.get("/event",
             summary="Get a list of events between the given dates",
             tags=[Tags.Event],
             responses={
                 200: EventResponse,
                 400: HeliosExceptionResponse
             })
    def get_events(query: EventLookupPathParameters):
        start = query.start
        end = query.end

        from api.events import lookup_hek_events
        events = lookup_hek_events(start, end)
        return EventResponse(results=events['results']).model_dump()
