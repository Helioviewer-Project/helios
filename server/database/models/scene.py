from .base import Model
from typing import List
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from sqlalchemy import Integer, DateTime

class Scene(Model):
    __tablename__ = "scenes"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime)
    start: Mapped[DateTime] = mapped_column(DateTime)
    end: Mapped[DateTime] = mapped_column(DateTime)
    layers: Mapped[List["Layer"]] = relationship(back_populates="scene", lazy=False)
    def __repr__(self) -> str:
        return f"Scene(id={self.id}, created at {self.created_at!r}, from {self.start!r} to {self.end!r}, layers={self.layers!r})"

    def as_dict(self):
        # super().as_dict manages serializing dates and other "non json serializable" types
        out = super().as_dict()
        out["layers"] = [l.as_dict() for l in self.layers]
        return out