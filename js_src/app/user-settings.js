//module for saving and retrieving user settings in localStorage
App.UserSettings = (function(){
    const USER_SAVED_PALETTES_KEY = 'user-saved-palettes';

    function getPalettes(){
        const savedPalettes = localStorage.getItem(USER_SAVED_PALETTES_KEY);
        if(!savedPalettes){
            return [];
        }
        return JSON.parse(savedPalettes);
    }

    function savePalettes(palettes){
        localStorage.setItem(USER_SAVED_PALETTES_KEY, JSON.stringify(palettes));
    }


    return {
        getPalettes,
        savePalettes,
    };
})();