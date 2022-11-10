function GetEventLabel(event) {
    let text = "";
    if (event.hasOwnProperty("hv_labels_formatted")) {
        let keys = Object.keys(event.hv_labels_formatted);
        if (keys.length > 0) {
            text = event.hv_labels_formatted[keys[0]];
        }
    }
    if (text == "") {
        text = "Unknown";
    }
    return text;
}

export {GetEventLabel};
