float lightness(vec3 pixel){
    float maxVal = max(max(pixel.r, pixel.g), pixel.b);
    float minVal = min(min(pixel.r, pixel.g), pixel.b);
    return (maxVal + minVal) / 2.0;
}