"""
This script is used to generate field line traces for Helios.

This is a long running script. To run it, provide a date in ISO format.
The script will begin producing binary files in `data/gong/<year>/<month>/<day>/*.bin`.
It works from the day you gave and starts working backwards to 1995.

The binary files can be read into python with the pfss.py script packaged with this script (not the pfsspy library).

The binary format was chosen to reduce the required bandwidth to send PFSS data to the web browser.
Storing all the line points in JSON used ~10x more space, and FITS tables took ~4x more space.
"""
import os
import time
import logging
import concurrent.futures
from datetime import date, datetime
from pathlib import Path
from argparse import ArgumentParser, RawTextHelpFormatter

import numpy as np
import pfsspy
import pfsspy.utils
import pfsspy.tracing as tracing
import astropy.constants as const
import astropy.units as u
import sunpy.map
from astropy.coordinates import SkyCoord
from dateutil.relativedelta import relativedelta
from sunpy.coordinates import frames, get_earth, transform_with_sun_center
from sunpy.net import Fido, attrs as a
from pfsspy import tracing

from scripts.pfss.pfss import PFSS, PFSSLine

log = logging.getLogger("sunpy")
log.setLevel("WARNING")


def trace_lines(map: sunpy.map.Map, level_of_detail: int) -> list:
    """
    Traces the field lines for the given map.
    The level of detail represents the number of latitude/longitude points to use as seeds.
    The final output will have level_of_detail squared lines in it.
    i.e. level_of_detail = 4 -> 16 lines, 8 -> 64 lines, 16 -> 256 lines
    """
    ###############################################################################
    # From the boundary condition, number of radial grid points, and source
    # surface, we now construct an Input object that stores this information
    nrho = 35
    rss = 2.5
    pfss_in = pfsspy.Input(map, nrho, rss)
    pfss_out = pfsspy.pfss(pfss_in)
    pfss_out.bunit
    tracer = tracing.FortranTracer()
    r = 1.1 * const.R_sun
    lat = np.linspace(-np.pi / 2, np.pi / 2, level_of_detail, endpoint=True)
    lon = np.linspace(-np.pi, np.pi, level_of_detail, endpoint=True)
    lat, lon = np.meshgrid(lat, lon, indexing="ij")
    lat, lon = lat.ravel() * u.rad, lon.ravel() * u.rad
    seeds = SkyCoord(
        lon,
        lat,
        r,
        frame=frames.HeliographicStonyhurst,
        observer=map.observer_coordinate,
        obstime=map.observer_coordinate.obstime,
    )

    return tracer.trace(seeds, pfss_out)


def build_field_lines_json(field_lines: list, date: datetime) -> PFSS:
    # HGS observer time = 2018-08-11 00:00:00
    # Representation is x, y, z
    # Distance units in solar radii
    # Set the observer an measurement units as expected by helios
    field_line_observer = get_earth("2018-08-11 00:00:00")
    field_line_observer.representation_type = "cartesian"
    d_unit = u.solRad

    # Create the fieldlines dictionary
    fieldlines = PFSS(date=date, lines=[])
    this_field_line = -1
    for field_line in field_lines:
        flc = field_line.coords

        if len(flc) > 0:
            this_field_line = this_field_line + 1
            with transform_with_sun_center():
                hgs = field_line.coords.transform_to(field_line_observer)
                hgs.representation_type = "cartesian"
                b_along_fline = field_line.b_along_fline * u.G
                b_along_fline = b_along_fline.value
                fieldlines.lines.append(
                    PFSSLine(
                        polarity=field_line.polarity,
                        x=hgs.x.to(d_unit).value.tolist(),
                        y=hgs.y.to(d_unit).value.tolist(),
                        z=hgs.z.to(d_unit).value.tolist(),
                        b_mag=np.sqrt(
                            b_along_fline[:, 0] ** 2
                            + b_along_fline[:, 1] ** 2
                            + b_along_fline[:, 2] ** 2
                        ).tolist(),
                    )
                )
    return fieldlines


def save_field_lines(lines: PFSS, level_of_detail: int):
    """
    Saves the generated line dict

    Parameters
    ----------
    date: `datetime`
        Datetime associated with this line set

    lines: `dict`
        Dictionary containing line data

    level_of_detail: `int`
        Number representing the number of lines in the file (lines = (lod-1)**2)
    """

    # Make the path to write the file to based on the date.
    directory_path = os.path.join(
        "data",
        "gong",
        str(lines.date.year),
        "%02d" % lines.date.month,
        "%02d" % lines.date.day,
    )
    os.makedirs(directory_path, exist_ok=True)
    fname = (
        f"{directory_path}/lod_{level_of_detail}__"
        + lines.date.strftime("%Y_%m_%d__%H_%M_%S")
        + ".bin"
    )
    lines.save(fname)


def delete_files(files: list):
    for fname in files:
        Path(fname).unlink()
        print(f"Deleted {fname}", flush=True)


def process_field_lines(final_gong_map: sunpy.map.Map, date: datetime, lod: int):
    print(f"Working on lines for {date} LOD {lod}", flush=True)
    start = time.time()
    field_lines = trace_lines(final_gong_map, lod)
    data = build_field_lines_json(field_lines, date)
    save_field_lines(data, lod)
    end = time.time()
    print(f"LOD {lod} Took {end - start} seconds")
    print(f"Saved lines for {date} LOD {lod}", flush=True)


def generate_field_lines_for_map(map: sunpy.map.Map):
    # put this in a loop for to go over all of the files
    gong_map = sunpy.map.Map(map)
    process_field_lines(gong_map, gong_map.date.datetime, 33)


def generate_field_lines(start_date, end_date):
    print(f"Creating field lines between {start_date} and {end_date}", flush=True)
    result = Fido.search(a.Time(start_date, end_date), a.Instrument("GONG"))
    files = Fido.fetch(result)

    # Use process pool to spin up a process to work on the files in parallel
    with concurrent.futures.ProcessPoolExecutor() as executor:
        futures = [
            executor.submit(generate_field_lines_for_map, gong_map)
            for gong_map in files
        ]
        # Wait for all files to be processed
        [future.result() for future in futures]

    delete_files(files)

    return "Done"


def generate_all_field_lines(start: datetime):
    """
    Traces GONG maps starting from the given date and working backwards to 1995.

    Parameters
    ----------
    start: `datetime`
        The date used to begin processing.
    """
    end_date = start
    start_date = end_date - relativedelta(days=1)
    target_date = date(1995, 1, 1)
    while start_date >= target_date:
        print(
            "Creating lines for " + str(start_date) + " to " + str(end_date), flush=True
        )
        generate_field_lines(start_date, end_date)

        # Subtract one day from the dates
        end_date = start_date
        start_date = end_date - relativedelta(days=1)


def get_nearest_field_lines(CheckingDateTime):
    car = sunpy.coordinates.sun.carrington_rotation_number(CheckingDateTime)
    return "lines" + str(round(car - 1)) + ".json"


# Call the function with the desired CheckingDateTime value
if __name__ == "__main__":
    parser = ArgumentParser(description=__doc__, formatter_class=RawTextHelpFormatter)
    parser.add_argument("start_date", type=date.fromisoformat, help="Date to begin processing")
    args = parser.parse_args()
    generate_all_field_lines(args.start_date)
