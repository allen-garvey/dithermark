//module for saving and retrieving user settings in localStorage

import ColorPalettes from './color-palettes.js';

const localStorage = window.localStorage;
const USER_SAVED_PALETTES_KEY = 'user-saved-palettes';
const USER_GLOBAL_SETTINGS_KEY = 'user-global-settings';
const USER_EXPORT_SETTINGS_KEY = 'user-export-settings';

function savePalettes(palettes) {
    localStorage.setItem(USER_SAVED_PALETTES_KEY, JSON.stringify(palettes));
}

function getSettingOrDefault(key, defaultValue) {
    const setting = localStorage.getItem(key);
    if (!setting) {
        return defaultValue;
    }
    try {
        return JSON.parse(setting);
    } catch {
        return defaultValue;
    }
}

function saveGlobalSettings(globalSettings) {
    localStorage.setItem(
        USER_GLOBAL_SETTINGS_KEY,
        JSON.stringify(globalSettings)
    );
}

function defaultGlobalSettings(areControlsPinned) {
    return {
        isWebglEnabled: true,
        isLivePreviewEnabled: true,
        //disable color picker live preview for mobile, since it slows down performance
        //and they can't see the benefits anyway
        isColorPickerLivePreviewEnabled: areControlsPinned,
        automaticallyResizeLargeImages: true,
        showOriginalImage: false,
    };
}

function getGlobalSettings(areControlsPinned) {
    const globalSettings = localStorage.getItem(USER_GLOBAL_SETTINGS_KEY);
    const defaultSettings = defaultGlobalSettings(areControlsPinned);
    if (!globalSettings) {
        return defaultSettings;
    }
    try {
        return {
            defaultSettings,
            ...JSON.parse(globalSettings),
        };
    } catch {
        return defaultSettings;
    }
}

function getPalettes(minimumColorsLength) {
    return ColorPalettes.padPaletteColorsToMinimumLength(
        getSettingOrDefault(USER_SAVED_PALETTES_KEY, []),
        minimumColorsLength
    );
}

export default {
    getPalettes,
    savePalettes,
    getGlobalSettings,
    saveGlobalSettings,
};
