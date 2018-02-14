App.ColorDitherModes = (function(){
    let ret = new Map();
    ret.set('RGB', {id: 0, title: 'RGB'});
    ret.set('HUE', {id: 1, title: 'Hue'});
    
    return ret;
})();