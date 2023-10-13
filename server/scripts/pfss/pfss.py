from dataclasses import dataclass, field
from datetime import datetime, timezone
import struct


@dataclass
class PFSSLine:
    polarity: int = 0
    x: list[float] = field(default_factory=list)
    y: list[float] = field(default_factory=list)
    z: list[float] = field(default_factory=list)
    b_mag: list[float] = field(default_factory=list)

    def as_bin(self) -> bytearray:
        """
        Returns this line in a big endian binary format
        bytes[0:3]   signed int Polarity
        bytes[4:7]   unsigned int number of points in the line
        bytes[8:11]  float x
        bytes[12:15] float y
        bytes[16:19] float z
        bytes[20:23] float field magnitude
        """
        n_points = len(self.x)
        data = bytearray()
        data += struct.pack(">i", int(self.polarity))
        data += struct.pack(">I", n_points)
        for i in range(n_points):
            data += struct.pack(">f", self.x[i])
            data += struct.pack(">f", self.y[i])
            data += struct.pack(">f", self.z[i])
            data += struct.pack(">f", self.b_mag[i])
        return data


@dataclass
class PFSS:
    date: datetime = datetime.now()
    lines: list[PFSSLine] = field(default_factory=list)

    def as_bin(self) -> bytearray:
        """
        Returns this pfss instance as a raw binary array.
        All data is big endian
        Format is:
        bytes[0:7]  unix timestamp
        bytes[8:11] number of lines
        bytes[12:x] Line Instance, see PFSSLine for format
        """
        data = bytearray()
        n_lines = len(self.lines)
        data += struct.pack(
            ">Q", int(self.date.replace(tzinfo=timezone.utc).timestamp())
        )
        data += struct.pack(">I", n_lines)
        for line in self.lines:
            data += line.as_bin()
        return data

    def save(self, fname: str):
        """
        Saves this pfss instance
        """
        data = self.as_bin()
        with open(fname, "wb") as fp:
            fp.write(data)


class Unpacker:
    """
    This class tracks a pointer to a bytearray for sequential parsing
    """

    def __init__(self, buffer: bytearray):
        self.ptr = 0
        self.buffer = buffer

    def unpack(self, format: str) -> int | float:
        """
        Unpacks the next chunk of data from the underlying buffer

        Parameters
        ----------
        format: `str`
            struct.pack/unpack format string (must be only 1 value)
        """
        n_bytes = struct.calcsize(format)
        value = struct.unpack(format, self.buffer[self.ptr : self.ptr + n_bytes])[0]
        self.ptr += n_bytes
        return value


def LoadPfss(fname: str) -> PFSS:
    """
    Load PFSS File from a binary file

    Parameters
    ----------
    fname: `str`
        Path to pfss binary file to read
    """
    with open(fname, "rb") as fp:
        data = fp.read()
    reader = Unpacker(data)
    pfss = PFSS()
    timestamp = reader.unpack(">Q")
    pfss.date = datetime.fromtimestamp(timestamp, tz=timezone.utc)
    n_lines = reader.unpack(">I")
    for _ in range(n_lines):
        line = PFSSLine()
        line.polarity = reader.unpack(">i")
        n_points = reader.unpack(">I")
        for _ in range(n_points):
            line.x.append(reader.unpack(">f"))
            line.y.append(reader.unpack(">f"))
            line.z.append(reader.unpack(">f"))
            line.b_mag.append(reader.unpack(">f"))
        pfss.lines.append(line)
    return pfss
