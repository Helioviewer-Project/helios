# RawTextHelpFormatter allows PROGRAM_DESCRIPTION to be a multiline str.
# Without passing this to argparse, it will print PROGRAM_DESCRIPTION to stdout all on one line even if it has newline characters.
from argparse import RawTextHelpFormatter
from argparse import ArgumentParser
from datetime import datetime
import hvpy
from sources import find_sourceid
from jp2parser import JP2parser
from tempfile import mkstemp
from sunpy.map import Map
from sunpy.util.xml import xml_to_dict
from helios_exceptions import HeliosException
import os
import numpy as np
import logging

# This is passed to ArgumentParser's "description."
# It is the information printed before the accepted arguments when you run the script with "-h/--help"
PROGRAM_DESCRIPTION = "Looks up the coordinates of an observatory using jp2 images"

# Set arguments to be passed to parser.add_argument here.
# Format is ([positional_args], {keyword_args: value})
# Each row is equivalent to argparse.add_argument(positional_args, key1=value1, key2=value2, etcetera)
PROGRAM_ARGS = [
    (['observatory'], {'type': str, 'help': "The observatory/instrument to lookup"}),
    (['date'], {'type': datetime.fromisoformat, 'help': "The UTC time to use for the lookup"}),
]

# Stores a cache of information to reduce the number of queries.
# TODO: Make cache persistent
# Layout is key = "<source_id>_date"
_CACHE = {}

def observatory2source_id(observatory):
    """
    Mapping of observatories to source ids
    """
    source = find_sourceid(observatory)
    found = True
    if (source is None):
        source = find_sourceid("AIA")
        found = False
    return {
        "source": source,
        "found": found
    }

def get_observer_coordinate_by_id(id):
    # Get the jp2 header for that image, this contains the position we want
    jp2_header = hvpy.getJP2Header(id=id)
    if ("error" in jp2_header and "errno" in jp2_header):
        logging.error(jp2_header)
        raise HeliosException("Couldn't find image with id {}".format(id))
    # Finagle that header data into a format sunpy will enjoy
    # This trick is done in helioviewer
    data = xml_to_dict(jp2_header)
    parser = JP2parser("")
    fits_block = parser.process_header(data['meta']['fits'])
    data_for_sunpy = [(np.zeros([1, 1]), fits_block[0])]
    # Pass that data to sunpy to map it
    sunpy_map = Map(data_for_sunpy)
    # Finally return the coordinate
    return sunpy_map.observer_coordinate

def _get_cache_key(source_id, date):
    """
    Returns a key that can be used to lookup data in the cache
    :param source_id: observatory source id
    :param date: Date of observation
    """
    # Returns the year/date/time to the minute
    date_str = str(date)[0:-3]
    return "{}_{}".format(source_id, date_str)

def get_observer_coordinate(observatory, date):
    """
    Uses a local database of jp2 images to find an observatory's position in space.
    """
    # Map the observatory to a source id
    lookup = observatory2source_id(observatory)
    source_id = lookup["source"]
    # first check the cache
    cache_key = _get_cache_key(observatory, date)
    if (cache_key in _CACHE):
        logging.debug("Cache hit: {}".format(cache_key))
        return _CACHE[cache_key]
    logging.debug("Cache miss: {}".format(cache_key))

    # Cache miss, continue query
    # Get the nearest image to the date we want for that source id
    closest_image = hvpy.getClosestImage(date=date, sourceId=source_id)

    coordinate = get_observer_coordinate_by_id(closest_image["id"])
    note = ""
    if not lookup["found"]:
        note = "No position data available for {}, defaulting to AIA".format(observatory)
    result = {
        "coordinate": coordinate,
        "notes": note
    }
    _CACHE[cache_key] = result
    return result

# All args passed in will be passed as keyword args to main.
def main(observatory, date):
    coordinate = get_observer_coordinate(observatory, date)

# Reference: https://docs.python.org/3/library/argparse.html
# This is the part you've probably typed out a million times and had to check the reference for it every single time.
def parse_args():
    parser = ArgumentParser(description=PROGRAM_DESCRIPTION, formatter_class=RawTextHelpFormatter)
    for args in PROGRAM_ARGS:
        parser.add_argument(*args[0], **args[1])
    return parser.parse_args()

if __name__ == "__main__":
    args = parse_args()
    main(**vars(args))
