import { describe, it, expect } from "@jest/globals";
import { GetSourceFromName } from "../src/common/sources";

describe("Sources module", () => {
    it("should find source ids from strings", () => {
        expect(GetSourceFromName("GONG PFSS")).toBe(100001);
        expect(GetSourceFromName("STEREO-B COR2")).toBe(31);
    });
});
