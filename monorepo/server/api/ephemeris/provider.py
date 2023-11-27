from abc import ABC, abstractmethod
from datetime import datetime
from typing import Iterable

from astropy.coordinates import SkyCoord

from get_heeq import convert_skycoords_to_heeq

class CoordinateProvider(ABC):
    @classmethod
    def Get(cls, body: str, dates: Iterable[datetime]) -> list[dict]:
        """
        Queries the underlying source for coordinates and transforms them to
        Helios's coordinate system.

        Parameters
        ----------
        body: `str`
            The body to query coordinates for. Could be an observatory, planet, etc.
        dates: `list[datetime]`
            A list of datetime objects to query coordinates for.
            One coordinate will be returned for each date.
        """
        coordinates = cls.Query(body, dates)
        return CoordinateProvider.ConvertSkyCoords(coordinates)

    @classmethod
    def ConvertSkyCoords(cls, coords: Iterable[SkyCoord]) -> list[dict]:
        """
        Converts SkyCoords to Helios coordinates.
        """
        return list(map(lambda x: convert_skycoords_to_heeq(x), coords))

    @classmethod
    @abstractmethod
    def Query(cls, body: str, dates: Iterable[datetime]) -> list[SkyCoord]:
        """
        Queries the underlying source for coordinates and returns them

        Parameters
        ----------
        body: `str`
            Body to request coordinates for
        dates: `list[datetime]`
            List of dates. A coordinate will be returned for each date in the list
        """
        raise NotImplementedError()
