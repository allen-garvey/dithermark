App.ColorDitherModes = (function(){
    let ret = new Map();
    ret.set('LIGHTNESS', {id:3, title: 'Lightness'});
    ret.set('HUE', {id:4, title: 'Hue'});
    ret.set('HUE_LIGHTNESS', {id: 2, title: 'Hue & Lightness'});
    ret.set('HSL_WEIGHTED', {id: 1, title: 'Weighted HSL'});
    ret.set('RGB', {id: 0, title: 'RGB'});
    return ret;
})();