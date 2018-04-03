App.ColorDitherModeFunctions = (function(PixelMath, ColorDitherModes){
    function identity(item){
        return item;
    }

    //hsl values have to be between 0.0-1.0 for 
    //comparing distances to work correctly
    function pixelToHsl(pixel){
        let ret = new Float32Array(3);
        ret[0] = PixelMath.hue(pixel) / 359;
        ret[1] = PixelMath.saturation(pixel) / 100;
        ret[2] = PixelMath.lightness(pixel) / 255;
        return ret;
    }

    function hueDistance(hue1, hue2){
        const dist1 = distance1d(hue1, hue2);
        //since hue is circular
        return Math.min(dist1, 359 - dist1);
    }

    function distance1d(value1, value2){
        return Math.abs(value1 - value2);
    }

    function distance2d(item1, item2){
        const dist1 = item1[0] - item2[0];
        const dist2 = item1[1] - item2[1];

        return dist1 * dist1 + dist2 * dist2;
    }

    function distance3d(item1, item2){
        const dist1 = item1[0] - item2[0];
        const dist2 = item1[1] - item2[1];
        const dist3 = item1[2] - item2[2];

        return dist1 * dist1 + dist2 * dist2 + dist3 * dist3;
    }
    
    
    let ret = {};
    ret[ColorDitherModes.get('LIGHTNESS').id] = {
        pixelValue: PixelMath.lightness,
        distance: distance1d,
    };
    ret[ColorDitherModes.get('HUE').id] = {
        pixelValue: PixelMath.hue,
        distance: hueDistance,
    };
    ret[ColorDitherModes.get('HUE_LIGHTNESS').id] = {
        pixelValue: pixelToHsl,
        distance: distance2d,
    };
    ret[ColorDitherModes.get('HSL_WEIGHTED').id] = {
        pixelValue: pixelToHsl,
        distance: distance3d, //TODO, change to weighted distance
    };
    ret[ColorDitherModes.get('RGB').id] = {
        pixelValue: identity,
        distance: distance3d,
    };

    return ret;
})(App.PixelMath, App.ColorDitherModes);