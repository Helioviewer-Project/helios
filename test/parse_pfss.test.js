import {ParsePfss} from "../src/common/pfss"
import { readFileSync } from "fs";

test("Parse pfss file", async () => {
    let data = readFileSync("test/test_data/test_pfss.bin");
    let pfss = await ParsePfss(data);
    expect(pfss.lines.length).toBe(960);
    expect(pfss.lines[0].polarity).toBe(0);
});