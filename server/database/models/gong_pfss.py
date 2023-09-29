import json
import gzip
import math

from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy import Integer, DateTime, Text

from .base import Model

class GongPFSS(Model):
    __tablename__ = "pfss"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    date: Mapped[DateTime] = mapped_column(DateTime, index=True)
    path: Mapped[Text] = mapped_column(Text, unique=True)
    lod: Mapped[int] = mapped_column(Integer)
    def __repr__(self) -> str:
        return f"GONG(id={self.id}, path={self.path})"

    def load(self, detail: int = 50) -> dict:
        """
        Loads the pfss data from this instance from disk.
        detail should be a number between 0 and 100.
        This represents the percentage of the pfss lines that should be loaded.
        100 means load all lines (approx 1000). 50 means load 50% of the lines (approx 500)
        """
        # Limit detail to 0 and 100
        detail = 0 if detail < 0 else detail
        detail = 100 if detail > 100 else detail
        # Load the file
        with open(self.path, "rb") as fp:
            json_bytes = gzip.decompress(fp.read())
            pfss = json.loads(json_bytes)

        stride = math.ceil(100 / detail)
        pfss['fieldlines']['lines'] = pfss['fieldlines']['lines'][::stride]
        return pfss

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