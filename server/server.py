from flask import Flask, request
from get_heeq import get_heeq_coordinates_from_jp2_file
from event_coord import get_event_coordinates, CoordinateSystem
from helios_exceptions import HeliosException
from datetime import datetime
import json
import logging
logging.basicConfig(filename="helios_server.log", encoding="utf-8", level=logging.DEBUG)

app = Flask("Helios")

def _parse_date(date_str: str):
    try:
        return datetime.fromisoformat(date_str)
    except ValueError as e:
        raise HeliosException(str(e))

# This takes the path to a local jp2 file and returns x, y, z (i.e. HEEQ) coordinates
# relative to a know reference point. See get_heeq.py for details
@app.route("/observer/position")
def position_from_jp2():
    jp2 = request.args["jp2"]
    result = get_heeq_coordinates_from_jp2_file(jp2)
    result_dict = {
        "x": result[0],
        "y": result[1],
        "z": result[2]
    }
    return json.dumps(result_dict)


# This endpoint is used to convert between coordinate data from the HEK
@app.route("/event/observer")
def event_position():
    try:
        coord_system = CoordinateSystem.from_str(request.args["system"])
        coord1 = request.args["coord1"]
        coord2 = request.args["coord2"]
        coord3 = None
        if ("coord3" in request.args):
            coord3 = request.args["coord3"]
        date = _parse_date(request.args["date"])
        observatory = request.args["observatory"]
        units = request.args["units"]
        coordinates = get_event_coordinates(coord_system, coord1, coord2, coord3, date, observatory, units)
        return json.dumps(coordinates)
    # The design here is any known error we should report to the user should be
    # raised as a HeliosException. The error message is passed on to the user.
    # Any other unexpected exception will be handled and the user will get a generic
    # error message. Internally we will have logs that show what's going on.
    except HeliosException as e:
        logging.warning(e)
        return json.dumps({"error": str(e)})
    except Exception as e:
        logging.error(e)
        return json.dumps({"error": "An internal error occurred, please file an issue with the timestamp at https://github.com/Helioviewer-Project/helios",
            "timestamp": str(datetime.now())})
