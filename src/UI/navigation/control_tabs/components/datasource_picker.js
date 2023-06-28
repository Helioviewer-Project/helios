import React from 'react';

const Sources = {
    "SDO AIA 94": 8 ,
    "SDO AIA 131": 9 ,
    "SDO AIA 171": 10,
    "SDO AIA 193": 11,
    "SDO AIA 211": 12,
    "SDO AIA 304": 13,
    "SDO AIA 335": 14,
    "SDO AIA 1600": 15,
    "SDO AIA 1700": 16,
    "SDO AIA 4500": 17,
    "SDO HMI Int": 18,
    "SDO HMI Mag": 19,
    "SOHO LASCO C2": 4 ,
    "SOHO LASCO C3": 5 ,
    "SOHO EIT 171": 0 ,
    "SOHO EIT 195": 1 ,
    "SOHO EIT 284": 2 ,
    "SOHO EIT 304": 3 ,
    "SOHO MDI Continuum": 7 ,
    "SOHO MDI Magnetogram": 6 ,
    "STEREO-A EUVI-A 171": 20,
    "STEREO-A EUVI-A 195": 21,
    "STEREO-A EUVI-A 284": 22,
    "STEREO-A EUVI-A 304": 23,
    "STEREO-A COR1-A": 28,
    "STEREO-A COR2-A": 29,
    "STEREO-B EUVI-B 171": 24,
    "STEREO-B EUVI-B 195": 25,
    "STEREO-B EUVI-B 284": 26,
    "STEREO-B EUVI-B 304": 27,
    "STEREO-B COR1-B": 30,
    "STEREO-B COR2-B": 31,
    "Yohkoh SXT thin-Al": 34,
    "Yohkoh SXT white-light": 35,
}

export default function DatasourcePicker({selected, setSelected}) {
    return [
        <label key={0} htmlFor="js-source-selector">Observatory</label>,
        <select key={1} value={selected} onChange={(e) => setSelected({value: e.target.value, name: e.target.selectedOptions[0].textContent})} id="js-source-selector">
            {Object.keys(Sources).map((source) => <option key={Sources[source]} value={Sources[source]}>{source}</option>)}
        </select>
    ]
}

export { Sources };