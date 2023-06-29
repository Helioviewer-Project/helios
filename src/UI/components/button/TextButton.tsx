import React from "react";
import css from "./TextButton.css"

interface TextButtonProps {
    text: string;
    style?: Object | null;
    onClick: () => void;
}

export default function TextButton(props: TextButtonProps) {
    return <button className={css.button} onClick={props.onClick} style={props.style}>{props.text}</button>
}