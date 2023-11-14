from datetime import datetime
from typing import Iterable

from astropy.coordinates import SkyCoord

from .horizons import Horizons
from helios_exceptions import HeliosException

# Use lower case for key names
_providers = {
    'horizons': Horizons
}

def Get(provider: str, body: str, dates: Iterable[datetime]) -> SkyCoord:
    try:
        # Use lower case so any variation of PrOvIdEr will execute the
        # selected provider.
        return _providers[provider.lower()].Get(body, dates)
    except KeyError:
        raise HeliosException(f"Unknown provider: {provider}")