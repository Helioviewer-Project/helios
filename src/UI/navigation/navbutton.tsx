import React from 'react';
import css from './navbutton.css'

type NavbuttonProps = {
    onClick: () => void,
    icon: string,
    text: string
};

/**
 * Mobile/Desktop navbar with icons
 */
export default function NavButton({onClick, icon, text}: NavbuttonProps): JSX.Element {
    return <button className={css.button} onClick={onClick}>
        <span className={css.icon + " material-symbols-outlined "}>{icon}</span>
        <span className={css.text}>{text}</span>
    </button>
}