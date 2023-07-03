const Sources = {
    8: "SDO AIA 94",
    9: "SDO AIA 131",
    10: "SDO AIA 171",
    11: "SDO AIA 193",
    12: "SDO AIA 211",
    13: "SDO AIA 304",
    14: "SDO AIA 335",
    15: "SDO AIA 1600",
    16: "SDO AIA 1700",
    17: "SDO AIA 4500",
    18: "SDO HMI Int",
    19: "SDO HMI Mag",
    4: "SOHO LASCO C2",
    5: "SOHO LASCO C3",
    0: "SOHO EIT 171",
    1: "SOHO EIT 195",
    2: "SOHO EIT 284",
    3: "SOHO EIT 304",
    7: "SOHO MDI Continuum",
    6: "SOHO MDI Magnetogram",
    20: "STEREO-A EUVI-A 171",
    21: "STEREO-A EUVI-A 195",
    22: "STEREO-A EUVI-A 284",
    23: "STEREO-A EUVI-A 304",
    28: "STEREO-A COR1-A",
    29: "STEREO-A COR2-A",
    24: "STEREO-B EUVI-B 171",
    25: "STEREO-B EUVI-B 195",
    26: "STEREO-B EUVI-B 284",
    27: "STEREO-B EUVI-B 304",
    30: "STEREO-B COR1-B",
    31: "STEREO-B COR2-B",
    34: "Yohkoh SXT thin-Al",
    35: "Yohkoh SXT white-light",
};

function GetSourceName(source: number): string {
    return Sources[source];
}

export { Sources, GetSourceName };
