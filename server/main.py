from datetime import datetime
import json
import logging

import sunpy
from flask import Flask, request, make_response, send_file
from flask_cors import CORS

from helios_exceptions import HeliosException
from database import rest as database_endpoints
from get_heeq import convert_skycoords_to_heeq
from meta.mimetype import MimeType
import api.ephemeris as ephemeris

logging.basicConfig(filename="helios_server.log", level=logging.DEBUG)

app = Flask("Helios")
CORS(app)

@app.errorhandler(HeliosException)
def handle_user_exception(e):
    """
    This server is designed so whenever a HeliosException is thrown, the message
    placed in the exception will be returned as JSON to the caller.
    HeliosExceptions can be raised for a variety of reasons determined by
    the application developer as a way to communicate a condition to the user.
    """
    return _send_response({"error": str(e)})

def _send_response(data: bytes | dict, mime: MimeType = MimeType.JSON):
    """
    Wrap up the given data and send it to the user with the appropriate HTTP status.

    If the type of data is `bytes`, this function assumes the content is gzipped
    and will set the content-encoding to gzip. If you're returning binary data,
    gzip it to conserve bandwidth and set the appropriate mime type.

    If the type of data is `dict`, the content is json encoded and sent.

    If the data is `dict` and it contains a key: 'error', then it is assumed
    that an error message is being returned, and the HTTP status code is set to
    400 to indicate a bad request.

    Parameters
    ----------
    data: `Any`
        The data to send to the user.
    mime: `MimeType`
        The MIME type to send with the response. Defaults to 'application/json'
    """
    if data is None:
        data = {"error": "Nothing to return"}
    elif type(data) is bytes:
        response = make_response(data)
        response.mimetype = mime.value
        response.content_encoding = "gzip"
        response.access_control_allow_origin = "*"
        return response
    else:
        response = make_response(json.dumps(data))
        if "error" in data:
            response.status_code = 400
        response.mimetype = mime.value
        response.access_control_allow_origin = "*"
        return response

def _parse_date(date_str: str) -> datetime:
    """
    Parses the given date into a datetime.
    TODO: This could leverage sunpy to accept a wider variety of date formats.
    `HeliosException` is raised if the date fails to parse.
    """
    try:
        return datetime.fromisoformat(date_str)
    except ValueError as e:
        raise HeliosException(str(e))

def _validate_input(parameter_list: list[str]):
    """
    Validates that the HTTP request contains all the expected parameters
    `HeliosException` is raised if any parameter is missing

    Parameters
    ----------
    parameter_list: `list[str]`
        List of strings of names of the parameters needed
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
    """
    TODO: This should be a decorator
    Wraps the given function with general error handling mechanisms.
    If the function called is successful, the data returned by the function
    is returned in the HTTP Response.

    If the function raises a HeliosException, the exception message is extracted
    and sent in the HTTP response.

    If the function raises any other Exception, the exception is captured,
    logged locally, and a generic error message is sent to the user.
    """
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

@app.get("/openapi/spec/")
def get_openapi_spec():
    return send_file("openapi.yaml")

@app.get("/openapi/")
def get_openapi_page():
    return send_file("html/openapi.html")

@app.get("/test/")
def gettest():
    return {
        "Yo": "wassup"
    }

@app.get("/observer/position")
def position_from_jp2():
    """
    Returns the observer position for a specific jpeg2000 image.
    """
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

@app.route("/earth/<date>")
def get_earth(date):
    return convert_skycoords_to_heeq(sunpy.coordinates.get_earth(date))

@app.route("/ephemeris/<provider>/<body>")
def get_positions(provider: str, body: str):
    def fn():
        date_inputs = request.args.getlist('date')
        dates = map(lambda date: _parse_date(date), date_inputs)
        return ephemeris.Get(provider, body, dates)
    return _exec(lambda: fn())





database_endpoints.init(app, _send_response, _parse_date)