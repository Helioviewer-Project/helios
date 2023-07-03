import React, { useState } from "react";
import DateRangePicker from "./components/date_range_picker";
import DatasourcePicker from "./components/datasource_picker";
import css from "./common.css";
import CloseButton from "./components/close_button";
import TextButton from "../../components/button/TextButton";

type DateRange = {
    start: Date;
    end: Date;
    cadence: number;
};

function getDefaultDateRange(): DateRange {
    let now = new Date();
    let yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    let cadence = 86400;
    return {
        start: yesterday,
        end: now,
        cadence: cadence,
    };
}

type DataSource = {
    value: number;
    name: string;
};

type DataControlsProps = {
    visible: boolean;
    onAddData: (DataSource, DateRange) => void;
    onClose: () => void;
};

function DataControls({
    visible,
    onAddData,
    onClose,
}: DataControlsProps): React.JSX.Element {
    let [dateRange, setDateRange] = useState(getDefaultDateRange());
    const [source, setSource] = useState(8);
    const visibilityClass = visible ? css.visible : css.invisible;
    return (
        <div
            aria-hidden={visible ? "false" : "true"}
            className={`${css.tab} ${visibilityClass}`}
        >
            <CloseButton onClose={onClose} />
            <DatasourcePicker selected={source} setSelected={setSource} />
            <DateRangePicker value={dateRange} setValue={setDateRange} />
            <TextButton
                text="Add"
                onClick={() => onAddData(source, dateRange)}
            />
        </div>
    );
}

export { DataControls, DataSource, DateRange };
