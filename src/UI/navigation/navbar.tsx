import React from 'react'
import NavButton from './navbutton'
import css from './navbar.css'

export default function Navbar(): React.JSX.Element {
    return <nav className={css.navbar}>
        <NavButton onClick={() => ''} icon='photo_library' text='Data' />
        <NavButton onClick={() => ''} icon='movie' text='Animate' />
        <NavButton onClick={() => ''} icon='settings' text='Settings' />
    </nav>
}