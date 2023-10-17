import { describe, it, expect } from "@jest/globals";
import { GetSourceFromName } from "../src/common/sources";

describe("Sources module", () => {
    it("should find source ids from strings", () => {
        expect(GetSourceFromName("PFSS (GONG)")).toBe(100001);
        expect(GetSourceFromName("COR2-B")).toBe(31);
    });
});
