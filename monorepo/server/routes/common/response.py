import json

from flask import make_response

from meta.mimetype import MimeType

def SendResponse(data: bytes | dict, mime: MimeType = MimeType.JSON, status: int = None):
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
    data: `bytes | dict`
        The data to send to the user.
    mime: `MimeType`
        The MIME type to send with the response. Defaults to 'application/json'
    status: `int | None`
        Optional HTTP status code override
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
            response.status_code = status or 400
        response.mimetype = mime.value
        response.access_control_allow_origin = "*"
        return response

