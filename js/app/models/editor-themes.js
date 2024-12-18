class EditorTheme {
    constructor(name, key) {
        this.name = name;
        this.className = `editor-${name.toLowerCase()}`;
        this.key = key;
    }
}

export const DEFAULT_EDITOR_THEME_KEY = 0;

/**
 * Don't change theme keys, as it will break user's saved settings
 * @returns {EditorTheme[]}
 */
const themes = () => [
    new EditorTheme('White', DEFAULT_EDITOR_THEME_KEY),
    new EditorTheme('Light', 1),
    new EditorTheme('Dark', 2),
    new EditorTheme('Black', 3),
];

/**
 *
 * @param {EditorTheme[]} themes
 * @param {string} key
 * @returns {number}
 */
const indexForKey = (themes, key) =>
    Math.max(
        0,
        themes.findIndex(theme => theme.key === key)
    );

export default {
    get: themes,
    indexForKey,
};
