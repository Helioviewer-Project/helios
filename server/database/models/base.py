from sqlalchemy.orm import DeclarativeBase
from datetime import datetime

def serialize(item) -> any:
    if (type(item) is datetime):
        return item.isoformat()
    else:
        return item

class Model(DeclarativeBase):
    def as_dict(self):
       return {c.name: serialize(getattr(self, c.name)) for c in self.__table__.columns}
    pass