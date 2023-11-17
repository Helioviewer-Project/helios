from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy import Integer, DateTime, VARCHAR

from .base import Model

class GongPFSS(Model):
    __tablename__ = "pfss"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    date: Mapped[DateTime] = mapped_column(DateTime, index=True)
    path: Mapped[VARCHAR] = mapped_column(VARCHAR(255), unique=True)
    lod: Mapped[int] = mapped_column(Integer)
    def __repr__(self) -> str:
        return f"GONG(id={self.id}, path={self.path})"


    def as_dict(self):
        return {
            "date": self.date.strftime("%Y-%m-%d %H:%M:%S"),
            "path": self.path
        }

    def __eq__(self, other: object) -> bool:
        return self.id == other.id

    def __ne__(self, other: object) -> bool:
        return self.id != other.id

    def __hash__(self) -> int:
        return self.id