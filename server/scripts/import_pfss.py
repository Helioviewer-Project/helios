try:
    from database._db import engine
    from database.models import GongPFSS
except Exception as e:
    print(e)
    print("Please run as a module from the parent folder via `python -m scripts.import_pfss`")
    import sys
    sys.exit(1)

import os
from argparse import ArgumentParser
from sqlalchemy.orm import Session
from datetime import datetime
from pathlib import Path

def parse_args():
    parser = ArgumentParser(
        description="Imports PFSS json files into the sqlite database")
    parser.add_argument("type", choices=["gong"], help="Type of PFSS file")
    parser.add_argument("pfss_dir", type=str, help="Path to PFSS json files")
    return parser.parse_args()

def get_file_list(path: str) -> list:
    file_list = []
    for (dirpath, dirname, files) in os.walk(path):
        json_files = filter(lambda fname: fname.endswith(".json.gz"), files)
        file_list += list(map(lambda fname: str(Path(f"{dirpath}/{fname}").resolve()), json_files))
    return file_list

def extract_date_from_filename(fname) -> datetime:
    date_string = fname[-28:-8]
    return datetime.strptime(date_string, "%Y_%m_%d__%H_%M_%S")

def extract_lod_from_filename(fname:str) -> int:
    return fname.split('_')[1]

def add_files_to_db(files: list):
    with Session(engine) as session:
        for filepath in files:
            # TODO: Add HMI support
            # First check if this file already exists in the database
            already_exists = session.query(GongPFSS).where(GongPFSS.path == filepath).count() == 1
            # If it doesn't exist, then add it.
            if not already_exists:
                pfss = GongPFSS()
                pfss.date = extract_date_from_filename(filepath)
                pfss.path = filepath
                pfss.lod = extract_lod_from_filename(os.path.basename(filepath))
                session.add(pfss)
        session.commit()

if __name__ == "__main__":
    args = parse_args()
    files = get_file_list(args.pfss_dir)
    add_files_to_db(files)
