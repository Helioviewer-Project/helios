from astropy.coordinates import SkyCoord
from get_heeq import convert_skycoords_to_heeq
import sunpy.coordinates
import requests
from datetime import datetime

def _create_normalized_coordinate(time, position):
    """
    Create a sunpy coordiante and normalize it to the reference point
    """
    coord = SkyCoord(position[2], position[1], position[0], unit="deg,deg,km", obstime=time, frame=sunpy.coordinates.HeliographicStonyhurst)
    return convert_skycoords_to_heeq(coord)

def _normalize_data(data):
    """
    Normalizes data returned by the geometry service into an array of skycoords
    The format of data is:
    {
        'result': {
            <ISO_DATE>: [
                distance_from_sun (kilometers)
                latitude, (degrees)
                longitude (degrees)
            ]
        }
    }
    """
    trajectory_points = data['result']
    out = []
    for point in trajectory_points:
        (obstime, position) = point.popitem()
        out.append(_create_normalized_coordinate(obstime, position))
    return out

def _query_psp_position(start, end):
    """
    Parameters
    ----------
    start : `datetime`
        Start of time range to query
    end : `datetime`
        End of time range to query
    """
    utc_start = start.isoformat()
    utc_end = end.isoformat()
    dt = 3600
    data = requests.get(f"http://swhv.oma.be/position?utc={utc_start}&utc_end={utc_end}&deltat={dt}&observer=PSP&target=SUN&ref=HEEQ&kind=latitudinal").json()
    return _normalize_data(data)

def get_psp_position(start, end):
    """
    Query the geometry service for PSP's hourly position

    Parameters
    ----------
    start : `datetime`
        Start of time range to query
    end : `datetime`
        End of time range to query
    """
    return _query_psp_position(start, end)

#######################################################
# Template code below for making a command line script#
#######################################################

# RawTextHelpFormatter allows PROGRAM_DESCRIPTION to be a multiline str.
# Without passing this to argparse, it will print PROGRAM_DESCRIPTION to stdout all on one line even if it has newline characters.
from argparse import RawTextHelpFormatter
from argparse import ArgumentParser

# This is passed to ArgumentParser's "description."
# It is the information printed before the accepted arguments when you run the script with "-h/--help"
PROGRAM_DESCRIPTION = "Returns a list of coordinates for PSP's trajectory"

# Set arguments to be passed to parser.add_argument here.
# Format is ([positional_args], {keyword_args: value})
# Each row is equivalent to argparse.add_argument(positional_args, key1=value1, key2=value2, etcetera)
PROGRAM_ARGS = [
    (['start'], {'type': datetime.fromisoformat, 'help': "The start of the time range to lookup"}),
    (['end'], {'type': datetime.fromisoformat, 'help': "The end of the time range to lookup"}),
]

# All args passed in will be passed as keyword args to main.
def main(start, end):
    print(get_psp_position(start, end))

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
