precision mediump float;
    
varying vec2 v_texcoord;
uniform sampler2D u_texture;

uniform int u_colors_array_length;
uniform vec3 u_colors_array[<?= COLOR_DITHER_MAX_COLORS; ?>];
uniform float u_dither_r_coefficient;

uniform sampler2D u_bayer_texture;
uniform float u_bayer_texture_dimensions;

#{{lightnessFunction}}

#{{hslFunctions}}

#{{distanceFunction}}

void main(){
    vec4 pixel = texture2D(u_texture, v_texcoord);
    vec3 adjustedPixel = pixel.rgb;
    
    float shortestDistance = 9999.9;
    vec3 outputPixel = adjustedPixel;
    
    for(int i=0;i<<?= COLOR_DITHER_MAX_COLORS; ?>;i++){
        if(i >= u_colors_array_length){
            break;
        }
        vec3 currentColor = u_colors_array[i];
        float currentDistance = quick_distance(adjustedPixel, currentColor);
        if(currentDistance < shortestDistance){
            shortestDistance = currentDistance;
            outputPixel = currentColor;
        }
    }
    
    vec2 bayerPixelCoord = vec2(gl_FragCoord.xy / vec2(u_bayer_texture_dimensions));
    vec4 bayerPixel = texture2D(u_bayer_texture, bayerPixelCoord);
    float bayerValue = bayerPixel.r;
    float bayerPercentage = 1.0 - (bayerValue * u_dither_r_coefficient);
    
    // so we don't divide by 0
    if(shortestDistance > 0.0){
        float greatestAllowedDistance = shortestDistance;
        for(int i=0;i<<?= COLOR_DITHER_MAX_COLORS; ?>;i++){
            if(i >= u_colors_array_length){
                break;
            }
            vec3 currentColor = u_colors_array[i];
            float currentDistance = quick_distance(adjustedPixel, currentColor);
            if(currentDistance > greatestAllowedDistance && currentDistance / shortestDistance * bayerPercentage < 1.0){
                greatestAllowedDistance = currentDistance;
                outputPixel = currentColor;
            }
        }
    }
    
    gl_FragColor = vec4(outputPixel, pixel.a);
}