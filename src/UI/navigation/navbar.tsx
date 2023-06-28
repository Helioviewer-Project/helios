import React from 'react'
import NavButton from './navbutton'
import css from './navbar.css'

type NavbarProps = {
    onSelectData: () => void,
    onSelectAnimation: () => void,
    onSelectSettings: () => void
}

export default function Navbar(props: NavbarProps): React.JSX.Element {
    return <nav className={css.navbar}>
        <NavButton onClick={props.onSelectData} icon='photo_library' text='Data' />
        <NavButton onClick={props.onSelectAnimation} icon='movie' text='Animate' />
        <NavButton onClick={props.onSelectSettings} icon='settings' text='Settings' />
    </nav>
}