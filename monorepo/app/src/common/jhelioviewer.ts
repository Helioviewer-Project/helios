import { JhvRequestBuilder } from "jhvrequest";
import { ModelInfo } from "@common/types";
import { Sources } from "./sources";
import { ToDateString } from "./dates";

async function OpenInJHelioviewer(Layers: ModelInfo[]): Promise<void> {
    let requestBuilder = new JhvRequestBuilder();
    if (Layers.length == 0) {
        alert("Nothing to open.");
        return;
    }
    requestBuilder.SetTimeRange(
        ToDateString(Layers[0].startTime),
        ToDateString(Layers[0].endTime)
    );
    requestBuilder.SetCadence(Layers[0].cadence);

    for (const layer of Layers) {
        let source = Sources[layer.source];
        // Internal sources can't be opened externally.
        // So only continue if the source is not internal.
        if (!source.IsInternal()) {
            requestBuilder.AddSource(source.observatory, source.dataset);
        }
    }
    try {
        await requestBuilder.Build().Send();
    } catch (e) {
        if (e.indexOf("No hub") != -1) {
            alert("Couldn't send layers to JHelioviewer, is it open?");
        }
    }
}

export { OpenInJHelioviewer };
