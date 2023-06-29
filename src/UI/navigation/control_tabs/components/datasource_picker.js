import React from 'react';
import { Sources } from '../../../../common/sources';
import Select from '../../../components/input/select';

export default function DatasourcePicker({selected, setSelected}) {
    return <Select
                label='Observatory'
                value={selected}
                onChange={(val) => setSelected(val)}
                options={Object.keys(Sources).map((source) => <option key={source} value={source}>{Sources[source]}</option>)}
                />
}

export { Sources };