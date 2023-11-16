from datetime import datetime

from pydantic import BaseModel

from get_heeq import Coordinate
from event_coord import get_event_coordinates, CoordinateSystem
from hek import query_hek

class EventPosition(BaseModel):
    lat: float
    lon: float

class EventCoordinateDetails(BaseModel):
    event: EventPosition
    notes: str
    observer: Coordinate

class Event(BaseModel):
    vo_event: dict
    coordinates: EventCoordinateDetails

def lookup_hek_events(start_time: datetime, end_time: datetime) -> list[Event]:
    """
    Looks up HEK events that occur within the given time range

    TODO: This should use the Helioviewer Event Interface since it will be faster.

    :param start_time: Beginning of time range to query
    :type start_time: str
    :param end_time: End of time range to query
    :type end_time: str
    :return: List of events
    """
    # Query all events
    events = query_hek(start_time, end_time)
    # List that is going to be returned
    results = {"results": []}
    # For each event, transform them into usable coordinates
    for event in events:
        system = CoordinateSystem.from_str(event["event_coordsys"])
        coordinates = get_event_coordinates(system, event["event_coord1"], event["event_coord2"], event["event_coord3"], event["event_starttime"].to_datetime(), event["obs_instrument"], event["event_coordunit"])
        # Convert Coordinate object to json to prepare it to be sent back to the client
        # Convert the event data into a serializable dictionary
        event_dict = {k:str(v) for (k,v) in zip(event.keys(), event.values())}
        # Python needs a way for us to make a class serializable.
        # How is this not a language feature?
        coordinates['observer'] = coordinates['observer'].model_dump()
        vo_event = Event(vo_event=event_dict, coordinates=coordinates)
        results["results"].append(vo_event)
    return results

