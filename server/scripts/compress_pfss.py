import gzip
import json
import struct
from argparse import ArgumentParser, RawTextHelpFormatter

def convert(fname: str):
    data = parse_pfss_json(fname)
    delete_unused_fields(data)
    binify_data(data)
    out_name = fname.replace(".gz", "").replace(".json", ".bin")
    write_bin(data, out_name)
    return data

def parse_pfss_json(fname: str) -> dict:
    with open(fname, "rb") as fp:
        if fname.endswith("gz"):
            return json.loads(gzip.decompress(fp.read()).decode('utf-8'))
        else:
            return json.load(fp)

def delete_unused_fields(json: dict):
    for line in json['fieldlines']['lines']:
        del line['bx_value']
        del line['by_value']
        del line['bz_value']

def binify_data(json: dict):
    for line in json['fieldlines']['lines']:
        n_points = len(line['x'])
        for idx in range(n_points):
            line['x'][idx] = struct.pack("<f", line['x'][idx])
            line['y'][idx] = struct.pack("<f", line['y'][idx])
            line['z'][idx] = struct.pack("<f", line['z'][idx])
            line['b_mag'][idx] = struct.pack("<f", line['b_mag'][idx])

def write_bin(json: dict, fname: str):
    n_lines = len(json['fieldlines']['lines'])
    data = bytearray()
    data += (struct.pack("<i", n_lines))
    for line in json['fieldlines']['lines']:
        n_points = len(line['x'])
        data += (struct.pack("<i", int(line['polarity'])))
        data += (struct.pack("<i", n_points))
        for idx in range(n_points):
            data += (line['x'][idx])
            data += (line['y'][idx])
            data += (line['z'][idx])
            data += (line['b_mag'][idx])
    with open(fname, "wb") as fp:
        fp.write(data)

if __name__ == "__main__":
    parser = ArgumentParser(description="""Compresses pfss json into a transferrable binary format\n\n

To parse the file, use little endian for all data items.\n
bytes [0:3] - signed int number of lines

Starting at file offset 4, for each line:
bytes [0:3] - signed int, polarity. -1, 0, or 1
bytes [4:7] - signed int number of points in the line

Starting at byte 8 in each line:
bytes [0:3] - float x position - solRad
bytes [4:7] - float y position - solRad
bytes [8:11] - float z position - solRad
bytes [12:15] - float field magnitude - Gauss

Consider the following C structs:
struct data {
    int32 n_lines;
    LineData lines[];
}

struct LineData {
    int32 n_points;
    int32 polarity;
    Point points[];
}

struct Point {
    float x;
    float y;
    float z;
    float magnitude;
}
""", formatter_class=RawTextHelpFormatter)
    parser.add_argument("file", type=str, help="pfss json file")
    args = parser.parse_args()
    data = convert(args.file)
