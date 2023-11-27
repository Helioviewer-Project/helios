from datetime import datetime

import sunpy
import pytest

from api.ephemeris.horizons import Horizons
from get_heeq import convert_skycoords_to_heeq

def test_horizons_get():
    test_dates = [datetime(2023, 1, 1), datetime(2022, 1, 1)]
    # 399 is the unique ID for Earth's geocenter. "Earth" is ambiguous because
    # it can be Earth's geocenter or the Earth-Moon barycenter and Horizons
    # requests that you use the ID to select one.
    coordinates = Horizons.Get("399", test_dates)
    for idx, test_date in enumerate(test_dates):
        sunpy_earth = convert_skycoords_to_heeq(sunpy.coordinates.get_earth(test_date))
        # Assert that horizons and sunpy's coordinates for earth are approximately the same.
        # This confirms the query is working as expected.
        assert coordinates[idx]['x'] == pytest.approx(sunpy_earth['x'])
        assert coordinates[idx]['y'] == pytest.approx(sunpy_earth['y'])
        assert coordinates[idx]['z'] == pytest.approx(sunpy_earth['z'])