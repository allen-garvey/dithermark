App.ColorQuantizationModes = (function(){
    let ret = new Map();
    ret.set('PMC_MEDIAN', {id: 1, title: 'Perceptual Median Cut (Default)'});
    ret.set('PMC_SUPER_MEDIAN', {id: 2, title: 'Perceptual Median Cut (Monotone)'});
    ret.set('PMC_UNIFORM', {id: 3, title: 'Perceptual Median Cut (Uniform)'});
    ret.set('MEDIAN_CUT', {id: 4, title: 'Median Cut'});
    return ret;
})();