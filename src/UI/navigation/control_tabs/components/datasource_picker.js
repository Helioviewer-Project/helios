import React from 'react';
import { Sources } from '../../../../common/sources';

export default function DatasourcePicker({selected, setSelected}) {
    return [
        <label key={0} htmlFor="js-source-selector">Observatory</label>,
        <select key={1} value={selected} onChange={(e) => setSelected({value: e.target.value, name: e.target.selectedOptions[0].textContent})} id="js-source-selector">
            {Object.keys(Sources).map((source) => <option key={source} value={source}>{Sources[source]}</option>)}
        </select>
    ]
}

export { Sources };