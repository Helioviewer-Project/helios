/**
 * Preferences schema
 */
interface UserPreferences {
    resolution: number
};

/**
 * Default user preferences.
 * These values are used when a user has not changed their preferences.
 */
const defaultPreferences: UserPreferences = {
    resolution: 256
};

/**
 * Key used to access preferences saved in localStorage
 */
const PREFERENCES_KEY = 'preferences';

/**
 * Manages user preferences/settings.
 * This is different than Config in that the app configuration is immutable
 * while the Preferences can be set by the user.
 *
 * Of special note: User preferences are set atomically, meaning that if a user
 * sets preference A, only preference A is saved. Preferences B and C will use
 * values from the defaultPreferences object.
 *
 * This is important in the event
 * that we change any default values. If any defaults are changed, users that
 * have changed this particular setting will use their own setting. Users that
 * have never modified this setting will get the new default value.
 * In this way, we can control the settings that the user doesn't care about.
 * If we decide a certain value is better than another, we can update this
 * setting for all users, and if they decide we're wrong then they can change it back.
 */
class Preferences {
    /**
     * In-memory copy of preferences so that it doesn't need to be repeatedly parsed from storage.
     */
    private static _userPreferences: UserPreferences = null;

    /**
     * Returns stored preferences
     * @returns {UserPreferences}
     */
    private static LoadPreferences(): any {
        if (this._userPreferences != null) {
            return this._userPreferences;
        }

        let stringifiedPreferences = localStorage.getItem(PREFERENCES_KEY)
        if (stringifiedPreferences == null) {
            return {};
        } else {
            this._userPreferences = JSON.parse(stringifiedPreferences);
            return this._userPreferences;
        }
    }

    /**
     * Stores user preferences
     * @param preferences New preference settings to save
     */
    private static SavePreferences(preferences: UserPreferences) {
        this._userPreferences = preferences;
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    }

    /**
     * Get a preference value.
     * @returns {any} value for the requested preference
     */
    private static GetPreference(key: string): any {
        // Load stored preferences
        let prefs = this.LoadPreferences();
        // Return the value if it exists on the preferences object
        if (prefs.hasOwnProperty(key) && prefs[key] != null) {
            return prefs[key];
        }
        // If the value doesn't exist, read it from default preferences.
        // This allows updates to preferences without breaking anything.
        else if (defaultPreferences.hasOwnProperty(key)) {
            return defaultPreferences[key];
        }
        // If the value isn't in the stored preferences or default preferences,
        // then this is probably a bug.
        else {
            throw `Tried to read invalid preference ${key}`;
        }
    }

    /**
     * Sets a preference on the stored preference object
     */
    private static SetPreference(key: string, value: any) {
        let prefs = this.LoadPreferences();
        prefs[key] = value;
        this.SavePreferences(prefs);
    }

    static get resolution(): number {
        return this.GetPreference('resolution');
    }

    static set resolution(value: number) {
        this.SetPreference('resolution', value);
    }
}


export { Preferences }