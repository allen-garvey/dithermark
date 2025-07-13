#version 300 es
uniform sampler2D u_background_texture;
uniform int u_colors_array_length;
uniform vec3 u_colors_array[<?= COLOR_DITHER_MAX_COLORS; ?>];

#{{lightnessFunction}}
#{{hslFunctions}}
#{{distanceFunction}}

// find closest color to backgroundPixel that is darker to use for outline color
vec3 get_dark_outline_color(vec3 backgroundPixel){
    vec3 outlineColor = backgroundPixel;
    float backgroundLightness = lightness(backgroundPixel);
    
    //arbitrarily large number
    float shortestDistance = 99999.99;
    for(int i=0;i<<?= COLOR_DITHER_MAX_COLORS; ?>;i++){
        if(i >= u_colors_array_length){
            break;
        }
        vec3 currentColor = u_colors_array[i];
        float currentDistance = quick_distance(backgroundPixel, currentColor);
        if(lightness(currentColor) < backgroundLightness && currentDistance < shortestDistance){
            shortestDistance = currentDistance;
            outlineColor = currentColor;
        }
    }

    return outlineColor;
}