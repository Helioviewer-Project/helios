from .base import Model
from typing import List
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from sqlalchemy import Integer, DateTime, Text

class GongPFSS(Model):
    __tablename__ = "pfss"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    date: Mapped[DateTime] = mapped_column(DateTime, index=True)
    path: Mapped[Text] = mapped_column(Text, unique=True)
    def __repr__(self) -> str:
        return f"GONG(id={self.id}, path={self.path})"
