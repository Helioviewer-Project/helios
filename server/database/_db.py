import logging

from sqlalchemy import create_engine

from .models import Model
import conf

logging.getLogger('sqlalchemy.engine').setLevel(logging.WARN)
engine = create_engine(conf.get('database', 'connection_string'), echo=True, pool_pre_ping=True)
Model.metadata.create_all(engine)
