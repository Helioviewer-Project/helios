import { test } from "@jest/globals";
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

// This test will fail in CI because JHelioviewer won't be running.
// But it should pass locally if you have JHelioviewer running and you manually
// accept the samp request in JHelioviewer. If you have JHelioviewer running
// but you don't accept the request, this will time out.
test.failing("Opening a scene in JHelioviewer", () => {
    let layer = {
        source: 13, // AIA 304
        start: new Date("2023-01-01"),
        end: new Date("2023-01-02"),
        cadence: 3600,
    };
    OpenInJHelioviewer([layer]);
});
