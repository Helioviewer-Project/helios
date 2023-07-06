from flask import Flask, request, make_response
from helios_exceptions import HeliosException
from datetime import datetime
from database import rest as database_endpoints
import json
import logging
logging.basicConfig(filename="helios_server.log", level=logging.DEBUG)

app = Flask("Helios")

@app.errorhandler(HeliosException)
def handle_user_exception(e):
    return _send_response({"error": str(e)})

def _send_response(data):
    if data is None:
        data = {"error": "Nothing to return"}
    response = make_response(json.dumps(data))
    response.mimetype = 'application/json'
    response.access_control_allow_origin = "*"
    return response

def _parse_date(date_str: str):
    try:
        return datetime.fromisoformat(date_str)
    except ValueError as e:
        raise HeliosException(str(e))

def _validate_input(parameter_list):
    """
    Validates that the HTTP request contains all the expected parameters
    :param parameter_list: List of strings of names of the parameters needed
    :type parameter_list: List[str]
    :raises HeliosException: Error returned to user on failure
    """
    # Create a list of any parameters missing from the list
    missing_list = []
    for param in parameter_list:
        if param not in request.args:
            missing_list.append(param)
    # If any are missing, create an error message
    if (len(missing_list) > 0):
        raise HeliosException("Missing parameters {}".format(",".join(missing_list)))

def _exec(fn):
    try:
        return _send_response(fn())
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



# This takes the path to a local jp2 file and returns x, y, z (i.e. HEEQ) coordinates
# relative to a know reference point. See get_heeq.py for details
@app.route("/observer/position")
def position_from_jp2():
    _validate_input(["id"])
    from api.observer_position import get_observer_position
    return _exec(lambda : get_observer_position(request.args["id"]))

@app.route("/event")
def get_events():
    start = request.args["start"]
    end = request.args["end"]

    from api.events import lookup_hek_events
    return _exec(lambda : lookup_hek_events(start, end))

@app.route("/psp")
def psp_position():
    _validate_input(["start", "end"])
    start = _parse_date(request.args["start"])
    end = _parse_date(request.args["end"])

    from api.psp_position import get_psp_position
    return _exec(lambda : get_psp_position(start, end))

# This endpoint is used to convert between coordinate data from the HEK
@app.route("/event/position")
def event_position():
    _validate_input([
        "system",
        "coord1",
        "coord2",
        "date",
        "observatory",
        "units"
    ])
    coord_system = request.args["system"]
    coord1 = request.args["coord1"]
    coord2 = request.args["coord2"]
    coord3 = None
    if ("coord3" in request.args):
        coord3 = request.args["coord3"]
    date = _parse_date(request.args["date"])
    observatory = request.args["observatory"]
    units = request.args["units"]
    from api.event_position import get_event_position
    return _exec(lambda : get_event_position(coord_system, units, coord1, coord2, coord3, date, observatory))

database_endpoints.init(app, _send_response, _parse_date)