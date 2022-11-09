/**
 * Manages the sidebar with all the controls
 */
class Sidebar {
    constructor() {
        this._toggle = document.getElementById('js-sidebar-toggle');
        this._sidebar = document.getElementById('js-sidebar');
        this._RegisterListeners();
        this._ExecuteMobileViewportPatch();
    }

    _ExecuteMobileViewportPatch() {
        // CSS trick to fix 100vh on mobile. Without this, 100vh goes below the viewport due to silly mobile browser implementations
        // See https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    _RegisterListeners() {
        let sidebar = this;
        this._toggle.addEventListener('click', () => sidebar.toggle());
    }

    /**
     * Toggle the sidebar open/closed
     */
    toggle() {
        if (this._toggle.classList.contains('closed')) {
            this._toggle.classList.remove('closed');
            this._sidebar.classList.remove('closed');
        } else {
            this._toggle.classList.add('closed');
            this._sidebar.classList.add('closed');
        }
    }
}
let sidebar = new Sidebar();


export default sidebar;
