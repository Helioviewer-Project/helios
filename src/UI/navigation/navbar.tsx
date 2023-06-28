import React from 'react'
import NavButton from './navbutton'
import css from './navbar.css'

type NavbarProps = {
    onSelectData: () => void,
    onSelectLayers: () => void,
    onSelectAnimation: () => void,
}

export default function Navbar(props: NavbarProps): React.JSX.Element {
    return <nav className={css.navbar}>
        <NavButton onClick={props.onSelectData} icon='add' text='Add' />
        <NavButton onClick={props.onSelectLayers} icon='photo_library' text='Layers' />
        <NavButton onClick={props.onSelectAnimation} icon='movie' text='Player' />
    </nav>
}