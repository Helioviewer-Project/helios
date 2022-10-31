from flask import Flask, request, make_response
from get_heeq import convert_skycoords_to_heeq
from event_coord import get_event_coordinates, CoordinateSystem
from helios_exceptions import HeliosException
from datetime import datetime
from coordinate_lookup import get_observer_coordinate_by_id
import json
import logging
logging.basicConfig(filename="helios_server.log", encoding="utf-8", level=logging.DEBUG)

app = Flask("Helios")

def _send_response(data):
    response = make_response(json.dumps(data))
    response.access_control_allow_origin = "*"
    return response

def _parse_date(date_str: str):
    try:
        return datetime.fromisoformat(date_str)
    except ValueError as e:
        raise HeliosException(str(e))

# This takes the path to a local jp2 file and returns x, y, z (i.e. HEEQ) coordinates
# relative to a know reference point. See get_heeq.py for details
@app.route("/observer/position")
def position_from_jp2():
    try:
        id = request.args["id"]
        observer = get_observer_coordinate_by_id(id)
        result = convert_skycoords_to_heeq(observer)
        result_dict = {
            "x": result[0],
            "y": result[1],
            "z": result[2]
        }
        return _send_response(result_dict)
    # The design here is any known error we should report to the user should be
    # raised as a HeliosException. The error message is passed on to the user.
    # Any other unexpected exception will be handled and the user will get a generic
    # error message. Internally we will have logs that show what's going on.
    except HeliosException as e:
        logging.warning(e)
        return _send_response({"error": str(e)})
    except Exception as e:
        logging.error(e)
        return _send_response({"error": "An internal error occurred, please file an issue with the timestamp at https://github.com/Helioviewer-Project/helios",
            "timestamp": str(datetime.now())})


# This endpoint is used to convert between coordinate data from the HEK
@app.route("/event/position")
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
        return _send_response({
            "observer": {
                "x": coordinates["observer"][0],
                "y": coordinates["observer"][1],
                "z": coordinates["observer"][2],
            },
            "event": coordinates["event"]
        })
    # The design here is any known error we should report to the user should be
    # raised as a HeliosException. The error message is passed on to the user.
    # Any other unexpected exception will be handled and the user will get a generic
    # error message. Internally we will have logs that show what's going on.
    except HeliosException as e:
        logging.warning(e)
        return _send_response({"error": str(e)})
    except Exception as e:
        logging.error(e)
        return _send_response({"error": "An internal error occurred, please file an issue with the timestamp at https://github.com/Helioviewer-Project/helios",
            "timestamp": str(datetime.now())})
