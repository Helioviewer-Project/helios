from argparse import ArgumentParser
from pydantic import BaseModel

from sunpy.map import Map
import sunpy.coordinates
from sunpy.coordinates import transform_with_sun_center
import astropy.units as u

import jp2parser

PROGRAM_DESCRIPTION = "Extract observer's HEEQ coordinates from a jp2 file via sunpy"

# Arguments to pass to parser.add_argument
PROGRAM_ARGS = [
    (['jp2'], {'type': str, 'help': 'JP2 file to extract coordinates from'})
]

REFERENCE_POINT = sunpy.coordinates.get_earth("2018-08-11 00:00:00")

class Coordinate(BaseModel):
    x: float
    y: float
    z: float

    def __getitem__(self, name):
        if name not in ['x', 'y', 'z']:
            raise KeyError(name)
        return getattr(self, name)

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


def convert_skycoords_to_heeq(base_coords) -> Coordinate:
    with transform_with_sun_center():
        coords = base_coords.transform_to(REFERENCE_POINT)
        coords.representation_type="cartesian"
        return Coordinate(
            x=coords.x.to(u.solRad).value,
            y=coords.y.to(u.solRad).value,
            z=coords.z.to(u.solRad).value
        )

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
