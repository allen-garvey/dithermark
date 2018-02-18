App.ColorDitherModes = (function(){
    let ret = new Map();
    ret.set('RGB', {id: 0, title: 'RGB'});
    ret.set('HSL', {id: 1, title: 'Weighted HSL'});
    ret.set('HUE_LIGHTNESS', {id: 2, title: 'Hue & Lightness'});
    ret.set('LIGHTNESS', {id:3, title: 'Lightness'});
    return ret;
})();