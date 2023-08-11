
import os
import math
import astropy.units as u
import matplotlib.pyplot as plt
import numpy as np
from astropy.coordinates import SkyCoord
import pickle

from datetime import date
from dateutil.relativedelta import relativedelta
import pfsspy
import pfsspy.tracing as tracing
from pfsspy.sample_data import get_gong_map
import json
import astropy.constants as const
import astropy.units as u
import matplotlib.pyplot as plt
import numpy as np
# import sunpy.map
from astropy.coordinates import SkyCoord
from datetime import datetime

from sunpy.coordinates import frames, get_earth, transform_with_sun_center

import os

import sunpy.map
from sunpy.net import Fido
from sunpy.net import attrs as a
import pfsspy.utils
import pfsspy

from pfsspy import coords, tracing
from pfsspy.sample_data import get_gong_map
from sunpy.net import Fido, attrs as a
from datetime import date

def generate_field_lines(day, month, year, EndDate, StartDate):
    result = Fido.search(a.Time(StartDate ,EndDate), 
                        a.Instrument('GONG'))  
    files = Fido.fetch(result)
    print(files)
    for i in range(0,len(files)):
        # put this in a loop for to go over all of the files 
        hmi_map= sunpy.map.Map(files[i])
        date = hmi_map.date.datetime.strftime("%Y-%m-%d %H:%M:%S")
        final_hmi_map = hmi_map.resample([360, 144] * u.pixel)
        nrho = 35
        rss = 2.5

        ###############################################################################
        # From the boundary condition, number of radial grid points, and source
        # surface, we now construct an Input object that stores this information
        pfss_in = pfsspy.Input(final_hmi_map, nrho, rss)
        pfss_out = pfsspy.pfss(pfss_in)
        pfss_out.bunit
        tracer = tracing.FortranTracer()
        r = 1.1 * const.R_sun
        lat = np.linspace(-np.pi/2, np.pi/2, 8, endpoint=True)
        lon = np.linspace( -np.pi, np.pi, 8, endpoint=True)
        lat, lon = np.meshgrid(lat, lon, indexing='ij')
        lat, lon = lat.ravel() * u.rad, lon.ravel() * u.rad
        seeds = SkyCoord(lon, lat, r, frame=frames.HeliographicStonyhurst, observer=final_hmi_map.observer_coordinate, obstime=final_hmi_map.observer_coordinate.obstime)

        field_lines = tracer.trace(seeds, pfss_out)

        # HGS observer time = 2018-08-11 00:00:00
        # Representation is x, y, z
        # Distance units in solar radii

        # Set the observer an measurement units as expected by helios
        field_line_observer = get_earth("2018-08-11 00:00:00")

        field_line_observer.representation_type='cartesian'
        d_unit = u.solRad
        b_unit = u.G
        # Get the observer information and put it in a dictionary
        observer = {"obstime": {"value": field_line_observer.obstime.value,
                                "scale": field_line_observer.obstime.scale,
                                "format": field_line_observer.obstime.format},
                    "x": {"value": field_line_observer.x.to(d_unit).value,
                            "unit": str(d_unit)},
                    "y": {"value": field_line_observer.y.to(d_unit).value,
                            "unit": str(d_unit)},
                    "z": {"value": field_line_observer.z.to(d_unit).value,
                            "unit": str(d_unit)},
                    "frame": field_line_observer.name}

        # Create the fieldlines dictionary
        fieldlines = {"frame": {"x_unit": str(d_unit),
                                                "y_unit": str(d_unit),
                                                "z_unit": str(d_unit),
                                                "coordinate_system": "Heliographic Stonyhurst",
                                    "source_map_obstime": {"value": final_hmi_map.date.value,
                                                    "scale": final_hmi_map.date.scale,
                                                    "format": final_hmi_map.date.format}},
                    "field_description": {"b_unit": str(b_unit),
                                            "bx_value": "x component of field vector",
                                            "by_value": "y component of field vector",
                                            "bz_value": "z component of field vector",
                                            "b_mag": "magnitude of field"},
                    "lines": []}
        this_field_line = -1
        for field_line in field_lines:
            flc = field_line.coords
            
            if len(flc) > 0:
                this_field_line = this_field_line + 1
                with transform_with_sun_center():
                    hgs = field_line.coords.transform_to(final_hmi_map.observer_coordinate)
                    hgs.representation_type='cartesian'
                    b_along_fline = field_line.b_along_fline * u.G
                    b_along_fline = b_along_fline.value
                    fieldlines["lines"].append({"x":hgs.x.to(d_unit).value.tolist(),
                                                    "y": hgs.y.to(d_unit).value.tolist(),
                                                    "z": hgs.z.to(d_unit).value.tolist(),
                                                    "polarity":field_line.polarity,
                                                    "bx_value": b_along_fline[:,0].tolist(),
                                                    "by_value": b_along_fline[:,1].tolist(),
                                                    "bz_value": b_along_fline[:,2].tolist(),
                                                    "b_mag": np.sqrt(b_along_fline[:,0]**2 + b_along_fline[:,1]**2 + b_along_fline[:,2]**2).tolist()})
                    color = {0: 'black', -1: 'tab:blue', 1: 'tab:red'}.get(field_line.polarity)


        output1 = {'fieldlines': fieldlines}
        date1 = hmi_map.date.datetime.strftime("%Y_%m_%d__%H_%M_%S")
        filename1 = date1 + ".json"

        # Specify the directory path
        directory_path = 'data/' + year 
        if os.path.exists(directory_path) and os.path.isdir(directory_path):
            directory_path = 'data/' + year + "/" + hmi_map.date.datetime.strftime("%m")
            if os.path.exists(directory_path) and os.path.isdir(directory_path):
                # Open the file in write mode
                file_path = directory_path + "/" + filename1
                with open(file_path, "w") as json_file:
                    json.dump(output1, json_file)
                print("new file")
            else:
                os.makedirs(directory_path)
                file_path = directory_path + "/" + filename1
                with open(file_path, "w") as json_file:
                    json.dump(output1, json_file)
                print("new month,new file")
        else: 
            os.makedirs(directory_path)
            directory_path = 'data/' + year + "/" + hmi_map.date.datetime.strftime("%m")
            os.makedirs(directory_path)
            file_path = directory_path + "/" + filename1
            with open(file_path, "w") as json_file:
                json.dump(output1, json_file)
            print("New year, new month, new file")
    return "Done" 

def generate_all_field_lines():
    up_bound_date = date(2023, 8, 1)
    low_bound_date = up_bound_date - relativedelta(days=1)
    target_date = date(1995, 1, 1)
    while up_bound_date >= target_date:
        # Convert the current date to a string
        m = up_bound_date.month
        y = up_bound_date.year
        d = up_bound_date.day
        date_string = up_bound_date.strftime("%Y/%m/%d")
        date_string1 = low_bound_date.strftime("%Y/%m/%d")
        generate_field_lines(str(d),str(m),str(y),date_string, date_string1)
        print("The lines being created are from " + date_string + " to " + date_string1) 

        # Subtract one month from the dates
        up_bound_date = low_bound_date
        low_bound_date = up_bound_date - relativedelta(days=1)
   

def get_nearest_field_lines(CheckingDateTime):
    car = sunpy.coordinates.sun.carrington_rotation_number(CheckingDateTime)
    return ('lines' + str(round(car-1)) + '.json')

# Call the function with the desired CheckingDateTime value
if __name__ == "__main__":
    generate_all_field_lines()
    JsonFileName = get_nearest_field_lines("2023-03-20T17:23:12.000")
