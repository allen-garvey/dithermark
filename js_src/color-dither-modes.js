App.ColorDitherModes = (function(){
    let ret = new Map();
    ret.set('RGB', {id: 0, title: 'RGB'});
    ret.set('HSL', {id: 5, title: 'HSL'});
    ret.set('HUE', {id: 1, title: 'Hue'});
    ret.set('HUE_LIGHTNESS', {id: 2, title: 'Hue & Lightness'});
    ret.set('HUE_SATURATION', {id: 3, title: 'Hue & Saturation'});
    ret.set('EXPERIMENT', {id: 4, title: 'Hue & Saturation2'});
    
    return ret;
})();