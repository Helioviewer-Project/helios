import React, { useState } from "react";
import DateRangePicker from "./components/date_range_picker";
import DatasourcePicker from "./components/datasource_picker";
import css from "./common.css"

type DateRange = {
    start: Date,
    end: Date,
    cadence: number
}

function getDefaultDateRange(): DateRange {
    let now = new Date();
    let yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    let cadence = 86400;
    return {
        start: yesterday,
        end: now,
        cadence: cadence
    };
}

type DataSource = {
    value: number,
    name: string
}

type DataControlsProps = {
    visible: boolean,
    onAddData: (DataSource, DateRange) => void
}

function DataControls({visible, onAddData}: DataControlsProps): React.JSX.Element {
    const dateRange = getDefaultDateRange();
    const [source, setSource] = useState({value: 8, name: 'SDO AIA 94'} as DataSource);
    const visibilityClass = visible ? css.visible : css.invisible
    return <div aria-hidden={visible ? "false" : "true"} className={`${css.tab} ${visibilityClass}`}>
        <DatasourcePicker selected={source.value} setSelected={setSource} />
        <DateRangePicker currentRange={dateRange} />
        <button onClick={() => onAddData(source, dateRange)} id="js-add-source">Add Source</button>
    </div>
}

export {DataControls}