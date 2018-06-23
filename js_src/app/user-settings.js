//module for saving and retrieving user settings in localStorage
App.UserSettings = (function(localStorage){
    const USER_SAVED_PALETTES_KEY = 'user-saved-palettes';
    const USER_GLOBAL_SETTINGS_KEY = 'user-global-settings';

    function savePalettes(palettes){
        localStorage.setItem(USER_SAVED_PALETTES_KEY, JSON.stringify(palettes));
    }

    function getSettingOrDefault(key, defaultValue){
        const setting = localStorage.getItem(key);
        if(!setting){
            return defaultValue;
        }
        return JSON.parse(setting);
    }

    function saveGlobalSettings(globalSettings){
        localStorage.setItem(USER_GLOBAL_SETTINGS_KEY, JSON.stringify(globalSettings));
    }

    function defaultGlobalSettings(areControlsPinned){
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

    function mergeObjectWithDefault(object, defaultValues){
        Object.keys(defaultValues).forEach((key)=>{
            if(!(key in object)){
                object[key] = defaultValues[key];
            }
        });

        return object;
    }

    function getGlobalSettings(areControlsPinned){
        const globalSettings = localStorage.getItem(USER_GLOBAL_SETTINGS_KEY);
        const defaultSettings = defaultGlobalSettings(areControlsPinned);
        if(!globalSettings){
            return defaultSettings;
        }
        return mergeObjectWithDefault(JSON.parse(globalSettings), defaultSettings);
    }


    return {
        getPalettes: ()=>{ return getSettingOrDefault(USER_SAVED_PALETTES_KEY, []); },
        savePalettes,
        getGlobalSettings,
        saveGlobalSettings,
    };
})(window.localStorage);