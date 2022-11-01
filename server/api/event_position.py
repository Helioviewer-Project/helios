from event_coord import get_event_coordinates, CoordinateSystem
from helios_exceptions import HeliosException


def get_event_position(coord_system, units, coord1, coord2, coord3, date, observatory):
    """
    Returns coordinates for the event with the given parameters
    :param coord_system: Coordinate system from HEK
    :type coord_system: str, CoordinateSystem
    :param units: Units for the coordinates given
    :type units: str
    :param coord1: Coordinate 1
    :type coord1: str, int
    :param coord2: Coordinate 1
    :type coord2: str, int
    :param coord3: Coordinate 1
    :type coord3: str, int, None
    :param date: Date of start of event
    :type date: datetime
    :param observatory: Observatory that made the observation
    :type observatory: str
    :return: Event coordinates
    """
    coordinates = get_event_coordinates(coord_system, coord1, coord2, coord3, date, observatory, units)
    return {
        "observer": {
            "x": coordinates["observer"][0],
            "y": coordinates["observer"][1],
            "z": coordinates["observer"][2],
        },
        "event": coordinates["event"]
    }

