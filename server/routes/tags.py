"""
Defines API groupings for the OpenAPI specification
"""

from flask_openapi3 import Tag

Ephemeris = Tag(name="Ephemeris", description="Coordinates for observatories and celestial bodies")
Event = Tag(name="Events", description="Heliophysics Event Data")
Scene = Tag(name="Scene", description="For sharing saved scenes")
PFSS  = Tag(name="Data", description="Potential Field Source Surface data")