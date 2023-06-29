import React from "react";
import css from './input.css'

interface InputProps {
    label: string;
    type: string;
    value: any;
    style?: Object | null;
    inputStyle?: Object | null;
    onChange: (value: any) => void;
};

export default function Input(props: InputProps): React.JSX.Element {
    return <div style={props.style} className={`${css.container}`}>
        <input style={props.inputStyle} id={window.atob(props.label)} className={css.input} type={props.type} value={props.value} onChange={(e) => props.onChange(e.target.value)} />
        <label className={css.label} htmlFor={window.atob(props.label)}>{props.label}</label>
    </div>
}