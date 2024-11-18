float quick_distance(vec3 pixel1, vec3 pixel2){
    float lightness1 = lightness(pixel1);
    float lightness2 = lightness(pixel2);
    return abs(lightness1 - lightness2);
}