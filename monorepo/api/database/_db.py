import logging

from sqlalchemy import create_engine

from .models import Model
import conf

logging.getLogger('sqlalchemy.engine').setLevel(logging.WARN)
engine = create_engine(conf.get('database', 'connection_string'), echo=True, pool_pre_ping=True, pool_recycle=1800, pool_size=3, max_overflow=0)
Model.metadata.create_all(engine)
