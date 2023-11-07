import React from "react";
import NavButton from "./navbutton";
import css from "./navbar.css";

type NavbarProps = {
    isActive: boolean;
    onSelectRange: () => void;
    onSelectLayers: () => void;
    onSelectFavorite: () => void;
    onSelectCloud: () => void;
    onSelectPreferences: () => void;
    showJhvButton: boolean;
    openInJhelioviewer: () => void;
};

/**
 * This Navbar represents the left sidebar on desktop and the
 * bottom nav icons on mobile
 *
 * Available icons can be found at https://fonts.google.com/icons
 */
export default function Navbar(props: NavbarProps): React.JSX.Element {
    let activeClass = props.isActive ? css.active : "";
    return (
        <nav className={`${css.navbar} ${activeClass}`}>
            <div className={css.content}>
                <NavButton
                    onClick={props.onSelectRange}
                    icon="schedule"
                    text="Time"
                />
                <NavButton
                    onClick={props.onSelectLayers}
                    icon="photo_library"
                    text="Layers"
                />
                <NavButton
                    onClick={props.onSelectFavorite}
                    icon="favorite"
                    text="Favorites"
                />
                <NavButton
                    onClick={props.onSelectCloud}
                    icon="cloud"
                    text="Shared"
                />
                <NavButton
                    onClick={props.onSelectPreferences}
                    icon="Settings"
                    text="Settings"
                />
                <NavButton
                    onClick={props.openInJhelioviewer}
                    icon="https://raw.githubusercontent.com/Helioviewer-Project/JHelioviewer-SWHV/7a771ecc98fd3b438de88418ccc0e0516a61d31d/docs/user-manual/hvImage_160x160.png"
                    text="Send"
                    visible={props.showJhvButton}
                    title="Send scene to JHelioviewer"
                />
            </div>
        </nav>
    );
}
