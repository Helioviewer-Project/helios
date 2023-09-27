from sqlalchemy.orm import Session
from sqlalchemy import text, select
from ._db import engine
from .models import GongPFSS
from datetime import datetime
import json

def QueryGong(date: datetime, lod: int = 16) -> dict:
    date_str = date.strftime("%Y-%m-%d %H:%M:%S")
    with Session(engine) as session:
        sql = text(f"""
            SELECT s.id, s.path, s.date FROM (
                SELECT * FROM (SELECT id, path, date FROM pfss WHERE date <= "{date_str}" AND lod = {lod} ORDER BY date DESC LIMIT 1)
                UNION ALL
                SELECT * FROM (SELECT id, path, date FROM pfss WHERE date > "{date_str}" AND lod = {lod} ORDER BY date ASC LIMIT 1)
            ) s
            ORDER BY ABS(julianday(s.date) - julianday("{date_str}"))
            LIMIT 1;
        """)
        sql.columns(GongPFSS.id, GongPFSS.path, GongPFSS.date)
        query = select(GongPFSS).from_statement(sql)
        # I don't know if there's a nicer way to just get the result.
        gong_pfss = session.execute(query).scalars().all()[0]
        return gong_pfss
