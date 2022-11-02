from argparse import RawTextHelpFormatter
from argparse import ArgumentParser
from datetime import datetime
from enum import Enum
from coordinate_lookup import get_observer_coordinate
from get_heeq import convert_skycoords_to_heeq, dms_to_degrees
from helios_exceptions import HeliosException
import json
import sunpy
from sunpy.coordinates import get_earth
from numpy import isnan

from astropy.coordinates import SkyCoord
import astropy.units as u

# from get_heeq import convert_skycoords_to_heeq

PROGRAM_DESCRIPTION = """
Converts an event's coordinates into HEEQ

Known coordinate systems can be gotten from the HEK event specification:
https://www.lmsal.com/hek/VOEvent_Spec.html
"""

# Event systems supported by HEK
class CoordinateSystem(Enum):
    Stonyhurst = "UTC-HGS-TOPO"
    Projective = "UTC-HPC-TOPO"
    Carrington = "UTC-HGC-TOPO"
    Radial = "UTC-HRC-TOPO" 

    @staticmethod
    def from_str(string):
        """
        Tries to parse a string into an enum value, but throws a
        HeliosException instead of ValueError on failure.
        """
        try:
            return CoordinateSystem(string)
        except ValueError as e:
            raise HeliosException(str(e))

# Set arguments to be passed to parser.add_argument here.
# Format is ([positional_args], {keyword_args: value})
PROGRAM_ARGS = [
    (["coordinate_system"], {'type': CoordinateSystem, 'help': "Event coordinate system"}),
    (["coord1"], {'type': float, 'help': "Coordinate 1 (Event_Coord1 from HEK)"}),
    (["coord2"], {'type': float, 'help': "Coordinate 2 (Event_Coord2 from HEK)"}),
    (["units"], {'type': str, 'help': "Comma separated list of units for coords 1, 2, and 3"}),
    (["date"], {'type': datetime.fromisoformat, 'help': "Event's Start time in a UTC Date string YYYY-MM-DD HH:mm:ss"}),
    (["observatory"], {'type': str, 'help': "Observatory which made the observation"}),
    (["-c3", "--coord3"], {'type': float, 'help': "Coordinate 3 (Event_Coord3 from HEK)"})
]

def _clean_units(units):
    """
    Cleans units into a format useful for sunpy.
    """
    # From HEK, units are space separated, sunpy wants them comma separated
    comma_separated = units.replace(" ", ",")
    dedupe_commas = comma_separated.replace(",,", ",")
    degs = dedupe_commas.replace("degrees", "deg")
    arcs = degs.replace("arcseconds", "arcsec")
    return arcs

def _clean_observatory(observatory):
    """
    Attempts to return a valid event observatory
    """
    if (observatory == "various"):
        return "AIA"
    else:
        return observatory

def _generate_result(observer_heeq, event_stonyhurst, msg):
    """
    Generates a consistent return result
    """
    result = {"observer": observer_heeq, "notes": msg, "event": {
        "lat": dms_to_degrees(event_stonyhurst.lat.dms),
        "lon": dms_to_degrees(event_stonyhurst.lon.dms)
    }}
    if isnan(result["event"]["lat"]):
        result["event"]["lat"] = 0
    if isnan(result["event"]["lon"]):
        result["event"]["lon"] = 0
    return result

def process_radial_coordinates(angle, date):
    observer = get_earth(time=date)
    # radial angle starts from the north pole, latitude starts from the equator. So to get the
    # correct stonyhurst angle, add 90 to the angle.
    longitude = -90 if angle <= 180 else 90
    latitude = (90 - angle) if angle <= 180 else (angle - 270)
    event_stonyhurst = SkyCoord(longitude, latitude, unit="deg,deg", obstime=date, observer=observer, frame=sunpy.coordinates.HeliographicStonyhurst)
    observer_heeq = convert_skycoords_to_heeq(observer)
    return _generate_result(observer_heeq, event_stonyhurst, "")

