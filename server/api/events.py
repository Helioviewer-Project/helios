from event_coord import get_event_coordinates, CoordinateSystem
from hek import query_hek
def lookup_hek_events(start_time: str, end_time: str):
    """
    Looks up HEK events that occur within the given time range

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
        results["results"].append({
            "coordinates": {
                "observer": {
                    "x": coordinates["observer"][0],
                    "y": coordinates["observer"][1],
                    "z": coordinates["observer"][2],
                },
                "event": coordinates["event"]
            },
            "info": {
                "id": event["kb_archivid"],
                "type": event["concept"]
            }
        })
    return results

