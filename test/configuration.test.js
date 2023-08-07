import Configuration from "../src/Configuration";

test("Earth sources is the expected list", () => {
    // earth_sources is generated with code.
    // It is intended to be all supported observatories along the sun-earth line.
    //
    // This test is intended to fail any time new sources are added
    // to make sure that the earth_sources array stays correct as new sources are supported.
    expect(Configuration.earth_sources).toStrictEqual([
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        34, 35,
    ]);
});
