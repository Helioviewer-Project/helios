from argparse import ArgumentParser
from sunpy.map import Map
from astropy.coordinates.sky_coordinate import SkyCoord
import astropy.units as u
import math
import pickle
import sys
import jp2parser

PROGRAM_DESCRIPTION = "Extract observer's HEEQ coordinates from a jp2 file via sunpy"

# Arguments to pass to parser.add_argument
PROGRAM_ARGS = [
    (['jp2'], {'type': str, 'help': 'JP2 file to extract coordinates from'})
]

def load_reference_point():
    ref = None
    with open("ref_point.pickle", "rb") as fp:
        ref = pickle.load(fp)
    return ref

REFERENCE_POINT = load_reference_point()

def main(jp2: str):
    heeq_coords = get_heeq_coordinates_from_jp2_file(jp2)
    print("HEEQ Coords (km): " + str(heeq_coords))

def get_heeq_coordinates_from_jp2_file(jp2: str):
    jp2_map = get_jp2_map(jp2)
    heeq_coords = get_heeq_coordinates_from_jp2(jp2_map)
    return heeq_coords

def get_jp2_map(jp2: str):
    parser = jp2parser.JP2parser(jp2)
    return Map(parser.read_header_only_but_still_use_sunpy_map())

def get_heeq_coordinates_from_jp2(jp2_map: Map):
    """
    Extracts HEEQ coordinates from a jp2 file
    """
    return convert_skycoords_to_heeq(jp2_map.observer_coordinate)


def convert_skycoords_to_heeq(base_coords):
    coords = base_coords.transform_to(REFERENCE_POINT)
    longitude = dms_to_radians(coords.lon.dms)
    latitude = dms_to_radians(coords.lat.dms)
    radius = coords.radius.to_value("km")
    return {
        "x": get_heeq_x_from_stonyhurst(radius, latitude, longitude),
        "y": get_heeq_y_from_stonyhurst(radius, latitude, longitude),
        "z": get_heeq_z_from_stonyhurst(radius, latitude, longitude)
    }

def get_heeq_x_from_stonyhurst(radius, lat, long):
    return radius * math.cos(lat) * math.cos(long)

def get_heeq_y_from_stonyhurst(radius, lat, long):
    return radius * math.cos(lat) * math.sin(long)

def get_heeq_z_from_stonyhurst(radius, lat, long):
    return radius * math.sin(lat)

def dms_to_radians(dms):
    degrees = dms_to_degrees(dms)
    return (degrees * math.pi) / 180

def dms_to_degrees(dms):
    degrees = dms.d
    degrees += (dms.m / 60)
    degrees += (dms.s / 3600)
    return degrees

#######################
# Template code below #
#######################
# Reference: https://docs.python.org/3/library/argparse.html
def parse_args():
    parser = ArgumentParser(description=PROGRAM_DESCRIPTION)
    for args in PROGRAM_ARGS:
        parser.add_argument(*args[0], **args[1])
    return parser.parse_args()

if __name__ == "__main__":
    args = parse_args()
    main(**vars(args))
