import React from "react";
import css from "./input.css";

type SelectProps = {
    label: string;
    value: any;
    onChange: (value: any) => void;
    options: React.JSX.Element[];
};

export default function Select(props: SelectProps): React.JSX.Element {
    return (
        <div className={css.container}>
            <select
                id={window.btoa(props.label)}
                value={props.value}
                onChange={(e) => props.onChange(e.target.value)}
                className={css.input}
            >
                {props.options}
            </select>
            <label className={css.label} htmlFor={window.btoa(props.label)}>
                {props.label}
            </label>
        </div>
    );
}
