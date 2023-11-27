from datetime import datetime

from helios_exceptions import HeliosException

def ParseDate(date_str: str) -> datetime:
    """
    Parses the given date into a datetime.
    TODO: This could leverage sunpy to accept a wider variety of date formats.
    `HeliosException` is raised if the date fails to parse.
    """
    try:
        return datetime.fromisoformat(date_str)
    except (ValueError, TypeError) as e:
        raise HeliosException(f"Error parsing '{date_str}': {str(e)}")