import React, { useState } from "react";
import DateRangePicker from "./components/date_range_picker";
import css from "./common.css";
import CloseButton from "./components/close_button";
import { DateRange } from "../../../common/types";

type DataControlsProps = {
    visible: boolean;
    onClose: () => void;
    dateRange: DateRange;
    setDateRange: (DateRange) => void;
};

function RangeControls({
    visible,
    onClose,
    dateRange,
    setDateRange,
}: DataControlsProps): React.JSX.Element {
    const visibilityClass = visible ? css.visible : css.invisible;
    return (
        <div
            aria-hidden={visible ? "false" : "true"}
            className={`${css.tab} ${visibilityClass}`}
        >
            <CloseButton onClose={onClose} />
            <DateRangePicker value={dateRange} setValue={setDateRange} />
        </div>
    );
}

export { RangeControls, DateRange };
