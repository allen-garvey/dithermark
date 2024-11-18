// fraction values of 0.1 and 0.3 seem to work best, but 0.1 is used to differentiate it from hue-lightness distance 

float quick_distance(vec3 pixel1, vec3 pixel2){
    vec3 hsl1 = rgb2hsl(pixel1);
    vec3 hsl2 = rgb2hsl(pixel2);
    float hueDist = hue_distance(hsl1.x, hsl2.x);

    if(hsl1.y < 0.07){
        float fraction = hsl1.y / 0.07;
        vec2 hlDist = vec2(hueDist, hsl1.z - hsl2.z);
        return dot(vec2(8.0 * fraction, (1.0 - fraction)), hlDist*hlDist);
    }
    return hueDist * hueDist;
}