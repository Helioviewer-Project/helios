import React from "react";
import css from "./input.css";

interface InputProps {
    label: string;
    type: string;
    value: any;
    style?: Object | null;
    inputStyle?: Object | null;
    labelClass?: string;
    inputClass?: string;
    className?: string;
    onChange: (value: any) => void;
}

export default function Input(props: InputProps): React.JSX.Element {
    return (
        <div
            style={props.style}
            className={`${css.container} ${props.className}`}
        >
            <input
                style={props.inputStyle}
                id={window.btoa(props.label)}
                className={`${css.input} ${props.inputClass}`}
                type={props.type}
                value={props.value}
                onChange={(e) => props.onChange(e.target.value)}
            />
            <label
                className={`${css.label} ${props.labelClass}`}
                htmlFor={window.btoa(props.label)}
            >
                {props.label}
            </label>
        </div>
    );
}
