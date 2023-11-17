import logging
from datetime import datetime

from flask_cors import CORS
from flask_openapi3 import OpenAPI, Info

from helios_exceptions import HeliosException
from database import rest as database_endpoints
from routes.common.response import SendResponse
from routes.common.dates import ParseDate
from routes import ephemeris as ephemeris_routes
from routes import events as event_routes

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
    if not app.debug:
        return SendResponse({"error": "An internal error occurred, please file an issue with the timestamp at https://github.com/Helioviewer-Project/helios",
            "timestamp": str(datetime.now())}, status=500)
    # else: let flask print out the debug message

ephemeris_routes.register(app)
event_routes.register(app)
database_endpoints.register(app)