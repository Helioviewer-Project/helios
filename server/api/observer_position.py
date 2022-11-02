from get_heeq import convert_skycoords_to_heeq
from coordinate_lookup import get_observer_coordinate_by_id


def get_observer_position(id):
    """
    Looks up an observer's normalized coordinates based on the given image id.
    :param id: ID of the image to get observer coordinates for
    :type id: str, int
    """
    observer = get_observer_coordinate_by_id(id)
    result = convert_skycoords_to_heeq(observer)
    return result