def process_helioprojective_coordinates(x, y, date, observatory, units):
    """
    Converts heliprojective coordinates to a heliographic stonyhurst coordinate within a constant reference frame.
    """
    # Get the observer's position as a skycoord
    observer_coordinate = get_observer_coordinate(observatory, date)
    # Create the projective coordinate for the event
    event_coord_projective = SkyCoord(x, y, unit=units, obstime=date, observer=observer_coordinate["coordinate"], frame=sunpy.coordinates.Helioprojective)

    # Get the observer's heeq coordinate
    observer_heeq = convert_skycoords_to_heeq(observer_coordinate["coordinate"])
    # Get the event's coordinate as heliographic stonyhurst
    event_stonyhurst = event_coord_projective.transform_to(sunpy.coordinates.HeliographicStonyhurst)

    return _generate_result(observer_heeq, event_stonyhurst, observer_coordinate["notes"])

def process_stonyhurst_coordinates(lon, lat, date, observatory, units):
    # Get the observer's position as a skycoord
    observer_coordinate = get_observer_coordinate(observatory, date)
    # Get the observer's heeq coordinate
    observer_heeq = convert_skycoords_to_heeq(observer_coordinate["coordinate"])

    # Create the coordinate for the event
    # Since we're really just returning lat/lon anyway, the useful part of this is handling arbitrary units
    event_stonyhurst = SkyCoord(lon, lat, unit=units, obstime=date, observer=observer_coordinate["coordinate"], frame=sunpy.coordinates.HeliographicStonyhurst)

    return _generate_result(observer_heeq, event_stonyhurst, observer_coordinate["notes"])

def process_carrington_coordinates(x, y, z, date, observatory, units):

    # Create the coordinate for the event
    # Since we're really just returning lat/lon anyway, the useful part of this is handling arbitrary units
    event_carrington = SkyCoord(x, y, z, unit=units, obstime=date, observer="earth", frame=sunpy.coordinates.HeliographicCarrington)

    # Carrington system events are from an earth observer, so
    observer_coordinate = event_carrington.observer
    # Get the observer's heeq coordinate
    observer_heeq = convert_skycoords_to_heeq(observer_coordinate)

    event_stonyhurst = event_carrington.transform_to(sunpy.coordinates.HeliographicStonyhurst)

    return _generate_result(observer_heeq, event_stonyhurst)


def get_event_coordinates(coordinate_system, coord1, coord2, coord3, date, observatory, units):
    try:
        if (type(coordinate_system) != CoordinateSystem):
            coordinate_system = CoordinateSystem.from_str(coordinate_system)
        observatory = _clean_observatory(observatory)
        units = _clean_units(units)
        if (coordinate_system == CoordinateSystem.Radial):
            return process_radial_coordinates(coord1, date)
        elif (coordinate_system == CoordinateSystem.Projective):
            return process_helioprojective_coordinates(coord1, coord2, date, observatory, units)
        elif (coordinate_system == CoordinateSystem.Stonyhurst):
            return process_stonyhurst_coordinates(coord1, coord2, date, observatory, units)
        elif (coordinate_system == CoordinateSystem.Carrington):
            if (coord3 is None):
                raise HeliosException("Coordinate 3 is required for the carrington event coordinates")
            return process_carrington_coordinates(coord1, coord2, coord3, date, observatory, units)
    except ValueError as e:
        msg = str(e)
        # Handle a known error of entering the wrong units
        # HeliosExceptions are handled as warnings.
        # Regular exceptions are errors that should be investigated
        if ("Unit keyword must have" in msg):
            raise HeliosException(msg + " Got {}".format(units))
        else:
            raise e

# All args set will be passed as keyword args to main
def main(coordinate_system, coord1, coord2, coord3, date, observatory, units):
    print(get_event_coordinates(coordinate_system, coord1, coord2, coord3, date, observatory, units))

# Reference: https://docs.python.org/3/library/argparse.html
def parse_args():
    parser = ArgumentParser(description=PROGRAM_DESCRIPTION, formatter_class=RawTextHelpFormatter)
    for args in PROGRAM_ARGS:
        parser.add_argument(*args[0], **args[1])
    return parser.parse_args()

if __name__ == "__main__":
    args = parse_args()
    main(**vars(args))
