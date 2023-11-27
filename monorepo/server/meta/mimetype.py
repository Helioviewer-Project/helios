from enum import Enum

class MimeType(Enum):
    """
    Supplies variables for commom mime types so they don't have to be hard coded strings
    """
    JSON = 'application/json'
    Binary = 'application/octet-stream'
