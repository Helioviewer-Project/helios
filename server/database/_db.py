from .models import Model
from sqlalchemy import create_engine
engine = create_engine("sqlite+pysqlite:///data.sqlite", echo=True)
Model.metadata.create_all(engine)
