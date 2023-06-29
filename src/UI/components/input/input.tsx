import React, { useState } from "react";
import css from './input.css'

type InputProps = {
    label: string,
    type: string,
    value: any,
    onChange: (any) => void
}

export default function Input(props: InputProps): React.JSX.Element {
    return <div className={`${css.input_container}`}>
        <input type={props.type} value={props.value} onChange={(e) => props.onChange(e.target.value)} />
        <label htmlFor={props.label}>{props.label}</label>
    </div>
}