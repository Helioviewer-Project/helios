from datetime import datetime
from typing import Iterable

from astropy.coordinates import SkyCoord
from sunpy.coordinates import get_horizons_coord

from api.ephemeris.provider import CoordinateProvider

class Horizons(CoordinateProvider):
    @classmethod
    def Query(cls, body: str, dates: Iterable[datetime]) -> list[SkyCoord]:
        """
        Queries JPL Horizons for coordinates and returns them

        Parameters
        ----------
        body: `str`
            Body to request coordinates for
        dates: `list[datetime]`
            List of dates. A coordinate will be returned for each date in the list
        """
        return get_horizons_coord(body, dates)