from datetime import datetime
import logging

from flask import request
from flask_cors import CORS
from flask_openapi3 import OpenAPI, Info

from helios_exceptions import HeliosException
from database import rest as database_endpoints
from routes.common.validation import ExpectQueryParameters
from routes.common.response import SendResponse
from routes.common.dates import ParseDate
from routes import ephemeris as ephemeris_routes

logging.basicConfig(filename="helios_server.log", level=logging.DEBUG)

info = Info(title="Helios", version="1.4.0")
app = OpenAPI("Helios", info=info)
CORS(app)

@app.errorhandler(HeliosException)
def handle_user_exception(e):
    """
    This server is designed so whenever a HeliosException is thrown, the message
    placed in the exception will be returned as JSON to the caller.
    HeliosExceptions can be raised for a variety of reasons determined by
    the application developer as a way to communicate a condition to the user.
    """
    return SendResponse({"error": str(e)})

@app.errorhandler(Exception)
def handle_internal_error(e: Exception):
    logging.error(e)
    return SendResponse({"error": "An internal error occurred, please file an issue with the timestamp at https://github.com/Helioviewer-Project/helios",
        "timestamp": str(datetime.now())}, status=500)

@app.route("/event")
def get_events():
    start = request.args["start"]
    end = request.args["end"]

    from api.events import lookup_hek_events
    return lookup_hek_events(start, end)

# This endpoint is used to convert between coordinate data from the HEK
@app.route("/event/position")
def event_position():
    ExpectQueryParameters([
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
    date = ParseDate(request.args["date"])
    observatory = request.args["observatory"]
    units = request.args["units"]
    from api.event_position import get_event_position
    return get_event_position(coord_system, units, coord1, coord2, coord3, date, observatory)

ephemeris_routes.register(app)
database_endpoints.init(app, SendResponse, ParseDate)