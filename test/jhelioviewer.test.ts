import { test, jest, expect } from "@jest/globals";
import { OpenInJHelioviewer } from "@common/jhelioviewer";
import { DOMParser } from "xmldom";
import { XMLHttpRequest } from "xmlhttprequest";

global.XMLHttpRequest = XMLHttpRequest;

// Sampjs doesn't support nodejs, this is a somewhat hacky way to make it work
// requires the xmlhttprequest and xmldom packages.
// Override responseXML with the xmldom object which sampjs expects so that it can parse the response.
Object.defineProperty(XMLHttpRequest.prototype, "responseXML", {
    get: function () {
        return new DOMParser().parseFromString(this.responseText);
    },
    set: function () {},
});

test("Opening a scene in JHelioviewer fails when it's not running", async () => {
    global.alert = jest.fn();
    let layer = {
        source: 13, // AIA 304
        startTime: new Date("2023-01-01"),
        endTime: new Date("2023-01-02"),
        cadence: 3600,
    };
    await OpenInJHelioviewer([layer]);
    expect(alert.mock.calls.length).toBe(1);
    expect(alert.mock.calls[0][0]).toContain(
        "Couldn't send layers to JHelioviewer"
    );
});

test("Opening a scene in JHelioviewer fails if no layers are given", async () => {
    global.alert = jest.fn();
    await OpenInJHelioviewer([]);
    expect(alert.mock.calls.length).toBe(1);
    expect(alert.mock.calls[0][0]).toContain("Nothing to open");
});
