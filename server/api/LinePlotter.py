
import os
import math
import astropy.units as u
import matplotlib.pyplot as plt
import numpy as np
from astropy.coordinates import SkyCoord
import pickle


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

def generate_field_lines(car_rot: int):
    time = a.Time('2023/5/10', '2023/6/25')
    series = a.jsoc.Series('hmi.synoptic_mr_polfil_720s')
    crot = a.jsoc.PrimeKey('CAR_ROT', car_rot)
    result = Fido.search(time, series, crot,
                    a.jsoc.Notify('m243006@usna.edu'))
    # print(os.getcwd())
    #downloads the files
    files = Fido.fetch(result)
    print(files)

    # Create field lines json for the given carrington rotation
    aia = sunpy.map.Map(r'C:\Users\m243006\Desktop\Nasa Internship\Test\Testing\2023_06_27__16_46_23_700__SDO_HMI_HMI_magnetogram.jp2')
    dtime = aia.date
    carrot = 'hmi.synoptic_mr_polfil_720s.' + str(car_rot) + '.Mr_polfil.fits'
    # hmi_map = sunpy.map.Map(carrot)
    hmi_map = sunpy.map.Map(files)
    final_hmi_map = hmi_map.resample([360, 144] * u.pixel)
    pfsspy.utils.fix_hmi_meta(final_hmi_map)
    nrho = 35
    rss = 2.5

    ###############################################################################
    # From the boundary condition, number of radial grid points, and source
    # surface, we now construct an Input object that stores this information
    pfss_in = pfsspy.Input(final_hmi_map, nrho, rss)
    pfss_out = pfsspy.pfss(pfss_in)
    pfss_out.bunit
    fig = plt.figure()
    ax = fig.add_subplot(111, projection='3d')
    tracer = tracing.FortranTracer()
    r = 1.1 * const.R_sun
    # lat = np.linspace(-np.pi/2, np.pi/2, 8, endpoint=True)
    # lon = np.linspace(0, np.pi, 8, endpoint=True)
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
                # b_along_fline = field_line.b_along_fline.to(b_unit).value
                fieldlines["lines"].append({"x":hgs.x.to(d_unit).value.tolist(),
                                                "y": hgs.y.to(d_unit).value.tolist(),
                                                "z": hgs.z.to(d_unit).value.tolist(),
                                                "polarity":field_line.polarity,
                                                "bx_value": b_along_fline[:,0].tolist(),
                                                "by_value": b_along_fline[:,1].tolist(),
                                                "bz_value": b_along_fline[:,2].tolist(),
                                                "b_mag": np.sqrt(b_along_fline[:,0]**2 + b_along_fline[:,1]**2 + b_along_fline[:,2]**2).tolist()})
                color = {0: 'black', -1: 'tab:blue', 1: 'tab:red'}.get(field_line.polarity)
                ax.plot(hgs.x.to(d_unit),
                            hgs.y.to(d_unit),
                            hgs.z.to(d_unit), color=color, linewidth=1)


    output1 = {'fieldlines': fieldlines}
    # print(fieldlines['lines'][0])
    filename1 = "lines" + str(car_rot) + ".json"
     
    # DateData = {fieldlines['frame']['source_map_obstime']['value']: filename1}

    # # Store data (serialize)
    # with open('DateData.pickle', 'wb') as handle:
    #     pickle.dump(DateData, handle, protocol=pickle.HIGHEST_PROTOCOL)
    
   # Load existing data from the file, if any
    try:
        with open('DateData.pickle', 'rb') as handle:
            existing_data = pickle.load(handle)
    except FileNotFoundError:
        existing_data = {}
    
    # Update the loaded data with the new values
    existing_data[fieldlines['frame']['source_map_obstime']['value']] = filename1
    
    # Store the updated data back into the file
    with open('DateData.pickle', 'wb') as handle:
        pickle.dump(existing_data, handle, protocol=pickle.HIGHEST_PROTOCOL)
   
    # Open the pickle file in read mode
    try:
        with open('ListOfDates.pickle', 'rb') as handle:
            my_list = pickle.load(handle)
    except FileNotFoundError:
        my_list = []
    
    # Add an element to the list
    my_list.append(fieldlines['frame']['source_map_obstime']['value'])
    
    # Open the pickle file in write mode
    with open('ListOfDates.pickle', 'wb') as handle:
         pickle.dump(my_list, handle, protocol=pickle.HIGHEST_PROTOCOL)
        

    
    with open(filename1, "w") as outfile:
        json.dump(output1, outfile)
    return output1
def generate_all_field_lines():
    # 176 total I used just 2 here becasaue I had it downloaded  
    22
    car_rots_start = 2097
    car_rots_end = 2272

    for i in range(car_rots_start, car_rots_end):
        generate_field_lines(i)
   



def get_nearest_field_lines(CheckingDateTime):
    car = sunpy.coordinates.sun.carrington_rotation_number(CheckingDateTime)
    return ('lines' + str(round(car)) + '.json')

# Call the function with the desired CheckingDateTime value
if __name__ == "__main__":
    generate_all_field_lines()
    JsonFileName = get_nearest_field_lines("2023-03-20T17:23:12.000")

