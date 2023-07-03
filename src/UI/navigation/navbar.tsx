import React from "react";
import NavButton from "./navbutton";
import css from "./navbar.css";

type NavbarProps = {
    isActive: boolean;
    onSelectData: () => void;
    onSelectLayers: () => void;
    onSelectAnimation: () => void;
};

export default function Navbar(props: NavbarProps): React.JSX.Element {
    let activeClass = props.isActive ? css.active : "";
    return (
        <nav className={`${css.navbar} ${activeClass}`}>
            <NavButton onClick={props.onSelectData} icon="add" text="Add" />
            <NavButton
                onClick={props.onSelectLayers}
                icon="photo_library"
                text="Layers"
            />
        </nav>
    );
}
