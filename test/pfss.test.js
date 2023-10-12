import {ParsePfss, ParsePfssBundle} from "../src/common/pfss"
import { BinaryReader, ChunkReader } from "../src/common/bintools";
import fs from "fs";

/**
 * Create a ReadableStreamDefaultReader to simulate the reader returned by fetch.
 * For testing in nodejs, this is equivalent to doing a fetch(*).getReader()
 * @param {string} file_path
 * @returns {ReadableStreamDefaultReader}
 */
function MakeStream(file_path) {
    // Read in test data
    let data = fs.readFileSync(file_path);
    // Create a stream, to emulate how this is read on the web.
    let stream = new ReadableStream({
        start(controller) {
            // Split data into 2 chunks so test that the binary reader works.
            controller.enqueue(data.subarray(0, 999));
            controller.enqueue(data.subarray(999, 1999));
            controller.enqueue(data.subarray(1999, 2000));
            controller.enqueue(data.subarray(2000, 2005));
            controller.enqueue(data.subarray(2005, data.length))
            controller.close();
        }
    })
    // This reader is equivalent to fetch(*).getReader
    return stream.getReader();
}

test("Parse individual pfss file", async () => {
    let pfssBin = fs.readFileSync("test/test_data/test_pfss.bin");
    let now = new Date();
    let reader = new ChunkReader(new Uint8Array(pfssBin.buffer));
    let pfss = await ParsePfss(reader, now);
    expect(pfss.date).toStrictEqual(now);
    expect(pfss.lines).toHaveLength(960);
});

test("Parse PFSS Bundle", async () => {
    let streamReader = MakeStream("test/test_data/test_pfss_bundle.bin");
    let pfss_bundle = await ParsePfssBundle(streamReader);
    expect(pfss_bundle).toHaveLength(2);
    expect(pfss_bundle[0].date).toStrictEqual(new Date("2023-09-24T00:04:00.000Z"));
    expect(pfss_bundle[0].lines).toHaveLength(960);
    expect(pfss_bundle[1].date).toStrictEqual(new Date("2023-09-25T00:04:00.000Z"));
    expect(pfss_bundle[1].lines).toHaveLength(960);
});