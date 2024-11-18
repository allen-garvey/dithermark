float quick_distance(vec3 pixel1, vec3 pixel2){
    vec3 hsl1 = rgb2hsl(pixel1);
    vec3 hsl2 = rgb2hsl(pixel2);
    vec3 hslDist = vec3(hue_distance(hsl1.r, hsl2.r), hsl1.gb - hsl2.gb);  
    return dot(vec3(8.0, 1.0, 32.0), hslDist * hslDist);
}