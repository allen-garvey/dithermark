float quick_distance(vec3 pixel1, vec3 pixel2){
    vec3 hsl1 = rgb2hsl(pixel1);
    vec3 hsl2 = rgb2hsl(pixel2);
    vec2 hlDist = vec2(hue_distance(hsl1.x, hsl2.x), hsl1.z - hsl2.z);

    if(hsl1.y < 0.3){
        float fraction = hsl1.y / 0.3;
        return dot(vec2(2.0 * fraction, (1.0 - fraction)), hlDist*hlDist);
    }
    return dot(vec2(32.0, 1.0), hlDist*hlDist);
}