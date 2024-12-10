class EditorTheme {
    constructor(name, key) {
        this.name = name;
        this.className = `editor-${name.toLowerCase()}`;
        this.key = key;
    }
}

/**
 *
 * @returns {EditorTheme[]}
 */
const themes = () => [
    new EditorTheme('White', 0),
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
    themes.findIndex(theme => theme.key === key);

export default {
    get: themes,
    indexForKey,
};
