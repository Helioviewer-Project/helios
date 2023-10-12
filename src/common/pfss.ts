import { BinaryReader, ChunkReader } from "./bintools";

interface PFSSLine {
    polarity: number;
    x: number[];
    y: number[];
    z: number[];
    b_mag: number[];
}

interface PFSS {
    date: Date;
    lines: PFSSLine[];
}

/**
 * Parses a PFSS instance from the given binary stream
 * @param reader
 * @returns PFSS instance
 */
async function ParsePfss(reader: ChunkReader, date: Date): Promise<PFSS> {
    let pfss: PFSS = { date: date, lines: [] };

    // Get the number of lines in the file
    let n_lines = reader.read("<i");
    // Iterate over each line
    for (let i = 0; i < n_lines; i++) {
        let line: PFSSLine = {
            polarity: 0,
            x: [],
            y: [],
            z: [],
            b_mag: [],
        };
        line.polarity = reader.read("<i");
        // Get the number of points in the line
        let n_points = reader.read("<i");
        for (let j = 0; j < n_points; j++) {
            line.x.push(reader.read("<f"));
            line.y.push(reader.read("<f"));
            line.z.push(reader.read("<f"));
            line.b_mag.push(reader.read("<f"));
        }
        pfss.lines.push(line);
    }
    return pfss;
}

async function ParsePfssBundle(
    dataReader: ReadableStreamDefaultReader
): Promise<PFSS[]> {
    let reader = new BinaryReader(dataReader);
    // First byte contains how many files are in the bundle
    let n_files = await reader.read("<i");
    let pfss_entries = [];
    for (let i = 0; i < n_files; i++) {
        // For each file, the first value is the timestamp
        let timestamp: bigint = await reader.read("<Q");
        let date = new Date(Number(timestamp * 1000n));
        // The next value is the length of the bundle
        let datalen = await reader.read("<I");
        // Pull the raw pfss binary from the stream.
        let pfssBinary = await reader.getBytes(datalen);
        // Create a chunk reader that operates only on the unique chunk
        let chunkReader = new ChunkReader(pfssBinary);
        let pfss = await ParsePfss(chunkReader, date);
        pfss_entries.push(pfss);
    }
    return pfss_entries;
}

export { ParsePfssBundle, ParsePfss, PFSS, PFSSLine };
