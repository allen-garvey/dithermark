App.ColorDitherModeFunctions = (function(PixelMath, ColorDitherModes){
    function identity(item){
        return item;
    }

    //hsl values have to be between 0.0-1.0 for 
    //comparing distances to work correctly
    function pixelToHsl(pixel){
        let ret = new Uint16Array(3);
        ret[0] = PixelMath.hue(pixel);
        ret[1] = PixelMath.saturation(pixel);
        ret[2] = PixelMath.lightness(pixel);
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

    function distanceHueLightness(item1, item2){
        const dist1 = hueDistance(item1[0], item2[0]) / 359;
        const dist2 = (item1[2] - item2[2]) / 255;

        return dist1 * dist1 + dist2 * dist2;
    }

    function distanceHslWeighted(item1, item2){
        const hueDist = hueDistance(item1[0], item2[0]) / 359;
        const satDist = (item1[1] - item2[1]) / 100;
        const lighnesstDist = (item1[2] - item2[2]) / 255;

        return hueDist * hueDist * 8 + satDist * satDist + lighnesstDist * lighnesstDist * 32;
    }


    function distance3d(item1, item2){
        const dist1 = item1[0] - item2[0];
        const dist2 = item1[1] - item2[1];
        const dist3 = item1[2] - item2[2];

        return dist1 * dist1 + dist2 * dist2 + dist3 * dist3;
    }

    //rgb with correction for luma based on: http://www.tannerhelland.com/3643/grayscale-image-algorithm-vb6/
    function distanceRgbWeighted(item1, item2){
        const distR = item1[0] - item2[0];
        const distG = item1[1] - item2[1];
        const distB = item1[2] - item2[2];

        return distR * distR * 3 + distG * distG * 6 + distB * distB;
    }


    /**
     * Functions for error prop dither
    */

    function incrementUInt8Value(value, amount){
        const adjustedValue = value + amount;
        if(adjustedValue > 255){
            return 255;
        }
        if(adjustedValue < 0){
            return 0;
        }

        return adjustedValue;
    }

    function incrementLightness(lightnessValue, incrementValues){
        return incrementUInt8Value(lightnessValue, incrementValues[0]);
    }

    function incrementRgb(rgbValue, incrementValues){
        return [
            incrementUInt8Value(rgbValue[0], incrementValues[0]),
            incrementUInt8Value(rgbValue[1], incrementValues[1]),
            incrementUInt8Value(rgbValue[2], incrementValues[2]),
        ];
    }

    function errorAmount1d(expectedValue, actualValue, buffer){
        buffer[0] = expectedValue - actualValue;
        return buffer;
    }

    function errorAmount2d(expectedValues, actualValues, buffer){
        buffer[0] = expectedValues[0] - actualValues[0];
        buffer[1] = expectedValues[1] - actualValues[1];
        return buffer;
    }

    function errorAmount3d(expectedValues, actualValues, buffer){
        buffer[0] = expectedValues[0] - actualValues[0];
        buffer[1] = expectedValues[1] - actualValues[1];
        buffer[2] = expectedValues[2] - actualValues[2];
        return buffer;
    }
    
    
    let ret = {};
    ret[ColorDitherModes.get('LIGHTNESS').id] = {
        pixelValue: PixelMath.lightness,
        distance: distance1d,
        dimensions: 1,
        incrementValue: incrementLightness,
        errorAmount: errorAmount1d,
    };
    ret[ColorDitherModes.get('HUE').id] = {
        pixelValue: PixelMath.hue,
        distance: hueDistance,
        dimensions: 1,
    };
    ret[ColorDitherModes.get('HUE_LIGHTNESS').id] = {
        pixelValue: pixelToHsl,
        distance: distanceHueLightness,
        dimensions: 2,
    };
    ret[ColorDitherModes.get('HSL_WEIGHTED').id] = {
        pixelValue: pixelToHsl,
        distance: distanceHslWeighted,
        dimensions: 3,
    };
    ret[ColorDitherModes.get('RGB').id] = {
        pixelValue: identity,
        distance: distance3d,
        dimensions: 3,
        incrementValue: incrementRgb,
        errorAmount: errorAmount3d,
    };

    ret[ColorDitherModes.get('RGB_WEIGHTED').id] = {
        pixelValue: identity,
        distance: distanceRgbWeighted,
        dimensions: 3,
        incrementValue: incrementRgb,
        errorAmount: errorAmount3d,
    };

    return ret;
})(App.PixelMath, App.ColorDitherModes);