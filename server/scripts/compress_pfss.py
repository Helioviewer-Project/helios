import json
import struct
from argparse import ArgumentParser, RawTextHelpFormatter

def convert(fname: str):
    with open(fname, "r") as fp:
        data = json.load(fp)
    delete_unused_fields(data)
    binify_data(data)
    write_bin(data, "test.bin")
    return data

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
    with open(fname, "wb") as fp:
        fp.write(struct.pack("<i", n_lines))
        for line in json['fieldlines']['lines']:
            n_points = len(line['x'])
            fp.write(struct.pack("<i", int(line['polarity'])))
            fp.write(struct.pack("<i", n_points))
            for idx in range(n_points):
                fp.write(line['x'][idx])
                fp.write(line['y'][idx])
                fp.write(line['z'][idx])
                fp.write(line['b_mag'][idx])

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
