interface UnpackResult {
    value: any;
    len: number;
}

const UnpackTable = {
    "<I": { len: 4, littleEndian: true, fn: DataView.prototype.getUint32 },
    "<i": { len: 4, littleEndian: true, fn: DataView.prototype.getInt32 },
    "<Q": { len: 8, littleEndian: true, fn: DataView.prototype.getBigUint64 },
    "<q": { len: 8, littleEndian: true, fn: DataView.prototype.getBigInt64 },
    "<f": { len: 4, littleEndian: true, fn: DataView.prototype.getFloat32 },
};

/**
 * Unpacks data with the pythonic struct.unpack format string
 * @param format Format string
 * @param view DataView into a buffer
 * @param offset Offset into the DataView to parse
 */
function Unpack(format: string, view: DataView, offset: number): UnpackResult {
    // The table contains mappings between format and the appropriate get* function.
    let fmt = UnpackTable[format];
    let value = fmt.fn.call(view, offset, fmt.littleEndian);
    return {
        value: value,
        len: fmt.len,
    };
}

/**
 * Helper for streaming data from the browser's default stream reader.
 * The default stream reader is paged, meaning when you "read" data, you don't get all of it.
 * You have to read, do some stuff on the chunk you get, then read more when you run out.
 * This BinaryReader handles the paging so that code that parses the pfss data can ignore this paging concept.
 */
class BinaryReader {
    private ptr: number;
    private data: Uint8Array;
    private view: DataView;
    private reader: ReadableStreamDefaultReader;
    private done: boolean;

    constructor(reader: ReadableStreamDefaultReader) {
        // Tracks which byte we're currently on in the data buffer
        this.ptr = 0;
        this.data = new Uint8Array();
        this.reader = reader;
        this.done = false;
    }

    /**
     * Buffers more data from the stream into the internal data array.
     * This overwrites the old data array, so it should only be called when this.ptr reaches the end of this.data
     */
    private async _bufferStream() {
        if (this.done) {
            throw "Attempted to read data from the stream, but there was no data left to read.";
        }
        // Get more data from the stream
        let readResult = await this.reader.read();
        // Set pointer to the beginning of the data buffer
        this.ptr = 0;
        // Update the done flag, when true, it means there's no more data in the buffer
        this.done = readResult.done;
        // Update the data buffer with the new chunk read from the stream.
        this.data = readResult.value;
        let buffer = new Uint8Array(this.data.length);
        buffer.set(this.data);
        this.view = new DataView(buffer.buffer);
    }

    /**
     * Extracts bytes from the underlying stream.
     *
     * @param length Number of bytes to pull from the data stream
     * @returns Usually a Uint8Array, but may be a normal Array if the read requires more data to be buffered.
     */
    async getBytes(length: number): Promise<Uint8Array> {
        // If we've reached the end of the data stream, buffer in some more.
        if (this.ptr >= this.data.length && !this.done) {
            await this._bufferStream();
        }

        // Read from the data buffer and move the pointer forward by the number of bytes read
        let arr: any = this.data.slice(this.ptr, this.ptr + length);
        this.ptr += arr.length;

        // Handle case where the number of bytes requested exceeds the current data buffer
        // In this case, the above read wouldn't have gotten as much data as was requested.
        if (arr.length < length) {
            // Get number of bytes left to read
            let n_bytes_remaining = length - arr.length;
            // Get the remaining bytes.
            let bytes = await this.getBytes(n_bytes_remaining);
            // Concatenate the first bytes read with the remaining bytes.
            // data read from the buffer is a Uint8Array which does not support concatenation.
            // Need to transform it to a normal array and concat
            arr = Array.from(arr);
            arr = arr.concat(Array.from(bytes));
        }
        if (Array.isArray(arr)) {
            arr = new Uint8Array(arr);
        }
        if (typeof window === "undefined") {
            // nodejs only code
            if (arr instanceof Buffer) {
                arr = new Uint8Array(arr);
            }
        }

        return arr;
    }

    /**
     * Reads the next [length] bytes from the underlying stream and parses result based on the given [format].
     * @param format Binary data format
     * @param length Number of bytes to read
     * @returns number (If reading a DWORD or less) | bigint (if reading a QWORD)
     */
    async read(format: string): Promise<any> {
        // Parse the number from binary data
        let datalen = CalcLen(format);
        // Edge case where reading some data will push the ptr out of bounds.
        if (this.ptr + datalen >= this.data.length) {
            // Create a temporary buffer to store data from multiple buffers
            let tmpbuf = new Uint8Array(datalen);
            // Create a temporary pointer for the tmpbuf
            let tmpptr = 0;
            // The number of bytes needed to fill the temporary buffer
            let bytesNeeded = datalen;
            do {
                // Get the remaining data from the current data buffer
                let remainingData = this.data.slice(
                    this.ptr,
                    this.ptr + bytesNeeded
                );
                // Move that remaining data into the temporary buffer
                tmpbuf.set(remainingData, tmpptr);
                // calculate how many bytes are still needed.
                bytesNeeded -= remainingData.length;
                tmpptr += remainingData.length;
                this.ptr += remainingData.length;
                // If this iteration filled in the bytes we needed, exit the loop.
                if (bytesNeeded == 0) {
                    break;
                }
                // Stream in new data from the underlying source
                await this._bufferStream();
            } while (bytesNeeded > 0);

            let result = Unpack(format, new DataView(tmpbuf.buffer), 0);
            return result.value;
        } else {
            let result = Unpack(format, this.view, this.ptr);
            this.ptr += result.len;
            return result.value;
        }
    }
}

/**
 * Similar to BinaryReader, but operates on a static chunk of data instead of a stream.
 */
class ChunkReader {
    private ptr = 0;
    // private data: Uint8Array;
    private data: DataView;
    constructor(chunk: Uint8Array) {
        this.ptr = 0;
        // this.data = chunk;
        this.data = new DataView(chunk.buffer);
    }

    // /**
    //  * Gets bytes from the underlying chunk of data.
    //  */
    // getBytes(length: number): Uint8Array {
    //     // Read from the data buffer and move the pointer forward by the number of bytes read
    //     let arr: any = this.data.slice(this.ptr, this.ptr + length);
    //     this.ptr += arr.length;
    //     return arr;
    // }

    /**
     * Reads the next [length] bytes from the underlying chunk and parses result based on the given [format].
     * @param format Binary data format
     * @param length Number of bytes to read
     * @returns number (If reading a DWORD or less) | bigint (if reading a QWORD)
     */
    read(format: string): any {
        let result = Unpack(format, this.data, this.ptr);
        this.ptr += result.len;
        return result.value;
    }
}

function CalcLen(format: string): number {
    return UnpackTable[format].len;
}

export { ChunkReader, BinaryReader, CalcLen };
