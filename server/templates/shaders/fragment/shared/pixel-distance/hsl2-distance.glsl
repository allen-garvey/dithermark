// distance for outline filter palette color mode
// prioritize hue, then lightness, then less saturation,
// since darker colors should be less saturated


float quick_distance(vec3 pixel1, vec3 pixel2){
    vec3 hsl1 = rgb2hsl(pixel1);
    vec3 hsl2 = rgb2hsl(pixel2);
    float hDist = hue_distance(hsl1.r, hsl2.r);
    vec2 slDist = hsl1.gb - hsl2.gb;  
    vec3 hslDist = vec3(hDist, slDist);

    return dot(vec3(8.0, 1.0, 4.0), hslDist * hslDist);
}