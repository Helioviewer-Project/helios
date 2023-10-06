import { jspack } from "jspack";

interface PFSSLine {
    polarity: number;
    x: number[];
    y: number[];
    z: number[];
    b_mag: number[];
}

interface PFSS {
    lines: PFSSLine[];
}

/**
 * Helper for parsing binary data
 */
class BinaryReader {
    private ptr: number;
    private data: ArrayBuffer;

    constructor(data: ArrayBuffer) {
        // Tracks which byte we're currently on in the data buffer
        this.ptr = 0;
        this.data = data;
    }

    /**
     * Reads and parses binary data into a number
     * @param format Binary data format
     * @param length Number of bytes to read
     */
    read(format: string, length: number): number {
        // Parse the number from binary data
        let arr = this.data.slice(this.ptr, this.ptr + length);
        let value = jspack.Unpack(format, arr)[0];
        // move the pointer forward for the next read
        this.ptr += length;
        return value;
    }
}

async function ParsePfss(data: ArrayBuffer): Promise<PFSS> {
    let pfss: PFSS = { lines: [] };
    let reader = new BinaryReader(data);

    // Get the number of lines in the file
    let n_lines = reader.read("<i", 4);
    // Iterate over each line
    for (let i = 0; i < n_lines; i++) {
        let line: PFSSLine = {
            polarity: 0,
            x: [],
            y: [],
            z: [],
            b_mag: [],
        };
        line.polarity = reader.read("<i", 4);
        // Get the number of points in the line
        let n_points = reader.read("<i", 4);
        for (let j = 0; j < n_points; j++) {
            line.x.push(reader.read("<f", 4));
            line.y.push(reader.read("<f", 4));
            line.z.push(reader.read("<f", 4));
            line.b_mag.push(reader.read("<f", 4));
        }
        pfss.lines.push(line);
    }
    return pfss;
}

export { ParsePfss };
