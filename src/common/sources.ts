class Datasource {
    public observatory: string;
    public dataset: string;

    constructor(observatory: string, dataset: string) {
        this.observatory = observatory;
        this.dataset = dataset;
    }

    public get name(): string {
        return `${this.observatory} ${this.dataset}`;
    }

    public IsInternal(): boolean {
        let sourceId = GetSourceFromName(this.name);
        return sourceId >= 100000;
    }
}

type SourceMap = {
    [key: number]: Datasource;
};

const Sources: SourceMap = {
    100001: new Datasource("GONG", "PFSS"),
    8: new Datasource("SDO", "AIA 94"),
    9: new Datasource("SDO", "AIA 131"),
    10: new Datasource("SDO", "AIA 171"),
    11: new Datasource("SDO", "AIA 193"),
    12: new Datasource("SDO", "AIA 211"),
    13: new Datasource("SDO", "AIA 304"),
    14: new Datasource("SDO", "AIA 335"),
    15: new Datasource("SDO", "AIA 1600"),
    16: new Datasource("SDO", "AIA 1700"),
    17: new Datasource("SDO", "AIA 4500"),
    18: new Datasource("SDO", "HMI Int"),
    19: new Datasource("SDO", "HMI Mag"),
    4: new Datasource("SOHO", "LASCO C2"),
    5: new Datasource("SOHO", "LASCO C3"),
    0: new Datasource("SOHO", "EIT 171"),
    1: new Datasource("SOHO", "EIT 195"),
    2: new Datasource("SOHO", "EIT 284"),
    3: new Datasource("SOHO", "EIT 304"),
    7: new Datasource("SOHO", "MDI Continuum"),
    6: new Datasource("SOHO", "MDI Magnetogram"),
    28: new Datasource("STEREO-A", "COR1"),
    29: new Datasource("STEREO-A", "COR2"),
    20: new Datasource("STEREO-A", "EUVI 171"),
    21: new Datasource("STEREO-A", "EUVI 195"),
    22: new Datasource("STEREO-A", "EUVI 284"),
    23: new Datasource("STEREO-A", "EUVI 304"),
    30: new Datasource("STEREO-B", "COR1"),
    31: new Datasource("STEREO-B", "COR2"),
    24: new Datasource("STEREO-B", "EUVI 171"),
    25: new Datasource("STEREO-B", "EUVI 195"),
    26: new Datasource("STEREO-B", "EUVI 284"),
    27: new Datasource("STEREO-B", "EUVI 304"),
    34: new Datasource("Yohkoh SXT", "thin-Al"),
    35: new Datasource("Yohkoh SXT", "white-light"),
};

function GetSourceName(source: number): string {
    return Sources[source].name;
}

function GetSourceFromName(name: string): number {
    let source = Object.entries(Sources).filter(
        (entry) => entry[1].name.indexOf(name) != -1
    );
    if (source.length < 1) {
        throw `Couldn't find source "${name}"`;
    } else if (source.length > 1) {
        throw `Found multiple sources for "${name}", please use a less ambiguous name`;
    } else {
        return parseInt(source[0][0]);
    }
}

export { Sources, GetSourceName, GetSourceFromName };
