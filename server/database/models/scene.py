from .base import Model
from typing import List
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from sqlalchemy import Integer

class Scene(Model):
    __tablename__ = "scenes"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    layers: Mapped[List["Layer"]] = relationship(back_populates="scene", lazy=False)
    def __repr__(self) -> str:
        return f"Scene(id={self.id}, layers={self.layers!r})"

    def as_dict(self):
        return {
            "id": self.id,
            "layers": [l.as_dict() for l in self.layers]
        }