//module for saving and retrieving user settings in localStorage

import ColorPalettes from './models/color-palettes.js';
import { getVideoQualityOptions } from './models/mediabunny.js';
import { getSaveImageFileTypes } from './models/export-model.js';
import { DEFAULT_EDITOR_THEME_KEY } from './models/editor-themes.js';

const localStorage = window.localStorage;
const USER_SAVED_PALETTES_KEY = 'user-saved-palettes';
const USER_GLOBAL_SETTINGS_KEY = 'user-global-settings';
const USER_EXPORT_SETTINGS_KEY = 'user-export-settings';
const USER_EXPORT_VIDEO_MEDIABUNNY_CODEC_KEY =
    'user-export-video-mediabunny-codec';
const USER_LIMIT_NUMBER_OF_WEBWORKERS_SETTING_KEY =
    'user-limit-number-of-webworkers-setting';

/**
 *
 * @param {string} codec
 */
export const saveMediabunnyCodecSetting = codec =>
    localStorage.setItem(USER_EXPORT_VIDEO_MEDIABUNNY_CODEC_KEY, codec);

/**
 *
 * @returns {string}
 */
export const getMediabunnyCodecSetting = () =>
    localStorage.getItem(USER_EXPORT_VIDEO_MEDIABUNNY_CODEC_KEY);

/**
 * @typedef {Object} ExportSettings
 * @property {string} fileType
 * @property {number} videoFps
 * @property {string} videoQuality
 */

/**
 *
 * @param {ExportSettings} exportSettings
 * Debounce saving export settings to prevent unnecessary disk writes,
 * since videoFps can change rapidly
 */
let exportSettingsTimeout = null;
function saveExportSettings(exportSettings) {
    clearTimeout(exportSettingsTimeout);
    exportSettingsTimeout = setTimeout(() => {
        localStorage.setItem(
            USER_EXPORT_SETTINGS_KEY,
            JSON.stringify(exportSettings)
        );
    }, 100);
}

/**
 *
 * @returns {ExportSettings}
 */
function getExportSettings() {
    const exportSettings = getSettingOrDefault(USER_EXPORT_SETTINGS_KEY, {});
    const saveImageFileTypes = getSaveImageFileTypes();

    if (
        !exportSettings.fileType ||
        !saveImageFileTypes.find(
            fileType => fileType.value === exportSettings.fileType
        )
    ) {
        exportSettings.fileType = saveImageFileTypes[0].value;
    }
    if (
        typeof exportSettings.videoFps !== 'number' ||
        isNaN(exportSettings.videoFps) ||
        exportSettings.videoFps <= 0
    ) {
        exportSettings.videoFps = 24;
    }
    if (
        !exportSettings.videoQuality ||
        getVideoQualityOptions().findIndex(
            option => option.value === exportSettings.videoQuality
        ) === -1
    ) {
        exportSettings.videoQuality = 'high';
    }
    return exportSettings;
}

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
        editorThemeKey: DEFAULT_EDITOR_THEME_KEY,
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

/**
 * @returns {boolean}
 */
export function getShouldLimitNumberOfWebworkersSetting() {
    const value = localStorage.getItem(
        USER_LIMIT_NUMBER_OF_WEBWORKERS_SETTING_KEY
    );
    return !value || value === '1';
}

/**
 *
 * @param {boolean} shouldLimitNumberOfWebworkers
 */
export function setLimitNumberOfWebworkersSetting(
    shouldLimitNumberOfWebworkers
) {
    const value = shouldLimitNumberOfWebworkers ? '1' : '0';
    localStorage.setItem(USER_LIMIT_NUMBER_OF_WEBWORKERS_SETTING_KEY, value);
}

export default {
    getPalettes,
    savePalettes,
    getGlobalSettings,
    saveGlobalSettings,
    saveExportSettings,
    getExportSettings,
};
