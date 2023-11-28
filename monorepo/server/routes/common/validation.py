from flask import request

from helios_exceptions import HeliosException

def ExpectQueryParameters(parameter_list: list[str]):
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